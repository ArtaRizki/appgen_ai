import {
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(), // 'admin' | 'user'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Tools ───────────────────────────────────────────────────────────────────
export const tools = pgTable('tools', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  type: varchar('type', { length: 100 }).notNull(), // 'scraper' | 'generator' | 'finder'
  icon: varchar('icon', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  config: jsonb('config'), // tool-specific configuration
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── User Tool Access ─────────────────────────────────────────────────────────
export const userToolAccess = pgTable('user_tool_access', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  toolId: varchar('tool_id', { length: 36 })
    .references(() => tools.id, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(), // 'admin' | 'user' | 'viewer'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Tool Executions (shared history for all tools) ───────────────────────────
export const toolExecutions = pgTable('tool_executions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id, { onDelete: 'set null' }),
  toolId: varchar('tool_id', { length: 36 })
    .references(() => tools.id, { onDelete: 'cascade' })
    .notNull(),
  input: jsonb('input'),
  output: jsonb('output'),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // 'pending' | 'processing' | 'success' | 'error'
  error: text('error'),
  duration: integer('duration'), // milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Scraper Jobs (specific to data scraper tool) ────────────────────────────
export const scraperJobs = pgTable('scraper_jobs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  executionId: varchar('execution_id', { length: 36 })
    .references(() => toolExecutions.id, { onDelete: 'cascade' })
    .notNull(),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'csv' | 'api' | 'web'
  sourceUrl: text('source_url'),
  fileName: varchar('file_name', { length: 255 }),
  rowsImported: integer('rows_imported').default(0),
  rowsFailed: integer('rows_failed').default(0),
  totalRows: integer('total_rows').default(0),
  mappingConfig: jsonb('mapping_config'),
  previewData: jsonb('preview_data'), // first 10 rows for preview
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
export type ToolExecution = typeof toolExecutions.$inferSelect;
export type NewToolExecution = typeof toolExecutions.$inferInsert;
export type ScraperJob = typeof scraperJobs.$inferSelect;
export type NewScraperJob = typeof scraperJobs.$inferInsert;
