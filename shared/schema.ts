import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - extended for Replit Auth + SaaS features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Auth provider fields
  authProvider: varchar("auth_provider", { length: 20 }).default("replit"), // replit, email
  passwordHash: varchar("password_hash"),
  // Email verification
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  // Password reset
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams/Organizations table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("trialing"), // trialing, active, canceled, past_due
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("starter"), // starter, growth, scale, pro_scale, enterprise
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodEnd: timestamp("current_period_end"),
  suggestionsUsed: integer("suggestions_used").default(0),
  suggestionsLimit: integer("suggestions_limit").default(20), // Based on plan
  sourcesLimit: integer("sources_limit").default(1), // Based on plan
  seatsLimit: integer("seats_limit").default(5), // Based on plan
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team memberships - links users to teams with roles
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"), // owner, admin, member
  canApprove: boolean("can_approve").default(false), // Permission to approve suggestions
  createdAt: timestamp("created_at").defaultNow(),
});

// Team invitations
export const teamInvitations = pgTable("team_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  email: varchar("email").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  invitedBy: varchar("invited_by").references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connected integrations per team
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // slack, notion, google_drive, zoom, google_meet
  status: varchar("status", { length: 20 }).default("pending"), // pending, connected, error
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  metadata: jsonb("metadata"), // Store workspace IDs, channel selections, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suggestions - now linked to teams
export const suggestions = pgTable("suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 50 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  knowledgeType: varchar("knowledge_type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  proposedContent: text("proposed_content").notNull(),
  currentContent: text("current_content"),
  confidence: integer("confidence").notNull(),
  sourceLink: text("source_link").notNull(),
  notionPageId: text("notion_page_id"),
  notionPageUrl: text("notion_page_url").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  aiReasoning: text("ai_reasoning"),
  contentFingerprint: varchar("content_fingerprint", { length: 64 }), // For duplicate detection
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  index("idx_suggestions_fingerprint").on(table.contentFingerprint),
  index("idx_suggestions_team_status").on(table.teamId, table.status),
]);

// Activity log - now linked to teams
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  suggestionId: varchar("suggestion_id").references(() => suggestions.id),
  status: varchar("status", { length: 20 }).notNull(),
  title: text("title").notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  userId: varchar("user_id"),
  userName: text("user_name"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Background jobs queue - persistent for scaling
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // slack_message, drive_file, zoom_transcript, meet_transcript
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, processing, completed, failed
  priority: integer("priority").notNull().default(0), // Higher = more urgent
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  data: jsonb("data").notNull(), // Job-specific payload
  error: text("error"),
  processedBy: varchar("processed_by"), // Worker ID that claimed this job
  lockedAt: timestamp("locked_at"), // When job was claimed
  completedAt: timestamp("completed_at"),
  scheduledFor: timestamp("scheduled_for").defaultNow(), // For delayed/retry scheduling
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_jobs_status_scheduled").on(table.status, table.scheduledFor),
  index("idx_jobs_team").on(table.teamId),
]);

// Error logs for monitoring
export const errorLogs = pgTable("error_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  severity: varchar("severity", { length: 20 }).notNull().default("error"), // info, warning, error, critical
  category: varchar("category", { length: 50 }).notNull(), // job_failure, slack_disconnect, notion_error, ai_error, etc.
  message: text("message").notNull(),
  context: jsonb("context"), // Additional context like job ID, team name, etc.
  stack: text("stack"), // Stack trace if available
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  notificationSent: boolean("notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_error_logs_severity").on(table.severity, table.createdAt),
  index("idx_error_logs_category").on(table.category),
  index("idx_error_logs_team").on(table.teamId),
]);

// Settings - now linked to teams
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  autoApproveEnabled: boolean("auto_approve_enabled").notNull().default(false),
  confidenceThreshold: integer("confidence_threshold").notNull().default(95),
  adminOnlyApprovals: boolean("admin_only_approvals").notNull().default(true),
  slackNotificationsEnabled: boolean("slack_notifications_enabled").notNull().default(true),
  emailDigestEnabled: boolean("email_digest_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  suggestionsUsed: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertTeamInvitationSchema = createInsertSchema(teamInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  lockedAt: true,
  processedBy: true,
});

export const insertErrorLogSchema = createInsertSchema(errorLogs).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertTeamInvitation = z.infer<typeof insertTeamInvitationSchema>;
export type TeamInvitation = typeof teamInvitations.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type Suggestion = typeof suggestions.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;
export type ErrorLog = typeof errorLogs.$inferSelect;

// Plan configurations
export const PLAN_CONFIGS = {
  starter: {
    name: "Starter",
    price: 99,
    suggestionsLimit: 20,
    sourcesLimit: 1,
    seatsLimit: 5,
    features: ["Manual approvals", "1 source integration", "Email support"],
  },
  growth: {
    name: "Growth",
    price: 299,
    suggestionsLimit: 75,
    sourcesLimit: 2,
    seatsLimit: 15,
    features: ["Auto-approvals", "2 source integrations", "Priority support"],
  },
  scale: {
    name: "Scale",
    price: 599,
    suggestionsLimit: 200,
    sourcesLimit: 4,
    seatsLimit: 30,
    features: ["All 4 sources", "API access", "Dedicated support"],
  },
  pro_scale: {
    name: "Pro Scale",
    price: 999,
    suggestionsLimit: -1, // unlimited
    sourcesLimit: -1, // unlimited
    seatsLimit: 75,
    features: ["Unlimited suggestions", "Audit logs", "Custom integrations"],
  },
  enterprise: {
    name: "Enterprise",
    price: -1, // custom
    suggestionsLimit: -1,
    sourcesLimit: -1,
    seatsLimit: -1,
    features: ["Everything in Pro Scale", "SSO", "SLAs", "Dedicated account manager"],
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIGS;
