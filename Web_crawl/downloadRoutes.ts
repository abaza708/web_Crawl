import type { Express } from "express";
import { getDownloadJobById, getDownloadedFilesByJobId } from "./db";
import { streamZipToResponse } from "./zipGenerator";
import { sdk } from "./_core/sdk";

/**
 * Register custom download routes
 */
export function registerDownloadRoutes(app: Express) {
  /**
   * Download all files from a job as ZIP
   * GET /api/download/:jobId/zip
   */
  app.get("/api/download/:jobId/zip", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId || "0", 10);

      if (!jobId || isNaN(jobId)) {
        res.status(400).json({ error: "Invalid job ID" });
        return;
      }

      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Get job details
      const job = await getDownloadJobById(jobId);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      // Verify ownership
      if (job.userId !== user.id) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      // Check if job is completed
      if (job.status !== "completed") {
        res.status(400).json({ error: "Job is not completed yet" });
        return;
      }

      // Get all files
      const files = await getDownloadedFilesByJobId(jobId);
      if (!files || files.length === 0) {
        res.status(404).json({ error: "No files found" });
        return;
      }

      // Stream ZIP to response
      await streamZipToResponse(files, job.domain, res);
    } catch (error) {
      console.error("ZIP download error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate ZIP" });
      }
    }
  });
}
