import { RequestHandler } from "express";
import { storage } from "../storage";

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  message?: string;
}

export async function checkSuggestionsQuota(teamId: string): Promise<QuotaCheckResult> {
  const team = await storage.getTeam(teamId);
  if (!team) {
    return { allowed: false, used: 0, limit: 0, message: "Team not found" };
  }

  const used = team.suggestionsUsed ?? 0;
  const limit = team.suggestionsLimit ?? 0;

  if (limit === -1) {
    return { allowed: true, used, limit: -1 };
  }

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      message: `Suggestions quota exceeded. You've used ${used} of ${limit} suggestions this month.`,
    };
  }

  return { allowed: true, used, limit };
}

export async function checkSeatsQuota(teamId: string): Promise<QuotaCheckResult> {
  const team = await storage.getTeam(teamId);
  if (!team) {
    return { allowed: false, used: 0, limit: 0, message: "Team not found" };
  }

  const members = await storage.getTeamMembers(teamId);
  const used = members.length;
  const limit = team.seatsLimit ?? 5;

  if (limit === -1) {
    return { allowed: true, used, limit: -1 };
  }

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      message: `Seats quota exceeded. You have ${used} of ${limit} team members.`,
    };
  }

  return { allowed: true, used, limit };
}

export async function checkSourcesQuota(teamId: string): Promise<QuotaCheckResult> {
  const team = await storage.getTeam(teamId);
  if (!team) {
    return { allowed: false, used: 0, limit: 0, message: "Team not found" };
  }

  const integrations = await storage.getIntegrations(teamId);
  const used = integrations.filter(i => i.status === "active").length;
  const limit = team.sourcesLimit ?? 3;

  if (limit === -1) {
    return { allowed: true, used, limit: -1 };
  }

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      message: `Sources quota exceeded. You have ${used} of ${limit} integrations connected.`,
    };
  }

  return { allowed: true, used, limit };
}

export function createSuggestionsQuotaMiddleware(): RequestHandler {
  return async (req, res, next) => {
    try {
      const user = req.user as any;
      if (!user?.claims?.sub) {
        return next();
      }

      const userId = user.claims.sub;
      const teams = await storage.getTeamsByUserId(userId);
      if (teams.length === 0) {
        return next();
      }

      const teamId = teams[0].id;
      const result = await checkSuggestionsQuota(teamId);

      if (!result.allowed) {
        return res.status(402).json({
          error: "Quota exceeded",
          message: result.message,
          quotaType: "suggestions",
          used: result.used,
          limit: result.limit,
          upgradeUrl: "/pricing",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking suggestions quota:", error);
      next();
    }
  };
}

export function createSeatsQuotaMiddleware(): RequestHandler {
  return async (req, res, next) => {
    try {
      const teamId = req.params.teamId;
      if (!teamId) {
        return next();
      }

      const result = await checkSeatsQuota(teamId);

      if (!result.allowed) {
        return res.status(402).json({
          error: "Quota exceeded",
          message: result.message,
          quotaType: "seats",
          used: result.used,
          limit: result.limit,
          upgradeUrl: "/pricing",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking seats quota:", error);
      next();
    }
  };
}

export function createSourcesQuotaMiddleware(): RequestHandler {
  return async (req, res, next) => {
    try {
      const user = req.user as any;
      if (!user?.claims?.sub) {
        return next();
      }

      const userId = user.claims.sub;
      const teams = await storage.getTeamsByUserId(userId);
      if (teams.length === 0) {
        return next();
      }

      const teamId = teams[0].id;
      const result = await checkSourcesQuota(teamId);

      if (!result.allowed) {
        return res.status(402).json({
          error: "Quota exceeded",
          message: result.message,
          quotaType: "sources",
          used: result.used,
          limit: result.limit,
          upgradeUrl: "/pricing",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking sources quota:", error);
      next();
    }
  };
}

export const suggestionsQuotaMiddleware = createSuggestionsQuotaMiddleware();
export const seatsQuotaMiddleware = createSeatsQuotaMiddleware();
export const sourcesQuotaMiddleware = createSourcesQuotaMiddleware();

export async function checkTrialStatus(teamId: string): Promise<{
  isActive: boolean;
  daysRemaining: number;
  message?: string;
}> {
  const team = await storage.getTeam(teamId);
  if (!team) {
    return { isActive: false, daysRemaining: 0, message: "Team not found" };
  }

  if (team.subscriptionStatus === "active") {
    return { isActive: true, daysRemaining: -1 };
  }

  if (team.subscriptionStatus !== "trialing" || !team.trialEndsAt) {
    return { isActive: false, daysRemaining: 0, message: "Subscription inactive" };
  }

  const now = new Date();
  const trialEnd = new Date(team.trialEndsAt);
  const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { isActive: false, daysRemaining: 0, message: "Trial expired" };
  }

  return { isActive: true, daysRemaining };
}

export function createTrialCheckMiddleware(): RequestHandler {
  return async (req, res, next) => {
    try {
      const user = req.user as any;
      if (!user?.claims?.sub) {
        return next();
      }

      const userId = user.claims.sub;
      const teams = await storage.getTeamsByUserId(userId);
      if (teams.length === 0) {
        return next();
      }

      const teamId = teams[0].id;
      const result = await checkTrialStatus(teamId);

      if (!result.isActive && result.daysRemaining <= 0) {
        return res.status(402).json({
          error: "Subscription required",
          message: result.message || "Your trial has expired. Please subscribe to continue using the service.",
          upgradeUrl: "/pricing",
        });
      }

      next();
    } catch (error) {
      console.error("Error checking trial status:", error);
      next();
    }
  };
}

export const trialCheckMiddleware = createTrialCheckMiddleware();

export async function getTeamQuotaStatus(teamId: string): Promise<{
  suggestions: QuotaCheckResult;
  seats: QuotaCheckResult;
  sources: QuotaCheckResult;
  trial: { isActive: boolean; daysRemaining: number };
}> {
  const [suggestions, seats, sources, trial] = await Promise.all([
    checkSuggestionsQuota(teamId),
    checkSeatsQuota(teamId),
    checkSourcesQuota(teamId),
    checkTrialStatus(teamId),
  ]);

  return { suggestions, seats, sources, trial };
}
