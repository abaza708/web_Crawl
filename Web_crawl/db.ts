import { eq } from "drizzle-orm";
import { downloadJobs, downloadedFiles } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Download job queries
export async function createDownloadJob(userId: number, domain: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(downloadJobs).values({
    userId,
    domain,
    status: "pending",
  });

  return Number(result[0].insertId);
}

export async function getDownloadJobsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(downloadJobs).where(eq(downloadJobs.userId, userId)).orderBy(downloadJobs.createdAt);
}

export async function getDownloadJobById(jobId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(downloadJobs).where(eq(downloadJobs.id, jobId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDownloadJobStatus(
  jobId: number,
  status: "pending" | "processing" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(downloadJobs).set({ status, errorMessage }).where(eq(downloadJobs.id, jobId));
}

export async function updateDownloadJobProgress(jobId: number, totalFiles: number, downloadedFiles: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(downloadJobs).set({ totalFiles, downloadedFiles }).where(eq(downloadJobs.id, jobId));
}

export async function addDownloadedFile(jobId: number, url: string, fileKey: string, s3Url: string, fileType?: string, fileSize?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(downloadedFiles).values({
    jobId,
    url,
    fileKey,
    s3Url,
    fileType,
    fileSize,
  });
}

export async function getDownloadedFilesByJobId(jobId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(downloadedFiles).where(eq(downloadedFiles.jobId, jobId)).orderBy(downloadedFiles.createdAt);
}
