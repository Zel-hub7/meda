import { 
  type User, type UpsertUser,
  type Team, type InsertTeam,
  type TeamMember, type InsertTeamMember,
  type TeamInvitation, type InsertTeamInvitation,
  type Integration, type InsertIntegration,
  type Suggestion, type InsertSuggestion, 
  type ActivityLog, type InsertActivityLog, 
  type Settings, type InsertSettings,
  type Job, type InsertJob,
  type ErrorLog, type InsertErrorLog,
  users, teams, teamMembers, teamInvitations, integrations,
  suggestions, activityLog, settings, jobs, errorLogs
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email auth operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createEmailUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
  }): Promise<User>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<void>;
  setVerificationToken(userId: string, token: string, expires: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  getTeamByOwner(ownerId: string): Promise<Team | undefined>;
  
  // Team operations
  getTeam(id: string): Promise<Team | undefined>;
  getTeamBySlug(slug: string): Promise<Team | undefined>;
  getTeamsByUserId(userId: string): Promise<Team[]>;
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, data: Partial<InsertTeam>): Promise<Team | undefined>;
  updateTeamSubscription(id: string, data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    currentPeriodEnd?: Date;
    suggestionsLimit?: number;
    sourcesLimit?: number;
    seatsLimit?: number;
  }): Promise<Team | undefined>;
  incrementSuggestionsUsed(teamId: string): Promise<void>;
  resetSuggestionsUsed(teamId: string): Promise<void>;
  
  // Team member operations
  getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]>;
  getTeamMember(teamId: string, userId: string): Promise<TeamMember | undefined>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  removeTeamMember(id: string): Promise<void>;
  
  // Team invitation operations
  getTeamInvitations(teamId: string): Promise<TeamInvitation[]>;
  getInvitationByToken(token: string): Promise<TeamInvitation | undefined>;
  createInvitation(invitation: InsertTeamInvitation): Promise<TeamInvitation>;
  acceptInvitation(id: string): Promise<TeamInvitation | undefined>;
  deleteInvitation(id: string): Promise<void>;
  
  // Integration operations
  getIntegrations(teamId: string): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  getIntegrationByType(teamId: string, type: string): Promise<Integration | undefined>;
  getIntegrationByWorkspaceId(type: string, workspaceId: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, data: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: string): Promise<void>;
  
  // Suggestion operations
  getSuggestions(teamId: string, filters?: { status?: string; source?: string; minConfidence?: number }): Promise<Suggestion[]>;
  getSuggestion(id: string): Promise<Suggestion | undefined>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  updateSuggestionStatus(id: string, status: string): Promise<Suggestion | undefined>;
  updateSuggestionNotionPage(id: string, data: { notionPageId: string; notionPageUrl: string; currentContent?: string }): Promise<Suggestion | undefined>;
  deleteSuggestion(id: string): Promise<void>;
  
  // Activity log operations
  getActivityLog(teamId: string, filters?: { status?: string; source?: string; limit?: number }): Promise<ActivityLog[]>;
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;
  
  // Settings operations
  getSettings(teamId: string): Promise<Settings | undefined>;
  upsertSettings(settingsData: InsertSettings): Promise<Settings>;
  
  // Job queue operations
  createJob(job: InsertJob): Promise<Job>;
  claimNextJob(workerId: string, maxPerTeam: number): Promise<Job | undefined>;
  completeJob(jobId: string): Promise<void>;
  failJob(jobId: string, error: string): Promise<void>;
  retryJob(jobId: string, scheduledFor: Date): Promise<void>;
  getJobStats(teamId: string): Promise<{ pending: number; processing: number; failed: number; completed: number }>;
  getGlobalJobStats(): Promise<{ 
    pending: number; 
    processing: number; 
    failed: number; 
    completed: number; 
    activeWorkers: number;
    teamsWithPendingJobs: number;
    avgProcessingTimeMs: number;
  }>;
  getFailedJobs(teamId: string): Promise<Job[]>;
  getRecentJobs(teamId: string, limit?: number): Promise<Job[]>;
  retryAllFailedJobs(teamId: string): Promise<number>;
  clearFailedJobs(teamId: string): Promise<number>;
  cleanupOldJobs(olderThan: Date): Promise<number>;
  
  // Error log operations
  createErrorLog(error: InsertErrorLog): Promise<ErrorLog>;
  getErrorLogs(filters?: { teamId?: string; severity?: string; category?: string; resolved?: boolean; limit?: number }): Promise<ErrorLog[]>;
  getErrorLogStats(): Promise<{ total: number; critical: number; unresolved: number; byCategory: Record<string, number> }>;
  resolveErrorLog(id: string, resolvedBy: string): Promise<ErrorLog | undefined>;
  markNotificationSent(id: string): Promise<void>;
  getUnnotifiedCriticalErrors(): Promise<ErrorLog[]>;
  
  // Admin operations
  getAllTeamsWithStats(): Promise<(Team & { 
    memberCount: number; 
    pendingJobs: number; 
    failedJobs: number;
    recentErrors: number;
    slackConnected: boolean;
    notionConnected: boolean;
  })[]>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user already exists
    if (!userData.id) {
      throw new Error("User ID is required for upsert");
    }
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Update only non-auth fields to preserve email auth data
      const [user] = await db
        .update(users)
        .set({
          email: userData.email || existingUser.email,
          firstName: userData.firstName || existingUser.firstName,
          lastName: userData.lastName || existingUser.lastName,
          profileImageUrl: userData.profileImageUrl || existingUser.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    }
    
    // Create new user with Replit auth provider
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        authProvider: "replit",
      })
      .returning();
    return user;
  }

  // Email auth operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createEmailUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    emailVerificationToken: string;
    emailVerificationExpires: Date;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
        authProvider: "email",
        emailVerified: false,
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpires: data.emailVerificationExpires,
      })
      .returning();
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    return user;
  }

  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async setVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token));
    return user;
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getTeamByOwner(ownerId: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.ownerId, ownerId));
    return team;
  }

  // Team operations
  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamBySlug(slug: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.slug, slug));
    return team;
  }

  async getTeamsByUserId(userId: string): Promise<Team[]> {
    const memberships = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
    return memberships.map(m => m.team);
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [created] = await db.insert(teams).values(team).returning();
    return created;
  }

  async updateTeam(id: string, data: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updated] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async updateTeamSubscription(id: string, data: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    currentPeriodEnd?: Date;
    suggestionsLimit?: number;
    sourcesLimit?: number;
    seatsLimit?: number;
  }): Promise<Team | undefined> {
    const [updated] = await db
      .update(teams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updated;
  }

  async incrementSuggestionsUsed(teamId: string): Promise<void> {
    await db
      .update(teams)
      .set({ suggestionsUsed: sql`${teams.suggestionsUsed} + 1` })
      .where(eq(teams.id, teamId));
  }

  async resetSuggestionsUsed(teamId: string): Promise<void> {
    await db
      .update(teams)
      .set({ suggestionsUsed: 0 })
      .where(eq(teams.id, teamId));
  }

  // Team member operations
  async getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]> {
    const members = await db
      .select({ member: teamMembers, user: users })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    return members.map(m => ({ ...m.member, user: m.user }));
  }

  async getTeamMember(teamId: string, userId: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    return member;
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [created] = await db.insert(teamMembers).values(member).returning();
    return created;
  }

  async updateTeamMember(id: string, data: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set(data)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated;
  }

  async removeTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  // Team invitation operations
  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    return await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.teamId, teamId))
      .orderBy(desc(teamInvitations.createdAt));
  }

  async getInvitationByToken(token: string): Promise<TeamInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.token, token));
    return invitation;
  }

  async createInvitation(invitation: InsertTeamInvitation): Promise<TeamInvitation> {
    const [created] = await db.insert(teamInvitations).values(invitation).returning();
    return created;
  }

  async acceptInvitation(id: string): Promise<TeamInvitation | undefined> {
    const [updated] = await db
      .update(teamInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(teamInvitations.id, id))
      .returning();
    return updated;
  }

  async deleteInvitation(id: string): Promise<void> {
    await db.delete(teamInvitations).where(eq(teamInvitations.id, id));
  }

  // Integration operations
  async getIntegrations(teamId: string): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.teamId, teamId));
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));
    return integration;
  }

  async getIntegrationByType(teamId: string, type: string): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.teamId, teamId), eq(integrations.type, type)));
    return integration;
  }

  async getIntegrationByWorkspaceId(type: string, workspaceId: string): Promise<Integration | undefined> {
    const allIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.type, type));
    
    return allIntegrations.find(integration => {
      const metadata = integration.metadata as any;
      return metadata?.workspaceId === workspaceId || metadata?.workspace_id === workspaceId;
    });
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [created] = await db.insert(integrations).values(integration).returning();
    return created;
  }

  async updateIntegration(id: string, data: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [updated] = await db
      .update(integrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return updated;
  }

  async deleteIntegration(id: string): Promise<void> {
    await db.delete(integrations).where(eq(integrations.id, id));
  }

  // Suggestion operations
  async getSuggestions(teamId: string, filters?: { status?: string; source?: string; minConfidence?: number }): Promise<Suggestion[]> {
    const conditions = [eq(suggestions.teamId, teamId)];
    
    if (filters?.status) {
      conditions.push(eq(suggestions.status, filters.status));
    }
    if (filters?.source) {
      conditions.push(eq(suggestions.sourceType, filters.source));
    }
    if (filters?.minConfidence !== undefined) {
      conditions.push(gte(suggestions.confidence, filters.minConfidence));
    }
    
    return await db
      .select()
      .from(suggestions)
      .where(and(...conditions))
      .orderBy(desc(suggestions.createdAt));
  }

  async getSuggestion(id: string): Promise<Suggestion | undefined> {
    const [suggestion] = await db.select().from(suggestions).where(eq(suggestions.id, id));
    return suggestion;
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const [created] = await db.insert(suggestions).values(insertSuggestion).returning();
    return created;
  }

  async updateSuggestionStatus(id: string, status: string): Promise<Suggestion | undefined> {
    const [updated] = await db
      .update(suggestions)
      .set({ status, updatedAt: new Date() })
      .where(eq(suggestions.id, id))
      .returning();
    return updated;
  }

  async updateSuggestionNotionPage(id: string, data: { notionPageId: string; notionPageUrl: string; currentContent?: string }): Promise<Suggestion | undefined> {
    const [updated] = await db
      .update(suggestions)
      .set({ 
        notionPageId: data.notionPageId, 
        notionPageUrl: data.notionPageUrl, 
        currentContent: data.currentContent || null,
        updatedAt: new Date() 
      })
      .where(eq(suggestions.id, id))
      .returning();
    return updated;
  }

  async deleteSuggestion(id: string): Promise<void> {
    await db.delete(suggestions).where(eq(suggestions.id, id));
  }

  // Activity log operations
  async getActivityLog(teamId: string, filters?: { status?: string; source?: string; limit?: number }): Promise<ActivityLog[]> {
    const conditions = [eq(activityLog.teamId, teamId)];
    
    if (filters?.status) {
      conditions.push(eq(activityLog.status, filters.status));
    }
    if (filters?.source) {
      conditions.push(eq(activityLog.sourceType, filters.source));
    }
    
    let query = db
      .select()
      .from(activityLog)
      .where(and(...conditions))
      .orderBy(desc(activityLog.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    return await query;
  }

  async createActivityLog(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLog).values(insertActivity).returning();
    return created;
  }

  // Settings operations
  async getSettings(teamId: string): Promise<Settings | undefined> {
    const [result] = await db.select().from(settings).where(eq(settings.teamId, teamId));
    return result;
  }

  async upsertSettings(settingsData: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings(settingsData.teamId);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(settings).values(settingsData).returning();
    return created;
  }

  // Job queue operations
  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async claimNextJob(workerId: string, maxPerTeam: number): Promise<Job | undefined> {
    // Use a transaction to atomically claim a job
    const now = new Date();
    
    // Find a pending job that can be claimed (team isn't at max processing)
    const result = await db.execute(sql`
      WITH team_processing AS (
        SELECT team_id, COUNT(*) as processing_count
        FROM jobs
        WHERE status = 'processing'
        GROUP BY team_id
      )
      UPDATE jobs
      SET 
        status = 'processing',
        processed_by = ${workerId},
        locked_at = ${now},
        updated_at = ${now}
      WHERE id = (
        SELECT j.id
        FROM jobs j
        LEFT JOIN team_processing tp ON j.team_id = tp.team_id
        WHERE j.status = 'pending'
          AND j.scheduled_for <= ${now}
          AND (tp.processing_count IS NULL OR tp.processing_count < ${maxPerTeam})
        ORDER BY j.priority DESC, j.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `);
    
    // Handle the result - it may be an array or QueryResult object
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    if (rows.length === 0) return undefined;
    
    // Map snake_case columns to camelCase
    const row = rows[0];
    return {
      id: row.id,
      teamId: row.team_id,
      type: row.type,
      status: row.status,
      priority: row.priority,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      data: row.data,
      error: row.error,
      processedBy: row.processed_by,
      lockedAt: row.locked_at,
      completedAt: row.completed_at,
      scheduledFor: row.scheduled_for,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as Job;
  }

  async completeJob(jobId: string): Promise<void> {
    await db
      .update(jobs)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  }

  async failJob(jobId: string, error: string): Promise<void> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    
    if (job && job.attempts + 1 < job.maxAttempts) {
      // Schedule for retry with exponential backoff
      const delayMs = Math.min(1000 * Math.pow(2, job.attempts), 60000); // Max 1 minute
      const scheduledFor = new Date(Date.now() + delayMs);
      
      await db
        .update(jobs)
        .set({
          status: "pending",
          attempts: job.attempts + 1,
          error,
          processedBy: null,
          lockedAt: null,
          scheduledFor,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));
    } else {
      // Max retries reached - move to dead letter queue (error logs)
      await db
        .update(jobs)
        .set({
          status: "failed",
          attempts: (job?.attempts || 0) + 1,
          error,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));
      
      // Log to dead letter queue (error_logs table)
      if (job) {
        await db.insert(errorLogs).values({
          teamId: job.teamId,
          severity: "error",
          category: "job_failure",
          message: `Job ${job.type} failed after ${job.maxAttempts} attempts: ${error}`,
          context: {
            jobId: job.id,
            jobType: job.type,
            attempts: job.maxAttempts,
            data: job.data,
            lastError: error,
          },
        });
      }
    }
  }

  async retryJob(jobId: string, scheduledFor: Date): Promise<void> {
    await db
      .update(jobs)
      .set({
        status: "pending",
        processedBy: null,
        lockedAt: null,
        scheduledFor,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  }

  async getJobStats(teamId: string): Promise<{ pending: number; processing: number; failed: number; completed: number }> {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM jobs
      WHERE team_id = ${teamId}
    `);
    
    // Handle the result - it may be an array or QueryResult object
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    const row = rows[0] || {};
    
    return {
      pending: parseInt(row.pending) || 0,
      processing: parseInt(row.processing) || 0,
      failed: parseInt(row.failed) || 0,
      completed: parseInt(row.completed) || 0,
    };
  }

  async getGlobalJobStats(): Promise<{ 
    pending: number; 
    processing: number; 
    failed: number; 
    completed: number; 
    activeWorkers: number;
    teamsWithPendingJobs: number;
    avgProcessingTimeMs: number;
  }> {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(DISTINCT processed_by) FILTER (WHERE status = 'processing') as active_workers,
        COUNT(DISTINCT team_id) FILTER (WHERE status = 'pending') as teams_with_pending,
        COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - locked_at)) * 1000) FILTER (WHERE status = 'completed' AND completed_at IS NOT NULL AND locked_at IS NOT NULL), 0) as avg_processing_time
      FROM jobs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    const row = rows[0] || {};
    
    return {
      pending: parseInt(row.pending) || 0,
      processing: parseInt(row.processing) || 0,
      failed: parseInt(row.failed) || 0,
      completed: parseInt(row.completed) || 0,
      activeWorkers: parseInt(row.active_workers) || 0,
      teamsWithPendingJobs: parseInt(row.teams_with_pending) || 0,
      avgProcessingTimeMs: parseFloat(row.avg_processing_time) || 0,
    };
  }

  async getFailedJobs(teamId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.teamId, teamId), eq(jobs.status, "failed")))
      .orderBy(desc(jobs.createdAt));
  }

  async getRecentJobs(teamId: string, limit: number = 20): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.teamId, teamId))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
  }

  async retryAllFailedJobs(teamId: string): Promise<number> {
    const result = await db
      .update(jobs)
      .set({
        status: "pending",
        attempts: 0,
        error: null,
        processedBy: null,
        lockedAt: null,
        scheduledFor: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(jobs.teamId, teamId), eq(jobs.status, "failed")))
      .returning();
    
    return result.length;
  }

  async clearFailedJobs(teamId: string): Promise<number> {
    const result = await db
      .delete(jobs)
      .where(and(eq(jobs.teamId, teamId), eq(jobs.status, "failed")))
      .returning();
    
    return result.length;
  }

  async cleanupOldJobs(olderThan: Date): Promise<number> {
    const result = await db
      .delete(jobs)
      .where(and(
        eq(jobs.status, "completed"),
        sql`${jobs.completedAt} < ${olderThan}`
      ))
      .returning();
    
    return result.length;
  }

  // Error log operations
  async createErrorLog(error: InsertErrorLog): Promise<ErrorLog> {
    const [errorLog] = await db.insert(errorLogs).values(error).returning();
    return errorLog;
  }

  async getErrorLogs(filters?: { teamId?: string; severity?: string; category?: string; resolved?: boolean; limit?: number }): Promise<ErrorLog[]> {
    let query = db.select().from(errorLogs);
    const conditions = [];
    
    if (filters?.teamId) {
      conditions.push(eq(errorLogs.teamId, filters.teamId));
    }
    if (filters?.severity) {
      conditions.push(eq(errorLogs.severity, filters.severity));
    }
    if (filters?.category) {
      conditions.push(eq(errorLogs.category, filters.category));
    }
    if (filters?.resolved !== undefined) {
      conditions.push(eq(errorLogs.resolved, filters.resolved));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(desc(errorLogs.createdAt)) as any;
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    return await query;
  }

  async getErrorLogStats(): Promise<{ total: number; critical: number; unresolved: number; byCategory: Record<string, number> }> {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical,
        COUNT(*) FILTER (WHERE resolved = false) as unresolved
      FROM error_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    
    const categoryResult = await db.execute(sql`
      SELECT category, COUNT(*) as count
      FROM error_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY category
    `);
    
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    const row = rows[0] || {};
    
    const categoryRows = Array.isArray(categoryResult) ? categoryResult : (categoryResult as any).rows || [];
    const byCategory: Record<string, number> = {};
    for (const cat of categoryRows) {
      byCategory[cat.category] = parseInt(cat.count) || 0;
    }
    
    return {
      total: parseInt(row.total) || 0,
      critical: parseInt(row.critical) || 0,
      unresolved: parseInt(row.unresolved) || 0,
      byCategory,
    };
  }

  async resolveErrorLog(id: string, resolvedBy: string): Promise<ErrorLog | undefined> {
    const [errorLog] = await db
      .update(errorLogs)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      })
      .where(eq(errorLogs.id, id))
      .returning();
    return errorLog;
  }

  async markNotificationSent(id: string): Promise<void> {
    await db
      .update(errorLogs)
      .set({ notificationSent: true })
      .where(eq(errorLogs.id, id));
  }

  async getUnnotifiedCriticalErrors(): Promise<ErrorLog[]> {
    return await db
      .select()
      .from(errorLogs)
      .where(and(
        eq(errorLogs.severity, "critical"),
        eq(errorLogs.notificationSent, false),
        eq(errorLogs.resolved, false)
      ))
      .orderBy(desc(errorLogs.createdAt));
  }

  // Admin operations
  async getAllTeamsWithStats(): Promise<(Team & { 
    memberCount: number; 
    pendingJobs: number; 
    failedJobs: number;
    recentErrors: number;
    slackConnected: boolean;
    notionConnected: boolean;
  })[]> {
    const result = await db.execute(sql`
      SELECT 
        t.*,
        COALESCE((SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id), 0)::int as member_count,
        COALESCE((SELECT COUNT(*) FROM jobs j WHERE j.team_id = t.id AND j.status = 'pending'), 0)::int as pending_jobs,
        COALESCE((SELECT COUNT(*) FROM jobs j WHERE j.team_id = t.id AND j.status = 'failed'), 0)::int as failed_jobs,
        COALESCE((SELECT COUNT(*) FROM error_logs e WHERE e.team_id = t.id AND e.created_at > NOW() - INTERVAL '24 hours'), 0)::int as recent_errors,
        EXISTS(SELECT 1 FROM integrations i WHERE i.team_id = t.id AND i.type = 'slack' AND i.status = 'connected') as slack_connected,
        EXISTS(SELECT 1 FROM integrations i WHERE i.team_id = t.id AND i.type = 'notion' AND i.status = 'connected') as notion_connected
      FROM teams t
      ORDER BY t.created_at DESC
    `);
    
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      ownerId: row.owner_id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      subscriptionStatus: row.subscription_status,
      subscriptionPlan: row.subscription_plan,
      trialEndsAt: row.trial_ends_at,
      currentPeriodEnd: row.current_period_end,
      suggestionsUsed: row.suggestions_used,
      suggestionsLimit: row.suggestions_limit,
      sourcesLimit: row.sources_limit,
      seatsLimit: row.seats_limit,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      memberCount: row.member_count,
      pendingJobs: row.pending_jobs,
      failedJobs: row.failed_jobs,
      recentErrors: row.recent_errors,
      slackConnected: row.slack_connected,
      notionConnected: row.notion_connected,
    }));
  }
}

export const storage = new DbStorage();
