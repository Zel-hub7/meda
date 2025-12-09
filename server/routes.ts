import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupLocalAuth } from "./localAuth";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import oauthRoutes from "./routes/oauth";
import { 
  insertSuggestionSchema, 
  insertActivityLogSchema, 
  insertSettingsSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  PLAN_CONFIGS,
  type InsertTeam,
  type InsertTeamMember,
  type PlanType,
} from "@shared/schema";
import { processTextForKnowledge } from "./services/ai";
import { findBestMatchingPage, updateNotionPage, testNotionConnection, NotionError, searchNotionPages, getNotionPage } from "./services/notion";
import { getTranscriptFromRecording, verifyZoomWebhook } from "./services/zoom";
import { getMeetTranscript } from "./services/meet";
import { 
  verifySlackSignature, 
  getSlackMessageLink, 
  testSlackConnection,
  listSlackChannels,
  joinSlackChannel,
  handleSlackEventCallback,
  initializeSlackSocketMode,
  processSlackMessageForKnowledge,
  isSlackConnected,
} from "./services/slack";
import { 
  sendTeamInvitation, 
  testEmailConnection,
  sendSuggestionNotification,
  sendApprovalNotification,
  sendDemoRequest,
  sendNewsletterSubscription,
} from "./services/email";
import { testDriveConnection } from "./services/drive";
import { notifyNewSuggestion } from "./services/notifications";
import { slackManager, jobQueue } from "./services/slackManager";
import { 
  apiRateLimiter, 
  authRateLimiter, 
  webhookRateLimiter, 
  aiRateLimiter,
  suggestionRateLimiter,
} from "./middleware/rateLimit";
import {
  suggestionsQuotaMiddleware,
  seatsQuotaMiddleware,
  sourcesQuotaMiddleware,
  trialCheckMiddleware,
  getTeamQuotaStatus,
} from "./middleware/quotas";
import { ZodError } from "zod";
import crypto from "crypto";
import { db } from "./db";
import { sql } from "drizzle-orm";

function broadcastUpdate(data: any) {
  console.log("Broadcast update:", data.type);
}

function formatZodError(error: ZodError): string {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
}

function formatErrorResponse(error: any, context: string): { message: string; details?: string } {
  const baseMessage = `Failed to ${context}`;
  
  if (error.message === "User not authenticated") {
    return { message: "Please log in to continue" };
  }
  if (error.message === "User has no teams") {
    return { message: "You need to create or join a team first" };
  }
  if (error.code === 'NOT_CONNECTED') {
    return { message: baseMessage, details: "Integration not connected. Check Settings > Integrations." };
  }
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return { message: baseMessage, details: "Could not connect to external service. Please try again." };
  }
  if (error.code === 'ETIMEDOUT') {
    return { message: baseMessage, details: "Request timed out. Please try again." };
  }
  
  return { message: baseMessage };
}

function getUserIdFromRequest(req: Request): string | null {
  const user = req.user as any;
  if (user?.claims?.sub) {
    return user.claims.sub;
  }
  const session = req.session as any;
  if (session?.userId) {
    return session.userId;
  }
  return null;
}

// Check if user is a system admin (platform operator)
// System admins are identified by:
// 1. Email matching ADMIN_EMAILS environment variable (comma-separated list)
// 2. Or being the owner of the oldest team (fallback for backwards compatibility)
// Cache the check for efficiency
const adminCache = new Map<string, { isAdmin: boolean; expiresAt: number }>();
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function isSystemAdmin(req: Request): Promise<boolean> {
  const userId = getUserIdFromRequest(req);
  if (!userId) return false;
  
  // Check cache first
  const cached = adminCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.isAdmin;
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      adminCache.set(userId, { isAdmin: false, expiresAt: Date.now() + ADMIN_CACHE_TTL });
      return false;
    }
    
    // Method 1: Check against explicit admin email list (most secure)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      adminCache.set(userId, { isAdmin: true, expiresAt: Date.now() + ADMIN_CACHE_TTL });
      return true;
    }
    
    // Method 2: Fallback - owner of oldest team (for backwards compatibility)
    // This is less secure but ensures platform operators can access their dashboard
    const allTeams = await storage.getAllTeams();
    if (allTeams.length > 0) {
      const sortedTeams = [...allTeams].sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
      
      if (sortedTeams[0].ownerId === userId) {
        adminCache.set(userId, { isAdmin: true, expiresAt: Date.now() + ADMIN_CACHE_TTL });
        return true;
      }
    }
    
    adminCache.set(userId, { isAdmin: false, expiresAt: Date.now() + ADMIN_CACHE_TTL });
    return false;
  } catch (error) {
    console.error("Error checking system admin status:", error);
    // Fail closed - deny access on error
    return false;
  }
}

async function getTeamIdFromRequest(req: Request): Promise<string> {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const teams = await storage.getTeamsByUserId(userId);
  
  if (teams.length === 0) {
    const team = await storage.getTeamByOwner(userId);
    if (team) {
      return team.id;
    }
    throw new Error("User has no teams");
  }
  
  return teams[0].id;
}

async function findBestMatchingPageSafe(title: string): Promise<{
  id: string | null;
  url: string;
  content: string | null;
}> {
  try {
    const page = await findBestMatchingPage(title);
    if (page) {
      return {
        id: page.id,
        url: page.url,
        content: page.content,
      };
    }
    return {
      id: null,
      url: "https://notion.so",
      content: null,
    };
  } catch (error: any) {
    console.warn("⚠️  Demo mode: Cannot search Notion pages");
    console.warn(`Notion error: ${error.message || error}`);
    return {
      id: null,
      url: "https://notion.so",
      content: null,
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  setupLocalAuth(app);

  app.use("/api", apiRateLimiter);
  app.use("/api/oauth", oauthRoutes);

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const dbUser = await storage.getUser(userId);
      
      if (!dbUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(dbUser);
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/teams", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let teams = await storage.getTeamsByUserId(userId);
      
      if (teams.length === 0) {
        const ownedTeam = await storage.getTeamByOwner(userId);
        if (ownedTeam) {
          teams = [ownedTeam];
        }
      }
      
      res.json(teams);
    } catch (error) {
      console.error("Error getting teams:", error);
      res.status(500).json({ error: "Failed to get teams" });
    }
  });

  app.post("/api/teams", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const teamData: InsertTeam = {
        name: req.body.name,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        ownerId: userId,
        subscriptionPlan: "starter",
        subscriptionStatus: "trialing",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        suggestionsLimit: PLAN_CONFIGS.starter.suggestionsLimit,
        sourcesLimit: PLAN_CONFIGS.starter.sourcesLimit,
        seatsLimit: PLAN_CONFIGS.starter.seatsLimit,
      };
      
      const validatedTeam = insertTeamSchema.parse(teamData);
      const team = await storage.createTeam(validatedTeam);
      
      const memberData: InsertTeamMember = {
        teamId: team.id,
        userId: userId,
        role: "owner",
        canApprove: true,
      };
      await storage.addTeamMember(memberData);
      
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: formatZodError(error) });
      }
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.get("/api/teams/:teamId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const member = await storage.getTeamMember(req.params.teamId, userId);
      if (!member) {
        return res.status(403).json({ error: "Not a member of this team" });
      }
      
      const team = await storage.getTeam(req.params.teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      console.error("Error getting team:", error);
      res.status(500).json({ error: "Failed to get team" });
    }
  });

  app.get("/api/teams/:teamId/quotas", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const member = await storage.getTeamMember(req.params.teamId, userId);
      if (!member) {
        return res.status(403).json({ error: "Not a member of this team" });
      }
      
      const quotaStatus = await getTeamQuotaStatus(req.params.teamId);
      res.json(quotaStatus);
    } catch (error) {
      console.error("Error getting team quotas:", error);
      res.status(500).json({ error: "Failed to get team quotas" });
    }
  });

  app.get("/api/teams/:teamId/members", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const member = await storage.getTeamMember(req.params.teamId, userId);
      if (!member) {
        return res.status(403).json({ error: "Not a member of this team" });
      }
      
      const members = await storage.getTeamMembers(req.params.teamId);
      res.json(members);
    } catch (error) {
      console.error("Error getting team members:", error);
      res.status(500).json({ error: "Failed to get team members" });
    }
  });

  app.post("/api/teams/:teamId/members", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const currentMember = await storage.getTeamMember(req.params.teamId, userId);
      if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
        return res.status(403).json({ error: "Only owners and admins can invite members" });
      }
      
      const team = await storage.getTeam(req.params.teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      const existingMembers = await storage.getTeamMembers(req.params.teamId);
      if (team.seatsLimit && team.seatsLimit !== -1 && existingMembers.length >= team.seatsLimit) {
        return res.status(400).json({ error: "Team has reached seat limit" });
      }
      
      const token = crypto.randomBytes(32).toString('hex');
      const invitation = await storage.createInvitation({
        teamId: req.params.teamId,
        email: req.body.email,
        role: req.body.role || "member",
        invitedBy: userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      
      const inviterUser = await storage.getUser(userId);
      const inviterName = inviterUser?.firstName 
        ? `${inviterUser.firstName} ${inviterUser.lastName || ''}`.trim()
        : inviterUser?.email || 'A team member';
      
      sendTeamInvitation({
        email: req.body.email,
        teamName: team.name,
        inviterName,
        token,
      }).catch(error => {
        console.error("Failed to send invitation email:", error);
      });
      
      res.json(invitation);
    } catch (error) {
      console.error("Error inviting team member:", error);
      res.status(500).json({ error: "Failed to invite team member" });
    }
  });

  app.delete("/api/teams/:teamId/members/:memberId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const currentMember = await storage.getTeamMember(req.params.teamId, userId);
      if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
        return res.status(403).json({ error: "Only owners and admins can remove members" });
      }
      
      const members = await storage.getTeamMembers(req.params.teamId);
      const memberToRemove = members.find(m => m.id === req.params.memberId);
      
      if (!memberToRemove) {
        return res.status(404).json({ error: "Member not found" });
      }
      
      if (memberToRemove.role === "owner") {
        return res.status(400).json({ error: "Cannot remove the team owner" });
      }
      
      await storage.removeTeamMember(req.params.memberId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ error: "Failed to remove team member" });
    }
  });

  app.get("/api/teams/:teamId/invitations", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const member = await storage.getTeamMember(req.params.teamId, userId);
      if (!member) {
        return res.status(403).json({ error: "Not a member of this team" });
      }
      
      const invitations = await storage.getTeamInvitations(req.params.teamId);
      const pendingInvitations = invitations.filter(
        inv => inv.acceptedAt === null && new Date(inv.expiresAt) > new Date()
      );
      
      res.json(pendingInvitations);
    } catch (error) {
      console.error("Error getting invitations:", error);
      res.status(500).json({ error: "Failed to get invitations" });
    }
  });

  app.delete("/api/teams/:teamId/invitations/:invitationId", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const member = await storage.getTeamMember(req.params.teamId, userId);
      if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return res.status(403).json({ error: "Only owners and admins can cancel invitations" });
      }
      
      await storage.deleteInvitation(req.params.invitationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      res.status(500).json({ error: "Failed to cancel invitation" });
    }
  });

  app.get("/api/invitations/:token", async (req, res) => {
    try {
      const invitation = await storage.getInvitationByToken(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      
      if (new Date(invitation.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invitation has expired" });
      }
      
      if (invitation.acceptedAt !== null) {
        return res.status(400).json({ error: "Invitation has already been used" });
      }
      
      const team = await storage.getTeam(invitation.teamId);
      
      res.json({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        teamName: team?.name || "Unknown Team",
        expiresAt: invitation.expiresAt,
      });
    } catch (error) {
      console.error("Error getting invitation:", error);
      res.status(500).json({ error: "Failed to get invitation" });
    }
  });

  app.post("/api/invitations/:token/accept", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const userEmail = user.claims.email;
      
      const invitation = await storage.getInvitationByToken(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      
      if (new Date(invitation.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invitation has expired" });
      }
      
      if (invitation.acceptedAt !== null) {
        return res.status(400).json({ error: "Invitation has already been used" });
      }
      
      if (invitation.email.toLowerCase() !== userEmail?.toLowerCase()) {
        return res.status(403).json({ 
          error: "This invitation was sent to a different email address",
          expectedEmail: invitation.email,
        });
      }
      
      const existingMember = await storage.getTeamMember(invitation.teamId, userId);
      if (existingMember) {
        return res.status(400).json({ error: "You are already a member of this team" });
      }
      
      await storage.addTeamMember({
        teamId: invitation.teamId,
        userId,
        role: invitation.role as "admin" | "member",
        canApprove: true,
      });
      
      await storage.acceptInvitation(invitation.id);
      
      const team = await storage.getTeam(invitation.teamId);
      
      res.json({ 
        success: true,
        teamId: invitation.teamId,
        teamName: team?.name,
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  app.get("/api/suggestions", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const { status, source, minConfidence } = req.query;
      const filters = {
        status: status as string | undefined,
        source: source as string | undefined,
        minConfidence: minConfidence ? parseInt(minConfidence as string) : undefined,
      };
      const suggestions = await storage.getSuggestions(teamId, filters);
      res.json(suggestions);
    } catch (error: any) {
      console.error("Error getting suggestions:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  app.get("/api/suggestions/:id", isAuthenticated, async (req, res) => {
    try {
      const suggestion = await storage.getSuggestion(req.params.id);
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting suggestion:", error);
      res.status(500).json({ error: "Failed to get suggestion" });
    }
  });

  app.post("/api/suggestions", isAuthenticated, suggestionRateLimiter, suggestionsQuotaMiddleware, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const validatedData = insertSuggestionSchema.parse({
        ...req.body,
        teamId,
      });
      const suggestion = await storage.createSuggestion(validatedData);
      
      await storage.incrementSuggestionsUsed(teamId);
      
      // Send notification to approvers
      notifyNewSuggestion(suggestion).catch(err => 
        console.error("Failed to send suggestion notification:", err)
      );
      
      broadcastUpdate({ type: "new_suggestion", data: suggestion });
      
      res.json(suggestion);
    } catch (error) {
      console.error("Error creating suggestion:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: formatZodError(error) });
      }
      res.status(500).json({ error: "Failed to create suggestion" });
    }
  });

  app.post("/api/suggestions/:id/approve", isAuthenticated, suggestionRateLimiter, async (req, res) => {
    try {
      // First, get the suggestion to determine its team
      const suggestion = await storage.getSuggestion(req.params.id);
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      
      // Use the suggestion's teamId for permission checks (security: prevents cross-team approval)
      const teamId = suggestion.teamId;
      
      // Get user ID for permission check
      let userId = '';
      const replitUser = req.user as any;
      const session = req.session as any;
      if (replitUser?.claims) {
        userId = replitUser.claims.sub;
      } else if (session?.userId) {
        userId = session.userId;
      }
      
      if (!userId || !teamId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Check approval permissions on the suggestion's team, not the user's default team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "Not a member of this team" });
      }
      
      const settings = await storage.getSettings(teamId);
      const isOwnerOrAdmin = teamMember.role === "owner" || teamMember.role === "admin";
      
      if (settings?.adminOnlyApprovals && !isOwnerOrAdmin) {
        return res.status(403).json({ 
          error: "Permission denied", 
          details: "Only team admins and owners can approve suggestions" 
        });
      }
      
      if (!isOwnerOrAdmin && !teamMember.canApprove) {
        return res.status(403).json({ 
          error: "Permission denied", 
          details: "You don't have approval permissions for this team" 
        });
      }
      
      // Handle both Replit OAuth and email auth users
      let userName = 'Unknown';
      if (replitUser?.claims) {
        userName = replitUser.claims.first_name 
          ? `${replitUser.claims.first_name} ${replitUser.claims.last_name || ''}`.trim()
          : replitUser.claims.email || 'Unknown';
      } else if (session?.userId) {
        const dbUser = await storage.getUser(session.userId);
        if (dbUser) {
          userName = dbUser.firstName 
            ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
            : dbUser.email || 'Unknown';
        }
      }

      if (!suggestion.proposedContent) {
        return res.status(400).json({ error: "Cannot approve suggestion without proposed content" });
      }

      let notionUpdateSucceeded = false;
      try {
        let notionPageId = suggestion.notionPageId;
        let notionPageUrl = suggestion.notionPageUrl;
        
        if (!notionPageId) {
          const matchingPage = await findBestMatchingPage(suggestion.title);
          if (matchingPage) {
            notionPageId = matchingPage.id;
            notionPageUrl = matchingPage.url;
            
            await storage.updateSuggestionNotionPage(
              req.params.id,
              { notionPageId, notionPageUrl }
            );
          } else {
            return res.status(409).json({ 
              error: "Cannot approve: No matching Notion page found", 
              details: "Please manually link this suggestion to a Notion page or create a new page first" 
            });
          }
        }

        const success = await updateNotionPage(
          notionPageId,
          suggestion.proposedContent
        );
        
        if (success) {
          notionUpdateSucceeded = true;
          console.log(`Notion page ${notionPageId} updated successfully`);
        } else {
          console.warn(`Notion update returned false for page ${notionPageId}`);
        }
      } catch (notionError: any) {
        console.warn("⚠️  Demo mode: Notion update skipped due to error");
        console.warn(`Notion error: ${notionError.message || notionError}`);
        console.log("Suggestion will be marked as approved but Notion won't be updated");
      }

      const updated = await storage.updateSuggestionStatus(req.params.id, "approved");
      
      await storage.createActivityLog({
        teamId,
        suggestionId: req.params.id,
        status: "approved",
        title: suggestion.title,
        source: suggestion.source,
        sourceType: suggestion.sourceType,
        userName,
        metadata: null,
      });

      broadcastUpdate({ type: "suggestion_approved", data: updated });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error approving suggestion:", error);
      const errorInfo = formatErrorResponse(error, "approve suggestion");
      res.status(500).json({ error: errorInfo.message, details: errorInfo.details });
    }
  });

  app.post("/api/suggestions/:id/reject", isAuthenticated, suggestionRateLimiter, async (req, res) => {
    try {
      // First, get the suggestion to determine its team
      const suggestion = await storage.getSuggestion(req.params.id);
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      
      // Use the suggestion's teamId for permission checks (security: prevents cross-team rejection)
      const teamId = suggestion.teamId;
      
      // Get user ID for permission check
      let userId = '';
      const replitUser = req.user as any;
      const session = req.session as any;
      if (replitUser?.claims) {
        userId = replitUser.claims.sub;
      } else if (session?.userId) {
        userId = session.userId;
      }
      
      if (!userId || !teamId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Check rejection permissions on the suggestion's team, not the user's default team
      const teamMember = await storage.getTeamMember(teamId, userId);
      if (!teamMember) {
        return res.status(403).json({ error: "Not a member of this team" });
      }
      
      const settings = await storage.getSettings(teamId);
      const isOwnerOrAdmin = teamMember.role === "owner" || teamMember.role === "admin";
      
      if (settings?.adminOnlyApprovals && !isOwnerOrAdmin) {
        return res.status(403).json({ 
          error: "Permission denied", 
          details: "Only team admins and owners can reject suggestions" 
        });
      }
      
      if (!isOwnerOrAdmin && !teamMember.canApprove) {
        return res.status(403).json({ 
          error: "Permission denied", 
          details: "You don't have approval/rejection permissions for this team" 
        });
      }
      
      // Handle both Replit OAuth and email auth users
      let userName = 'Unknown';
      if (replitUser?.claims) {
        userName = replitUser.claims.first_name 
          ? `${replitUser.claims.first_name} ${replitUser.claims.last_name || ''}`.trim()
          : replitUser.claims.email || 'Unknown';
      } else if (session?.userId) {
        const dbUser = await storage.getUser(session.userId);
        if (dbUser) {
          userName = dbUser.firstName 
            ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
            : dbUser.email || 'Unknown';
        }
      }

      const updated = await storage.updateSuggestionStatus(req.params.id, "rejected");
      
      await storage.createActivityLog({
        teamId,
        suggestionId: req.params.id,
        status: "rejected",
        title: suggestion.title,
        source: suggestion.source,
        sourceType: suggestion.sourceType,
        userName,
        metadata: null,
      });

      broadcastUpdate({ type: "suggestion_rejected", data: updated });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error rejecting suggestion:", error);
      const errorInfo = formatErrorResponse(error, "reject suggestion");
      res.status(500).json({ error: errorInfo.message, details: errorInfo.details });
    }
  });

  app.post("/api/suggestions/bulk-approve", isAuthenticated, suggestionRateLimiter, async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "ids array is required and must not be empty" });
      }

      let userId = '';
      const replitUser = req.user as any;
      const session = req.session as any;
      if (replitUser?.claims) {
        userId = replitUser.claims.sub;
      } else if (session?.userId) {
        userId = session.userId;
      }

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Always derive userName from authenticated session - never trust client input
      let userName = 'Unknown';
      if (replitUser?.claims) {
        userName = replitUser.claims.first_name 
          ? `${replitUser.claims.first_name} ${replitUser.claims.last_name || ''}`.trim()
          : replitUser.claims.email || 'Unknown';
      } else if (session?.userId) {
        const dbUser = await storage.getUser(session.userId);
        if (dbUser) {
          userName = dbUser.firstName 
            ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
            : dbUser.email || 'Unknown';
        }
      }

      const results: { approved: string[]; failed: { id: string; error: string }[] } = {
        approved: [],
        failed: [],
      };

      for (const id of ids) {
        try {
          const suggestion = await storage.getSuggestion(id);
          if (!suggestion) {
            results.failed.push({ id, error: "Suggestion not found" });
            continue;
          }

          const teamId = suggestion.teamId;
          if (!teamId) {
            results.failed.push({ id, error: "Suggestion has no team" });
            continue;
          }
          const teamMember = await storage.getTeamMember(teamId, userId);
          if (!teamMember) {
            results.failed.push({ id, error: "Not a member of this team" });
            continue;
          }

          const settings = await storage.getSettings(teamId);
          const isOwnerOrAdmin = teamMember.role === "owner" || teamMember.role === "admin";

          if (settings?.adminOnlyApprovals && !isOwnerOrAdmin) {
            results.failed.push({ id, error: "Permission denied" });
            continue;
          }

          if (!isOwnerOrAdmin && !teamMember.canApprove) {
            results.failed.push({ id, error: "No approval permissions" });
            continue;
          }

          if (!suggestion.proposedContent) {
            results.failed.push({ id, error: "No proposed content" });
            continue;
          }

          let notionPageId = suggestion.notionPageId;
          let notionPageUrl = suggestion.notionPageUrl;

          if (!notionPageId) {
            try {
              const matchingPage = await findBestMatchingPage(suggestion.title);
              if (matchingPage) {
                notionPageId = matchingPage.id;
                notionPageUrl = matchingPage.url;
                await storage.updateSuggestionNotionPage(id, { notionPageId, notionPageUrl });
              } else {
                results.failed.push({ id, error: "No matching Notion page found" });
                continue;
              }
            } catch {
              results.failed.push({ id, error: "Failed to find Notion page" });
              continue;
            }
          }

          try {
            await updateNotionPage(notionPageId, suggestion.proposedContent);
          } catch (notionError) {
            console.warn(`Bulk approve: Notion update skipped for ${id}`);
          }

          await storage.updateSuggestionStatus(id, "approved");

          await storage.createActivityLog({
            teamId,
            suggestionId: id,
            status: "approved",
            title: suggestion.title,
            source: suggestion.source,
            sourceType: suggestion.sourceType,
            userName,
            metadata: null,
          });

          results.approved.push(id);
          broadcastUpdate({ type: "suggestion_approved", data: { id } });
        } catch (err: any) {
          results.failed.push({ id, error: err.message || "Unknown error" });
        }
      }

      res.json(results);
    } catch (error: any) {
      console.error("Error in bulk approve:", error);
      res.status(500).json({ error: "Failed to bulk approve suggestions" });
    }
  });

  app.post("/api/suggestions/bulk-reject", isAuthenticated, suggestionRateLimiter, async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "ids array is required and must not be empty" });
      }

      let userId = '';
      const replitUser = req.user as any;
      const session = req.session as any;
      if (replitUser?.claims) {
        userId = replitUser.claims.sub;
      } else if (session?.userId) {
        userId = session.userId;
      }

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Always derive userName from authenticated session - never trust client input
      let userName = 'Unknown';
      if (replitUser?.claims) {
        userName = replitUser.claims.first_name 
          ? `${replitUser.claims.first_name} ${replitUser.claims.last_name || ''}`.trim()
          : replitUser.claims.email || 'Unknown';
      } else if (session?.userId) {
        const dbUser = await storage.getUser(session.userId);
        if (dbUser) {
          userName = dbUser.firstName 
            ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
            : dbUser.email || 'Unknown';
        }
      }

      const results: { rejected: string[]; failed: { id: string; error: string }[] } = {
        rejected: [],
        failed: [],
      };

      for (const id of ids) {
        try {
          const suggestion = await storage.getSuggestion(id);
          if (!suggestion) {
            results.failed.push({ id, error: "Suggestion not found" });
            continue;
          }

          const teamId = suggestion.teamId;
          if (!teamId) {
            results.failed.push({ id, error: "Suggestion has no team" });
            continue;
          }
          const teamMember = await storage.getTeamMember(teamId, userId);
          if (!teamMember) {
            results.failed.push({ id, error: "Not a member of this team" });
            continue;
          }

          const settings = await storage.getSettings(teamId);
          const isOwnerOrAdmin = teamMember.role === "owner" || teamMember.role === "admin";

          if (settings?.adminOnlyApprovals && !isOwnerOrAdmin) {
            results.failed.push({ id, error: "Permission denied" });
            continue;
          }

          if (!isOwnerOrAdmin && !teamMember.canApprove) {
            results.failed.push({ id, error: "No rejection permissions" });
            continue;
          }

          await storage.updateSuggestionStatus(id, "rejected");

          await storage.createActivityLog({
            teamId,
            suggestionId: id,
            status: "rejected",
            title: suggestion.title,
            source: suggestion.source,
            sourceType: suggestion.sourceType,
            userName,
            metadata: null,
          });

          results.rejected.push(id);
          broadcastUpdate({ type: "suggestion_rejected", data: { id } });
        } catch (err: any) {
          results.failed.push({ id, error: err.message || "Unknown error" });
        }
      }

      res.json(results);
    } catch (error: any) {
      console.error("Error in bulk reject:", error);
      res.status(500).json({ error: "Failed to bulk reject suggestions" });
    }
  });

  app.get("/api/activity", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const { status, source, limit } = req.query;
      const filters = {
        status: status as string | undefined,
        source: source as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };
      const activity = await storage.getActivityLog(teamId, filters);
      res.json(activity);
    } catch (error: any) {
      console.error("Error getting activity log:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to get activity log" });
    }
  });

  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const settings = await storage.getSettings(teamId);
      if (!settings) {
        const defaultSettings = await storage.upsertSettings({
          teamId,
        });
        return res.json(defaultSettings);
      }
      res.json(settings);
    } catch (error: any) {
      console.error("Error getting settings:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const validatedData = insertSettingsSchema.parse({
        ...req.body,
        teamId,
      });
      const settings = await storage.upsertSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: formatZodError(error) });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.get("/api/integrations/notion/status", isAuthenticated, async (req, res) => {
    try {
      const status = await testNotionConnection();
      res.json(status);
    } catch (error: any) {
      res.json({
        connected: false,
        error: error.message || "Unknown error",
        errorCode: error.code || "API_ERROR",
      });
    }
  });

  app.get("/api/integrations/notion/pages", isAuthenticated, async (req, res) => {
    try {
      const query = (req.query.query as string) || "";
      const pages = await searchNotionPages(query);
      res.json(pages);
    } catch (error: any) {
      if (error instanceof NotionError) {
        return res.status(error.code === "NOT_CONNECTED" ? 503 : 500).json({
          error: error.message,
          code: error.code,
        });
      }
      console.error("Error searching Notion pages:", error);
      res.status(500).json({ error: "Failed to search Notion pages" });
    }
  });

  app.patch("/api/suggestions/:id/notion-page", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { notionPageId } = req.body;
      
      if (!notionPageId) {
        return res.status(400).json({ error: "notionPageId is required" });
      }

      const notionPage = await getNotionPage(notionPageId);
      if (!notionPage) {
        return res.status(404).json({ error: "Notion page not found" });
      }

      const suggestion = await storage.updateSuggestionNotionPage(id, {
        notionPageId: notionPage.id,
        notionPageUrl: notionPage.url,
        currentContent: notionPage.content,
      });

      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }

      res.json(suggestion);
    } catch (error: any) {
      if (error instanceof NotionError) {
        return res.status(error.code === "NOT_FOUND" ? 404 : 500).json({
          error: error.message,
          code: error.code,
        });
      }
      console.error("Error updating suggestion Notion page:", error);
      res.status(500).json({ error: "Failed to update suggestion Notion page" });
    }
  });

  app.get("/api/integrations/status", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req).catch(() => null);
      
      const [notionStatus, slackStatus, emailStatus, driveStatus, teamIntegrations] = await Promise.all([
        testNotionConnection(),
        testSlackConnection(),
        testEmailConnection(),
        testDriveConnection(),
        teamId ? storage.getIntegrations(teamId) : Promise.resolve([]),
      ]);
      
      const getIntegrationMeta = (type: string) => {
        const integration = teamIntegrations.find(i => i.type === type);
        return integration ? {
          lastActivity: integration.updatedAt,
          status: integration.status,
          metadata: integration.metadata,
        } : null;
      };
      
      res.json({
        notion: {
          ...notionStatus,
          ...getIntegrationMeta("notion"),
        },
        slack: {
          ...slackStatus,
          socketMode: isSlackConnected(),
          ...getIntegrationMeta("slack"),
        },
        email: emailStatus,
        google_drive: {
          ...driveStatus,
          ...getIntegrationMeta("google_drive"),
        },
        zoom: { 
          connected: !!process.env.ZOOM_ACCESS_TOKEN,
          ...getIntegrationMeta("zoom"),
        },
        google_meet: { 
          connected: !!process.env.GOOGLE_MEET_TOKEN,
          ...getIntegrationMeta("google_meet"),
        },
      });
    } catch (error: any) {
      console.error("Error checking integrations:", error);
      res.status(500).json({ error: "Failed to check integration status" });
    }
  });

  app.get("/api/integrations/email/status", isAuthenticated, async (req, res) => {
    try {
      const status = await testEmailConnection();
      res.json(status);
    } catch (error: any) {
      res.json({
        connected: false,
        error: error.message || "Unknown error",
      });
    }
  });

  app.get("/api/integrations/slack/status", isAuthenticated, async (req, res) => {
    try {
      const status = await testSlackConnection();
      res.json({
        ...status,
        socketMode: isSlackConnected(),
      });
    } catch (error: any) {
      res.json({
        connected: false,
        error: error.message || "Unknown error",
      });
    }
  });

  app.get("/api/integrations/slack/channels", isAuthenticated, async (req, res) => {
    try {
      const channels = await listSlackChannels();
      res.json(channels);
    } catch (error: any) {
      console.error("Error listing Slack channels:", error);
      const errorInfo = formatErrorResponse(error, "list Slack channels");
      res.status(500).json({ 
        error: errorInfo.message, 
        details: errorInfo.details || "Check that Slack is connected in Settings > Integrations" 
      });
    }
  });

  app.post("/api/integrations/slack/channels/:channelId/join", isAuthenticated, async (req, res) => {
    try {
      const success = await joinSlackChannel(req.params.channelId);
      res.json({ success });
    } catch (error: any) {
      console.error("Error joining Slack channel:", error);
      const errorInfo = formatErrorResponse(error, "join channel");
      res.status(500).json({ 
        error: errorInfo.message, 
        details: errorInfo.details || "The bot may not have permission to join this channel" 
      });
    }
  });

  app.post("/api/integrations/slack/connect", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      
      const success = await initializeSlackSocketMode(teamId, async (message, tid) => {
        await processSlackMessageForKnowledge(message, tid);
      });
      
      if (success) {
        res.json({ success: true, message: "Connected to Slack successfully" });
      } else {
        res.json({ 
          success: false, 
          message: "Could not connect to Slack. Check that SLACK_BOT_TOKEN and SLACK_APP_TOKEN are configured in Secrets." 
        });
      }
    } catch (error: any) {
      console.error("Error connecting to Slack:", error);
      const errorInfo = formatErrorResponse(error, "connect to Slack");
      res.status(500).json({ 
        error: errorInfo.message, 
        details: errorInfo.details || "Verify your Slack tokens are correct in Settings > Secrets" 
      });
    }
  });

  app.post("/api/integrations/slack/test", isAuthenticated, async (req, res) => {
    try {
      const status = await testSlackConnection();
      if (status.connected) {
        res.json({ 
          success: true, 
          message: `Connected to workspace: ${status.workspaceName || "Unknown"}` 
        });
      } else {
        res.json({ 
          success: false, 
          message: status.error || "Slack is not connected" 
        });
      }
    } catch (error: any) {
      console.error("Error testing Slack connection:", error);
      res.json({ 
        success: false, 
        message: error.message || "Failed to test Slack connection" 
      });
    }
  });

  app.post("/api/integrations/slack/simulate", isAuthenticated, aiRateLimiter, suggestionsQuotaMiddleware, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      
      // Predefined demo scenarios with high-quality knowledge content
      const demoScenarios = [
        {
          message: "Hey team, I just updated our API rate limiting policy. New limits are: 1000 requests per minute for authenticated users, 100 for anonymous users. This applies to all endpoints starting next Monday.",
          title: "API Rate Limiting Policy Update",
          content: "## API Rate Limiting Policy\n\n**Effective Date:** Next Monday\n\n### Rate Limits\n- **Authenticated Users:** 1,000 requests per minute\n- **Anonymous Users:** 100 requests per minute\n\n### Scope\nThese limits apply to all API endpoints.\n\n### Implementation Notes\nEnsure your applications handle rate limit responses (HTTP 429) gracefully.",
          knowledgeType: "policy" as const,
        },
        {
          message: "Quick update: Our deployment process now requires all PRs to pass security scans before merge. The new tool is called 'SecureGuard' and runs automatically on every PR.",
          title: "SecureGuard Security Scanning Requirement",
          content: "## Deployment Security Requirements\n\n### New Requirement\nAll Pull Requests must pass SecureGuard security scans before merge.\n\n### How It Works\n- SecureGuard runs automatically on every PR\n- Scan results appear in PR checks\n- PRs cannot be merged until scan passes\n\n### Action Required\nNo manual action needed - the tool runs automatically.",
          knowledgeType: "process" as const,
        },
        {
          message: "Important change to our customer support escalation process: All Tier 3 issues now go directly to the engineering on-call instead of the support lead. This reduces response time by 2 hours.",
          title: "Customer Support Escalation Process Update",
          content: "## Support Escalation Process\n\n### Change Summary\nTier 3 issues now route directly to Engineering On-Call.\n\n### Previous Process\nTier 3 → Support Lead → Engineering\n\n### New Process\nTier 3 → Engineering On-Call (direct)\n\n### Expected Impact\n- Response time reduced by 2 hours\n- Faster resolution for critical issues",
          knowledgeType: "process" as const,
        },
        {
          message: "FYI: We've updated the employee onboarding checklist. New hires now need to complete security training within their first week, not the first month as before.",
          title: "Employee Onboarding Security Training Timeline",
          content: "## Onboarding Checklist Update\n\n### Change\nSecurity training deadline moved from first month to **first week**.\n\n### New Timeline\n- Day 1-5: Complete mandatory security training\n- Training portal: security.company.com\n\n### Applies To\nAll new employees starting immediately.",
          knowledgeType: "policy" as const,
        },
        {
          message: "Heads up: The staging environment URL has changed from staging.example.com to stage.example.io. Please update your bookmarks and test scripts.",
          title: "Staging Environment URL Change",
          content: "## Staging Environment Update\n\n### URL Change\n- **Old URL:** staging.example.com\n- **New URL:** stage.example.io\n\n### Action Required\n1. Update browser bookmarks\n2. Update test scripts and CI/CD configurations\n3. Update any hardcoded URLs in documentation\n\n### Timeline\nEffective immediately.",
          knowledgeType: "technical" as const,
        },
      ];
      
      const scenario = demoScenarios[Math.floor(Math.random() * demoScenarios.length)];
      
      console.log("[Slack Demo] Creating demo suggestion:", scenario.title);
      
      // Create a deterministic high-confidence suggestion directly
      const notionPage = await findBestMatchingPageSafe(scenario.title);
      const confidence = 85 + Math.floor(Math.random() * 10); // 85-94%
      
      const suggestion = await storage.createSuggestion({
        teamId,
        source: "Slack",
        sourceType: "slack",
        knowledgeType: scenario.knowledgeType,
        title: scenario.title,
        proposedContent: scenario.content,
        currentContent: notionPage?.content || null,
        confidence,
        sourceLink: "#demo-message",
        notionPageId: notionPage?.id || null,
        notionPageUrl: notionPage?.url || "https://notion.so",
        aiReasoning: JSON.stringify({
          extractionReason: `This Slack message contains important ${scenario.knowledgeType} information that should be documented in the knowledge base. The message clearly communicates a change or update that affects the team.`,
          validationReason: `The content is actionable, specific, and suitable for knowledge base documentation. It provides clear context about what changed and any actions required.`,
        }),
        metadata: {
          slackChannel: "#general",
          slackUser: "Team Lead",
          slackTimestamp: Date.now().toString(),
          isDemo: true,
        },
      });

      // Increment usage counter
      await storage.incrementSuggestionsUsed(teamId);

      await storage.createActivityLog({
        teamId,
        suggestionId: suggestion.id,
        status: "detected",
        title: scenario.title,
        source: "Slack",
        sourceType: "slack",
        metadata: {
          channel: "#general",
          user: "Team Lead",
          isDemo: true,
        },
      });

      // Send notification to approvers
      notifyNewSuggestion(suggestion).catch(err => 
        console.error("Failed to send suggestion notification:", err)
      );
      
      console.log(`[Slack Demo] Created suggestion: ${suggestion.id} - ${scenario.title}`);
      
      res.json({ 
        success: true, 
        message: `Knowledge detected! Created suggestion: "${scenario.title}" with ${confidence}% confidence.`,
        suggestion: {
          id: suggestion.id,
          title: scenario.title,
          confidence,
        }
      });
    } catch (error: any) {
      console.error("Error simulating Slack message:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to simulate Slack message" 
      });
    }
  });

  // Multi-tenant Slack: Store team-specific Slack tokens
  app.post("/api/integrations/slack/tokens", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const { botToken, appToken } = req.body;
      
      if (!botToken || !appToken) {
        return res.status(400).json({ 
          error: "Both botToken and appToken are required" 
        });
      }

      // Validate tokens by testing connection
      const { WebClient } = await import("@slack/web-api");
      const testClient = new WebClient(botToken);
      const authResult = await testClient.auth.test();
      
      if (!authResult.ok) {
        return res.status(400).json({ 
          error: "Invalid Slack bot token - authentication failed" 
        });
      }

      // Store or update the Slack integration for this team
      const existingIntegration = await storage.getIntegrationByType(teamId, "slack");
      
      if (existingIntegration) {
        await storage.updateIntegration(existingIntegration.id, {
          status: "connected",
          metadata: {
            ...(existingIntegration.metadata as object || {}),
            botToken,
            appToken,
            workspaceId: authResult.team_id,
            workspaceName: authResult.team,
          },
        });
      } else {
        await storage.createIntegration({
          teamId,
          type: "slack",
          status: "connected",
          metadata: {
            botToken,
            appToken,
            workspaceId: authResult.team_id,
            workspaceName: authResult.team,
          },
        });
      }

      // Connect to Slack with these tokens
      const connected = await slackManager.connectTeam(teamId, botToken, appToken);
      
      res.json({ 
        success: true, 
        connected,
        workspace: authResult.team,
        message: connected 
          ? `Connected to Slack workspace: ${authResult.team}` 
          : "Tokens saved but Socket Mode connection failed - will retry automatically"
      });
    } catch (error: any) {
      console.error("Error storing Slack tokens:", error);
      res.status(500).json({ 
        error: error.message || "Failed to store Slack tokens" 
      });
    }
  });

  // Multi-tenant Slack: Disconnect team from Slack
  app.delete("/api/integrations/slack/disconnect", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      
      await slackManager.disconnectTeam(teamId);
      
      const integration = await storage.getIntegrationByType(teamId, "slack");
      if (integration) {
        await storage.updateIntegration(integration.id, {
          status: "disconnected",
          metadata: {},
        });
      }
      
      res.json({ success: true, message: "Disconnected from Slack" });
    } catch (error: any) {
      console.error("Error disconnecting Slack:", error);
      res.status(500).json({ error: "Failed to disconnect from Slack" });
    }
  });

  // Integration Health Dashboard API
  app.get("/api/health/integrations", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      
      // Get team's integrations status
      const integrations = await storage.getIntegrations(teamId);
      
      // Get Slack connection status from manager
      const slackStatus = slackManager.getConnectionStatus(teamId);
      
      // Get job queue stats for this team
      const queueStats = await jobQueue.getStatsForTeam(teamId);
      
      // Build health report
      const health: Record<string, any> = {
        slack: {
          configured: !!integrations.find(i => i.type === "slack" && i.status === "connected"),
          connected: slackStatus.connected,
          workspace: slackStatus.workspaceName || null,
          lastError: slackStatus.error || null,
        },
        notion: {
          configured: !!integrations.find(i => i.type === "notion" && i.status === "connected"),
        },
        googleDrive: {
          configured: !!integrations.find(i => i.type === "google_drive" && i.status === "connected"),
        },
        zoom: {
          configured: !!integrations.find(i => i.type === "zoom" && i.status === "connected"),
        },
        googleMeet: {
          configured: !!integrations.find(i => i.type === "google_meet" && i.status === "connected"),
        },
      };

      // Also check connection status from Replit connectors (global env vars)
      const [notionStatus, driveStatus] = await Promise.all([
        testNotionConnection().catch(() => ({ connected: false })),
        testDriveConnection().catch(() => ({ connected: false })),
      ]);
      
      health.notion.connected = notionStatus.connected;
      health.googleDrive.connected = driveStatus.connected;
      
      res.json({
        teamId,
        integrations: health,
        jobQueue: queueStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error getting health status:", error);
      res.status(500).json({ error: "Failed to get health status" });
    }
  });

  // System-wide health (for admins/debugging)
  // SECURITY: Only system admins can access detailed system info
  app.get("/api/health/system", isAuthenticated, async (req, res) => {
    try {
      if (!await isSystemAdmin(req)) {
        return res.status(403).json({ error: "System admin access required" });
      }
      
      const slackConnections = slackManager.getConnectionStats();
      
      // Check database connection
      let dbConnected = false;
      try {
        await db.execute(sql`SELECT 1`);
        dbConnected = true;
      } catch (e) {
        dbConnected = false;
      }
      
      res.json({
        status: "ok",
        database: { connected: dbConnected },
        slackConnections,
        jobQueue: {
          activeWorkers: jobQueue.getActiveJobCount(),
          workerId: jobQueue.getWorkerId(),
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: "error", 
        error: error.message 
      });
    }
  });

  // Retry failed jobs for the authenticated user's team only
  app.post("/api/health/jobs/retry", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const retried = await jobQueue.retryFailedJobsForTeam(teamId);
      res.json({ success: true, retriedCount: retried });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to retry jobs" });
    }
  });

  // Clear failed jobs for the authenticated user's team only
  app.delete("/api/health/jobs/failed", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const cleared = await jobQueue.clearFailedJobsForTeam(teamId);
      res.json({ success: true, clearedCount: cleared });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to clear jobs" });
    }
  });

  // Error monitoring endpoints (authenticated for security)
  app.get("/api/health/errors", isAuthenticated, async (req, res) => {
    try {
      const { severity, category, resolved, limit } = req.query;
      const errors = await storage.getErrorLogs({
        severity: severity as string | undefined,
        category: category as string | undefined,
        resolved: resolved === "true" ? true : resolved === "false" ? false : undefined,
        limit: limit ? parseInt(limit as string) : 50,
      });
      res.json(errors);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch error logs" });
    }
  });

  app.get("/api/health/errors/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getErrorLogStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch error stats" });
    }
  });

  app.post("/api/health/errors/:id/resolve", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req) || 'system';
      const errorLog = await storage.resolveErrorLog(req.params.id, userId);
      if (!errorLog) {
        return res.status(404).json({ error: "Error log not found" });
      }
      res.json(errorLog);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to resolve error" });
    }
  });

  // Admin endpoints - view all teams with stats
  // SECURITY: Only system admins (platform operators) can access these endpoints
  app.get("/api/admin/teams", isAuthenticated, async (req, res) => {
    try {
      if (!await isSystemAdmin(req)) {
        return res.status(403).json({ error: "System admin access required" });
      }
      const teams = await storage.getAllTeamsWithStats();
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Admin - get job stats for a specific team
  app.get("/api/admin/teams/:teamId/jobs", isAuthenticated, async (req, res) => {
    try {
      if (!await isSystemAdmin(req)) {
        return res.status(403).json({ error: "System admin access required" });
      }
      const { teamId } = req.params;
      const [stats, failedJobs] = await Promise.all([
        storage.getJobStats(teamId),
        storage.getFailedJobs(teamId),
      ]);
      res.json({ stats, failedJobs });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch team jobs" });
    }
  });

  // Admin - retry failed jobs for a specific team
  app.post("/api/admin/teams/:teamId/jobs/retry", isAuthenticated, async (req, res) => {
    try {
      if (!await isSystemAdmin(req)) {
        return res.status(403).json({ error: "System admin access required" });
      }
      const { teamId } = req.params;
      const retried = await storage.retryAllFailedJobs(teamId);
      res.json({ success: true, retriedCount: retried });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to retry jobs" });
    }
  });

  // Admin - clear failed jobs for a specific team
  app.delete("/api/admin/teams/:teamId/jobs/failed", isAuthenticated, async (req, res) => {
    try {
      if (!await isSystemAdmin(req)) {
        return res.status(403).json({ error: "System admin access required" });
      }
      const { teamId } = req.params;
      const cleared = await storage.clearFailedJobs(teamId);
      res.json({ success: true, clearedCount: cleared });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to clear jobs" });
    }
  });

  app.post("/api/process-text", isAuthenticated, aiRateLimiter, suggestionsQuotaMiddleware, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const { text, source } = req.body;
      
      if (!text || !source) {
        return res.status(400).json({ error: "Text and source are required" });
      }

      const result = await processTextForKnowledge(text, source);
      
      if (!result) {
        return res.json({ detected: false });
      }

      const notionPage = await findBestMatchingPageSafe(result.title);
      
      const suggestion = await storage.createSuggestion({
        teamId,
        source: req.body.originalSource || source,
        sourceType: req.body.sourceType || "slack",
        knowledgeType: result.knowledgeType || "fact",
        title: result.title,
        proposedContent: result.content,
        currentContent: notionPage.content,
        confidence: result.confidence,
        sourceLink: req.body.sourceLink || "#",
        notionPageId: notionPage.id,
        notionPageUrl: notionPage.url,
        aiReasoning: result.reasoning,
        metadata: null,
      });

      await storage.incrementSuggestionsUsed(teamId);

      await storage.createActivityLog({
        teamId,
        suggestionId: suggestion.id,
        status: "detected",
        title: result.title,
        source: req.body.originalSource || source,
        sourceType: req.body.sourceType || "slack",
        metadata: null,
      });

      // Send notification to approvers
      notifyNewSuggestion(suggestion).catch(err => 
        console.error("Failed to send suggestion notification:", err)
      );

      broadcastUpdate({ type: "new_suggestion", data: suggestion });
      
      res.json({ detected: true, suggestion });
    } catch (error) {
      console.error("Error processing text:", error);
      res.status(500).json({ error: "Failed to process text" });
    }
  });

  app.post("/api/webhooks/zoom", webhookRateLimiter, async (req, res) => {
    try {
      const signature = req.headers['x-zm-signature'] as string;
      const timestamp = req.headers['x-zm-request-timestamp'] as string;
      
      if (signature && timestamp && req.rawBody && Buffer.isBuffer(req.rawBody)) {
        const isValid = verifyZoomWebhook(req.rawBody, signature, timestamp);
        if (!isValid) {
          console.warn("Invalid Zoom webhook signature");
          return res.status(401).json({ error: "Invalid signature" });
        }
      }

      const event = req.body.event;
      const payload = req.body.payload;

      if (event === "endpoint.url_validation") {
        const plainToken = payload.plainToken;
        const encryptedToken = crypto
          .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET || '')
          .update(plainToken)
          .digest('hex');
        
        return res.json({
          plainToken,
          encryptedToken,
        });
      }

      if (event === "recording.transcript_completed" || event === "recording.completed") {
        const meetingId = payload.object.id;
        const meetingTopic = payload.object.topic || "Zoom Meeting";
        
        console.log(`Zoom transcript ready for meeting: ${meetingTopic} (${meetingId})`);

        const transcript = await getTranscriptFromRecording(meetingId);
        
        if (transcript && transcript.text) {
          const result = await processTextForKnowledge(
            transcript.text,
            `Zoom: ${transcript.meetingTopic}`
          );

          if (result) {
            const notionPage = await findBestMatchingPageSafe(result.title);
            
            const suggestion = await storage.createSuggestion({
              source: transcript.meetingTopic,
              sourceType: "meeting",
              knowledgeType: result.knowledgeType || "fact",
              title: result.title,
              proposedContent: result.content,
              currentContent: notionPage.content,
              confidence: result.confidence,
              sourceLink: `https://zoom.us/recording/${meetingId}`,
              notionPageId: notionPage.id,
              notionPageUrl: notionPage.url,
              aiReasoning: result.reasoning,
              metadata: JSON.stringify({
                meetingId,
                meetingTopic: transcript.meetingTopic,
                startTime: transcript.startTime,
              }),
            });

            await storage.createActivityLog({
              suggestionId: suggestion.id,
              status: "detected",
              title: result.title,
              source: transcript.meetingTopic,
              sourceType: "meeting",
              metadata: null,
            });

            // Send notification to approvers
            notifyNewSuggestion(suggestion).catch(err => 
              console.error("Failed to send suggestion notification:", err)
            );

            broadcastUpdate({ type: "new_suggestion", data: suggestion });
            
            console.log(`Created suggestion from Zoom meeting: ${result.title}`);
          } else {
            console.log("No actionable knowledge detected in Zoom transcript");
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error processing Zoom webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  app.post("/api/webhooks/meet", webhookRateLimiter, async (req, res) => {
    try {
      const conferenceId = req.body.conferenceId;
      const conferenceName = req.body.conferenceName || "Google Meet";

      if (!conferenceId) {
        return res.status(400).json({ error: "conferenceId is required" });
      }

      console.log(`Processing Google Meet transcript for: ${conferenceName}`);

      const transcript = await getMeetTranscript(conferenceId);
      
      if (transcript && transcript.text) {
        const result = await processTextForKnowledge(
          transcript.text,
          `Google Meet: ${conferenceName}`
        );

        if (result) {
          const notionPage = await findBestMatchingPageSafe(result.title);
          
          const suggestion = await storage.createSuggestion({
            source: conferenceName,
            sourceType: "meeting",
            knowledgeType: result.knowledgeType || "fact",
            title: result.title,
            proposedContent: result.content,
            currentContent: notionPage.content,
            confidence: result.confidence,
            sourceLink: transcript.driveFileId 
              ? `https://docs.google.com/document/d/${transcript.driveFileId}`
              : `https://meet.google.com/${conferenceId}`,
            notionPageId: notionPage.id,
            notionPageUrl: notionPage.url,
            aiReasoning: result.reasoning,
            metadata: JSON.stringify({
              conferenceId,
              conferenceName,
              startTime: transcript.startTime,
              participants: transcript.participants,
            }),
          });

          await storage.createActivityLog({
            suggestionId: suggestion.id,
            status: "detected",
            title: result.title,
            source: conferenceName,
            sourceType: "meeting",
            metadata: null,
          });

          // Send notification to approvers
          notifyNewSuggestion(suggestion).catch(err => 
            console.error("Failed to send suggestion notification:", err)
          );

          broadcastUpdate({ type: "new_suggestion", data: suggestion });
          
          console.log(`Created suggestion from Google Meet: ${result.title}`);
          res.json({ success: true, suggestion });
        } else {
          console.log("No actionable knowledge detected in Meet transcript");
          res.json({ success: true, detected: false });
        }
      } else {
        res.status(404).json({ error: "Transcript not found or not ready" });
      }
    } catch (error) {
      console.error("Error processing Meet webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  app.post("/api/webhooks/slack", webhookRateLimiter, async (req, res) => {
    try {
      const signature = req.headers['x-slack-signature'] as string;
      const timestamp = req.headers['x-slack-request-timestamp'] as string;
      
      if (!signature || !timestamp || !req.rawBody || !Buffer.isBuffer(req.rawBody)) {
        console.warn("Slack webhook missing required headers or body");
        return res.status(401).json({ error: "Missing signature or timestamp" });
      }

      const isValid = verifySlackSignature(req.rawBody, timestamp, signature);
      if (!isValid) {
        console.warn("Invalid Slack webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      if (req.body.type === "url_verification") {
        return res.json({ challenge: req.body.challenge });
      }

      if (req.body.type === "event_callback") {
        const event = req.body.event;
        const workspaceId = req.body.team_id;

        if (event.type === "message" && 
            event.channel_type === "channel" && 
            !event.bot_id && 
            !event.subtype) {
          
          console.log(`Slack message received from workspace ${workspaceId}, channel: ${event.channel}`);

          const integration = await storage.getIntegrationByWorkspaceId("slack", workspaceId);
          const teamId = integration?.teamId;
          
          if (!teamId) {
            console.warn(`No team found for Slack workspace ${workspaceId}`);
            return res.json({ success: true });
          }

          handleSlackEventCallback(event, teamId).catch(error => {
            console.error("Error processing Slack event:", error);
          });

          return res.json({ success: true });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error processing Slack webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Onboarding status endpoint
  app.get("/api/onboarding/status", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      
      // Check connected integrations
      const integrations = await storage.getIntegrations(teamId);
      const connectedIntegrations = integrations.filter(i => i.status === "connected");
      
      const notionConnected = connectedIntegrations.some(i => i.type === "notion");
      const sourceConnected = connectedIntegrations.some(i => 
        ["slack", "google_drive", "zoom", "google_meet"].includes(i.type)
      );
      
      // Check if any suggestions have been created
      const suggestions = await storage.getSuggestions(teamId);
      const hasSuggestion = suggestions.length > 0;
      
      const connectedSources = connectedIntegrations
        .filter(i => i.type !== "notion")
        .map(i => i.type);
      
      const completed = notionConnected && sourceConnected && hasSuggestion;
      
      res.json({
        completed,
        steps: {
          notion: notionConnected,
          source: sourceConnected,
          firstSuggestion: hasSuggestion,
        },
        connectedSources,
      });
    } catch (error: any) {
      console.error("Error getting onboarding status:", error);
      res.status(500).json({ error: "Failed to get onboarding status" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      
      const allSuggestions = await storage.getSuggestions(teamId);
      const pendingSuggestions = allSuggestions.filter(s => s.status === "pending");
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const allActivity = await storage.getActivityLog(teamId);
      const approvedToday = allActivity.filter(
        a => a.status === "approved" && new Date(a.createdAt) >= today
      );
      
      const totalApproved = allActivity.filter(a => a.status === "approved").length;
      const totalProcessed = allActivity.length;
      const accuracyRate = totalProcessed > 0 
        ? Math.round((totalApproved / totalProcessed) * 100)
        : 0;

      res.json({
        pending: pendingSuggestions.length,
        approvedToday: approvedToday.length,
        accuracyRate,
      });
    } catch (error: any) {
      console.error("Error getting stats:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Stripe billing routes
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe publishable key:", error);
      res.status(500).json({ error: "Failed to get Stripe configuration" });
    }
  });

  app.get("/api/stripe/products", async (req, res) => {
    try {
      const rows = await stripeService.listProductsWithPrices();
      
      const productsMap = new Map<string, any>();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
            metadata: row.price_metadata,
          });
        }
      }
      
      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error getting Stripe products:", error);
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Get team members count
      const teamMembers = await storage.getTeamMembers(teamId);
      const seatsUsed = teamMembers.length;

      // Get connected integrations count
      const integrations = await storage.getIntegrations(teamId);
      const connectedSources = integrations.filter(
        i => i.status === "connected" && i.type !== "notion"
      ).length;

      // Calculate days remaining in trial
      let daysRemaining: number | null = null;
      if (team.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(team.trialEndsAt);
        const diffMs = trialEnd.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }
      
      if (!team.stripeSubscriptionId) {
        return res.json({ 
          subscription: null,
          plan: team.subscriptionPlan,
          suggestionsUsed: team.suggestionsUsed || 0,
          suggestionsLimit: team.suggestionsLimit || 20,
          seatsUsed,
          seatsLimit: team.seatsLimit || 5,
          sourcesConnected: connectedSources,
          sourcesLimit: team.sourcesLimit || 1,
          trialEndsAt: team.trialEndsAt,
          daysRemaining,
          team: {
            id: team.id,
            name: team.name,
            plan: team.subscriptionPlan,
            status: team.subscriptionStatus,
            trialEndsAt: team.trialEndsAt,
            suggestionsUsed: team.suggestionsUsed,
            suggestionsLimit: team.suggestionsLimit,
            sourcesLimit: team.sourcesLimit,
            seatsLimit: team.seatsLimit,
          }
        });
      }
      
      const subscription = await stripeService.getSubscription(team.stripeSubscriptionId);
      res.json({ 
        subscription,
        plan: team.subscriptionPlan,
        suggestionsUsed: team.suggestionsUsed || 0,
        suggestionsLimit: team.suggestionsLimit || 20,
        seatsUsed,
        seatsLimit: team.seatsLimit || 5,
        sourcesConnected: connectedSources,
        sourcesLimit: team.sourcesLimit || 1,
        trialEndsAt: team.trialEndsAt,
        daysRemaining,
        team: {
          id: team.id,
          name: team.name,
          plan: team.subscriptionPlan,
          status: team.subscriptionStatus,
          currentPeriodEnd: team.currentPeriodEnd,
          suggestionsUsed: team.suggestionsUsed,
          suggestionsLimit: team.suggestionsLimit,
          sourcesLimit: team.sourcesLimit,
          seatsLimit: team.seatsLimit,
        }
      });
    } catch (error: any) {
      console.error("Error getting subscription:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to get subscription" });
    }
  });

  app.post("/api/checkout", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const team = await storage.getTeam(teamId);
      const user = req.user as any;
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      const { priceId, plan } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "priceId is required" });
      }
      
      let customerId = team.stripeCustomerId;
      if (!customerId) {
        const email = user.claims.email || `team-${teamId}@current.app`;
        const customer = await stripeService.createCustomer(email, teamId, team.name);
        await storage.updateTeamSubscription(teamId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/dashboard?checkout=success`,
        `${baseUrl}/pricing?checkout=cancelled`,
        teamId,
        14
      );
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/subscription/sync", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      if (!team.stripeCustomerId) {
        return res.json({ 
          synced: false, 
          message: "No Stripe customer associated with this team" 
        });
      }
      
      const result = await db.execute(
        sql`SELECT * FROM stripe.subscriptions 
            WHERE customer = ${team.stripeCustomerId}
            AND status IN ('active', 'trialing')
            ORDER BY created DESC
            LIMIT 1`
      );
      
      const subscription = result.rows[0] as any;
      
      if (!subscription) {
        if (team.subscriptionStatus === "trialing" && team.trialEndsAt && new Date(team.trialEndsAt) > new Date()) {
          return res.json({ 
            synced: true, 
            message: "Still in trial period",
            status: "trialing"
          });
        }
        
        await storage.updateTeamSubscription(teamId, {
          subscriptionStatus: "expired",
        });
        
        return res.json({ 
          synced: true, 
          message: "No active subscription found",
          status: "expired"
        });
      }
      
      const metadata = subscription.metadata || {};
      const plan = stripeService.getPlanFromMetadata(metadata);
      const planLimits = stripeService.getPlanLimits(plan);
      
      await storage.updateTeamSubscription(teamId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan: plan,
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
        suggestionsLimit: planLimits.suggestionsLimit,
        sourcesLimit: planLimits.sourcesLimit,
        seatsLimit: planLimits.seatsLimit,
      });
      
      res.json({ 
        synced: true, 
        message: `Subscription synced: ${plan} (${subscription.status})`,
        status: subscription.status,
        plan
      });
    } catch (error: any) {
      console.error("Error syncing subscription:", error);
      res.status(500).json({ error: "Failed to sync subscription" });
    }
  });

  app.post("/api/billing-portal", isAuthenticated, async (req, res) => {
    try {
      const teamId = await getTeamIdFromRequest(req);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      if (!team.stripeCustomerId) {
        return res.status(400).json({ error: "No billing account found. Please subscribe to a plan first." });
      }
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCustomerPortalSession(
        team.stripeCustomerId,
        `${baseUrl}/settings`
      );
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating billing portal session:", error);
      if (error.message === "User has no teams") {
        return res.status(400).json({ error: "User must belong to a team" });
      }
      res.status(500).json({ error: "Failed to create billing portal session" });
    }
  });

  app.post("/api/demo-request", apiRateLimiter, async (req, res) => {
    try {
      const { fullName, email, company, teamSize, mainUseCase } = req.body;
      
      if (!fullName || !email || !company || !teamSize || !mainUseCase) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      
      const success = await sendDemoRequest({
        fullName,
        email,
        company,
        teamSize,
        mainUseCase,
      });
      
      if (success) {
        res.json({ success: true, message: "Demo request submitted successfully" });
      } else {
        res.json({ success: true, message: "Demo request received (email confirmation pending)" });
      }
    } catch (error: any) {
      console.error("Error processing demo request:", error);
      res.status(500).json({ error: "Failed to process demo request" });
    }
  });

  app.post("/api/newsletter", apiRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      
      const success = await sendNewsletterSubscription({ email });
      
      if (success) {
        res.json({ success: true, message: "Successfully subscribed to newsletter" });
      } else {
        res.json({ success: true, message: "Subscription received" });
      }
    } catch (error: any) {
      console.error("Error processing newsletter subscription:", error);
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
