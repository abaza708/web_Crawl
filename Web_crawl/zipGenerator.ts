import archiver from "archiver";
import axios from "axios";
import { Readable } from "stream";
import type { Response } from "express";

interface FileToZip {
  url: string;
  filename: string;
}

/**
 * Generate a filename from URL
 */
export function getFilenameFromUrl(url: string, index: number): string {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    
    // Remove leading slash
    if (pathname.startsWith("/")) {
      pathname = pathname.substring(1);
    }
    
    // If empty or just a slash, use index.html
    if (!pathname || pathname === "") {
      return "index.html";
    }
    
    // Replace slashes with underscores to flatten structure
    const filename = pathname.replace(/\//g, "_");
    
    // If no extension, add index
    if (!filename.includes(".")) {
      return `${filename}_${index}.html`;
    }
    
    return filename || `file_${index}`;
  } catch {
    return `file_${index}`;
  }
}

/**
 * Stream ZIP archive of files to response
 */
export async function streamZipToResponse(
  files: Array<{ url: string; s3Url: string }>,
  domain: string,
  res: Response
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Set response headers
    const sanitizedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, "_");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedDomain}_files.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // Handle archive errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      reject(err);
    });

    // Handle archive completion
    archive.on("end", () => {
      resolve();
    });

    // Add files to archive
    const addFilesSequentially = async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        try {
          // Download file from S3
          const response = await axios.get(file.s3Url, {
            responseType: "stream",
            timeout: 30000,
          });

          const filename = getFilenameFromUrl(file.url, i);

          // Add stream to archive
          archive.append(response.data as Readable, { name: filename });
        } catch (error) {
          console.error(`Failed to add file ${file.url} to archive:`, error);
          // Continue with other files even if one fails
        }
      }

      // Finalize archive
      await archive.finalize();
    };

    addFilesSequentially().catch(reject);
  });
}
