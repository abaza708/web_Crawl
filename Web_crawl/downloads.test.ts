import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("downloads.create", () => {
  it("creates a download job and returns jobId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.downloads.create({
      domain: "example.com",
    });

    expect(result).toHaveProperty("jobId");
    expect(typeof result.jobId).toBe("number");
    expect(result.jobId).toBeGreaterThan(0);
  });

  it("accepts domain with protocol", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.downloads.create({
      domain: "https://example.com",
    });

    expect(result).toHaveProperty("jobId");
    expect(typeof result.jobId).toBe("number");
  });
});

describe("downloads.list", () => {
  it("returns list of download jobs for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a job first
    await caller.downloads.create({ domain: "test.com" });

    const jobs = await caller.downloads.list();

    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
    
    const job = jobs[0];
    expect(job).toHaveProperty("id");
    expect(job).toHaveProperty("domain");
    expect(job).toHaveProperty("status");
    expect(job).toHaveProperty("userId");
    expect(job?.userId).toBe(ctx.user?.id);
  });
});

describe("downloads.getJob", () => {
  it("returns job details for valid jobId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { jobId } = await caller.downloads.create({ domain: "test.com" });
    const job = await caller.downloads.getJob({ jobId });

    expect(job).toBeDefined();
    expect(job.id).toBe(jobId);
    expect(job.domain).toBe("test.com");
    expect(job.userId).toBe(ctx.user.id);
  });

  it("throws NOT_FOUND for non-existent job", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.downloads.getJob({ jobId: 999999 })
    ).rejects.toThrow("Job not found");
  });

  it("throws FORBIDDEN when accessing another user's job", async () => {
    const ctx1 = createAuthContext();
    const caller1 = appRouter.createCaller(ctx1);

    // Create job as user 1
    const { jobId } = await caller1.downloads.create({ domain: "test.com" });

    // Try to access as user 2
    const ctx2 = createAuthContext();
    ctx2.user!.id = 2;
    ctx2.user!.openId = "different-user";
    const caller2 = appRouter.createCaller(ctx2);

    await expect(
      caller2.downloads.getJob({ jobId })
    ).rejects.toThrow("Access denied");
  });
});

describe("downloads.getFiles", () => {
  it("returns empty array for new job with no files", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { jobId } = await caller.downloads.create({ domain: "test.com" });
    const files = await caller.downloads.getFiles({ jobId });

    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBe(0);
  });

  it("throws NOT_FOUND for non-existent job", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.downloads.getFiles({ jobId: 999999 })
    ).rejects.toThrow("Job not found");
  });

  it("throws FORBIDDEN when accessing another user's job files", async () => {
    const ctx1 = createAuthContext();
    const caller1 = appRouter.createCaller(ctx1);

    const { jobId } = await caller1.downloads.create({ domain: "test.com" });

    const ctx2 = createAuthContext();
    ctx2.user!.id = 2;
    ctx2.user!.openId = "different-user";
    const caller2 = appRouter.createCaller(ctx2);

    await expect(
      caller2.downloads.getFiles({ jobId })
    ).rejects.toThrow("Access denied");
  });
});
