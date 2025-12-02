import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createDownloadJob,
  getDownloadJobsByUserId,
  getDownloadJobById,
  getDownloadedFilesByJobId,
} from "./db";
import { crawlAndDownload } from "./crawler";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  downloads: router({
    // Create a new download job
    create: protectedProcedure
      .input(z.object({ domain: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const jobId = await createDownloadJob(ctx.user.id, input.domain);
        
        // Start crawling in background (don't await)
        crawlAndDownload(jobId, input.domain).catch((error) => {
          console.error(`Background crawl failed for job ${jobId}:`, error);
        });

        return { jobId };
      }),

    // List all download jobs for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return getDownloadJobsByUserId(ctx.user.id);
    }),

    // Get details of a specific download job
    getJob: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const job = await getDownloadJobById(input.jobId);
        
        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }
        
        if (job.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        return job;
      }),

    // Get all downloaded files for a job
    getFiles: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const job = await getDownloadJobById(input.jobId);
        
        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }
        
        if (job.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        return getDownloadedFilesByJobId(input.jobId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
