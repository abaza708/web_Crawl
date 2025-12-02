import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";
import { storagePut } from "./storage";
import {
  addDownloadedFile,
  updateDownloadJobProgress,
  updateDownloadJobStatus,
} from "./db";

interface CrawlResult {
  url: string;
  fileKey: string;
  s3Url: string;
  fileType?: string;
  fileSize?: number;
}

/**
 * Normalize URL to avoid duplicates
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash and hash
    return parsed.origin + parsed.pathname.replace(/\/$/, "") + parsed.search;
  } catch {
    return url;
  }
}

/**
 * Extract all file URLs from a webpage
 */
async function extractFileUrls(baseUrl: string): Promise<Set<string>> {
  const urls = new Set<string>();
  const visited = new Set<string>();
  const toVisit = [baseUrl];

  const baseDomain = new URL(baseUrl).hostname;

  while (toVisit.length > 0 && visited.size < 100) {
    const currentUrl = toVisit.shift();
    if (!currentUrl || visited.has(currentUrl)) continue;

    visited.add(currentUrl);

    try {
      const response = await axios.get(currentUrl, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WebsiteDownloaderBot/1.0)",
        },
      });

      const contentType = response.headers["content-type"] || "";

      // Only parse HTML pages
      if (contentType.includes("text/html")) {
        const $ = cheerio.load(response.data);

        // Extract links to other pages (for crawling)
        $("a[href]").each((_, element) => {
          const href = $(element).attr("href");
          if (!href) return;

          try {
            const absoluteUrl = new URL(href, currentUrl).href;
            const urlObj = new URL(absoluteUrl);

            // Only crawl same domain
            if (urlObj.hostname === baseDomain && !visited.has(absoluteUrl)) {
              toVisit.push(normalizeUrl(absoluteUrl));
            }
          } catch {
            // Invalid URL, skip
          }
        });

        // Extract all resource URLs
        const selectors = [
          "link[href]",
          "script[src]",
          "img[src]",
          "source[src]",
          "video[src]",
          "audio[src]",
          "iframe[src]",
        ];

        selectors.forEach((selector) => {
          $(selector).each((_, element) => {
            const attr = selector.includes("href") ? "href" : "src";
            const url = $(element).attr(attr);
            if (!url) return;

            try {
              const absoluteUrl = new URL(url, currentUrl).href;
              urls.add(absoluteUrl);
            } catch {
              // Invalid URL, skip
            }
          });
        });

        // Add the HTML page itself
        urls.add(currentUrl);
      } else {
        // Non-HTML resource, add it directly
        urls.add(currentUrl);
      }
    } catch (error) {
      console.error(`Failed to fetch ${currentUrl}:`, error);
    }
  }

  return urls;
}

/**
 * Download a single file and upload to S3
 */
async function downloadFile(url: string, jobId: number): Promise<CrawlResult | null> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebsiteDownloaderBot/1.0)",
      },
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers["content-type"] || "application/octet-stream";
    
    // Generate file key with job ID and URL hash
    const urlHash = Buffer.from(url).toString("base64").replace(/[/+=]/g, "").substring(0, 16);
    const timestamp = Date.now();
    const extension = getExtensionFromUrl(url) || getExtensionFromContentType(contentType);
    const fileKey = `downloads/${jobId}/${timestamp}-${urlHash}${extension}`;

    // Upload to S3
    const { url: s3Url } = await storagePut(fileKey, buffer, contentType);

    return {
      url,
      fileKey,
      s3Url,
      fileType: contentType,
      fileSize: buffer.length,
    };
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
    return null;
  }
}

/**
 * Get file extension from URL
 */
function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match ? `.${match[1]}` : "";
  } catch {
    return "";
  }
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
    "text/javascript": ".js",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "application/json": ".json",
    "application/xml": ".xml",
    "text/xml": ".xml",
    "application/pdf": ".pdf",
  };

  const baseType = contentType.split(";")[0]?.trim();
  return typeMap[baseType || ""] || "";
}

/**
 * Crawl website and download all files
 */
export async function crawlAndDownload(jobId: number, domain: string): Promise<void> {
  try {
    // Update status to processing
    await updateDownloadJobStatus(jobId, "processing");

    // Ensure domain has protocol
    const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;

    // Extract all file URLs
    const fileUrls = await extractFileUrls(baseUrl);
    const totalFiles = fileUrls.size;

    await updateDownloadJobProgress(jobId, totalFiles, 0);

    // Download all files
    let downloadedCount = 0;
    const urlArray = Array.from(fileUrls);

    for (const url of urlArray) {
      const result = await downloadFile(url, jobId);
      
      if (result) {
        await addDownloadedFile(
          jobId,
          result.url,
          result.fileKey,
          result.s3Url,
          result.fileType,
          result.fileSize
        );
        downloadedCount++;
        await updateDownloadJobProgress(jobId, totalFiles, downloadedCount);
      }
    }

    // Update status to completed
    await updateDownloadJobStatus(jobId, "completed");
  } catch (error) {
    console.error(`Crawl job ${jobId} failed:`, error);
    await updateDownloadJobStatus(
      jobId,
      "failed",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
