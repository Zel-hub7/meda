import { storage } from "../storage";
import { 
  sendSuggestionNotification, 
  sendTrialWarning,
  sendTrialExpired 
} from "./email";
import type { Suggestion, Team, User } from "@shared/schema";

export async function notifyNewSuggestion(suggestion: Suggestion): Promise<void> {
  try {
    if (!suggestion.teamId) {
      console.log("No teamId for suggestion, skipping notification");
      return;
    }

    const team = await storage.getTeam(suggestion.teamId);
    if (!team) {
      console.log(`Team ${suggestion.teamId} not found, skipping notification`);
      return;
    }

    const settings = await storage.getSettings(suggestion.teamId);
    if (settings && !settings.notifyOnNewSuggestions) {
      console.log(`Team ${suggestion.teamId} has new suggestion notifications disabled`);
      return;
    }

    const members = await storage.getTeamMembers(suggestion.teamId);
    const approvers = members.filter(m => m.canApprove);

    if (approvers.length === 0) {
      console.log(`No approvers found for team ${suggestion.teamId}`);
      return;
    }

    for (const member of approvers) {
      const user = await storage.getUser(member.userId);
      if (!user || !user.email) continue;

      await sendSuggestionNotification({
        email: user.email,
        userName: user.displayName || user.username || "there",
        suggestions: [{
          title: suggestion.title,
          confidence: suggestion.confidence,
          source: suggestion.source,
        }],
      });
    }

    console.log(`Notified ${approvers.length} approvers about new suggestion "${suggestion.title}"`);
  } catch (error) {
    console.error("Failed to send new suggestion notification:", error);
  }
}

export async function checkAndSendTrialWarnings(): Promise<void> {
  try {
    const teams = await storage.getAllTeams();
    const now = new Date();

    for (const team of teams) {
      if (!team.trialEndsAt) continue;
      if (team.subscriptionStatus !== "trialing") continue;

      const trialEnd = new Date(team.trialEndsAt);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        await handleTrialExpired(team);
      } else if ([7, 3, 1].includes(daysRemaining)) {
        await handleTrialWarning(team, daysRemaining);
      }
    }
  } catch (error) {
    console.error("Failed to check trial warnings:", error);
  }
}

async function handleTrialWarning(team: Team, daysRemaining: number): Promise<void> {
  const logKey = `trial_warning_${team.id}_${daysRemaining}`;
  
  const recentLogs = await storage.getActivityLog(team.id, { 
    limit: 100 
  });
  const alreadySent = recentLogs.some(log => 
    log.title === logKey && 
    new Date(log.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  
  if (alreadySent) {
    return;
  }

  const members = await storage.getTeamMembers(team.id);
  const owners = members.filter(m => m.role === "owner");

  for (const owner of owners) {
    const user = await storage.getUser(owner.userId);
    if (!user || !user.email) continue;

    await sendTrialWarning({
      email: user.email,
      userName: user.displayName || user.username || "there",
      teamName: team.name,
      daysRemaining,
    });
  }

  await storage.createActivityLog({
    teamId: team.id,
    title: logKey,
    sourceType: "system",
    status: "info",
    description: `Sent ${daysRemaining}-day trial warning to team owners`,
  });

  console.log(`Sent ${daysRemaining}-day trial warning for team ${team.name}`);
}

async function handleTrialExpired(team: Team): Promise<void> {
  const logKey = `trial_expired_${team.id}`;
  
  const recentLogs = await storage.getActivityLog(team.id, { 
    limit: 100 
  });
  const alreadySent = recentLogs.some(log => 
    log.title === logKey && 
    new Date(log.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  
  if (alreadySent) {
    return;
  }

  const members = await storage.getTeamMembers(team.id);
  const owners = members.filter(m => m.role === "owner");

  for (const owner of owners) {
    const user = await storage.getUser(owner.userId);
    if (!user || !user.email) continue;

    await sendTrialExpired({
      email: user.email,
      userName: user.displayName || user.username || "there",
      teamName: team.name,
    });
  }

  await storage.createActivityLog({
    teamId: team.id,
    title: logKey,
    sourceType: "system",
    status: "warning",
    description: `Trial expired notification sent to team owners`,
  });

  console.log(`Sent trial expired notification for team ${team.name}`);
}

let trialWarningInterval: NodeJS.Timeout | null = null;

export function startTrialWarningScheduler(): void {
  checkAndSendTrialWarnings();
  
  trialWarningInterval = setInterval(
    checkAndSendTrialWarnings,
    6 * 60 * 60 * 1000
  );

  console.log("Trial warning scheduler started (runs every 6 hours)");
}

export function stopTrialWarningScheduler(): void {
  if (trialWarningInterval) {
    clearInterval(trialWarningInterval);
    trialWarningInterval = null;
    console.log("Trial warning scheduler stopped");
  }
}
