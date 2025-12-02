import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Download jobs table - tracks website download requests
 */
export const downloadJobs = mysqlTable("download_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  totalFiles: int("totalFiles").default(0).notNull(),
  downloadedFiles: int("downloadedFiles").default(0).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DownloadJob = typeof downloadJobs.$inferSelect;
export type InsertDownloadJob = typeof downloadJobs.$inferInsert;

/**
 * Downloaded files table - stores metadata for each downloaded file
 */
export const downloadedFiles = mysqlTable("downloaded_files", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  s3Url: varchar("s3Url", { length: 1024 }).notNull(),
  fileType: varchar("fileType", { length: 100 }),
  fileSize: int("fileSize"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DownloadedFile = typeof downloadedFiles.$inferSelect;
export type InsertDownloadedFile = typeof downloadedFiles.$inferInsert;