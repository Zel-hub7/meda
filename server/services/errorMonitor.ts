import { storage } from "../storage";
import { sendErrorAlert } from "./email";
import type { InsertErrorLog, ErrorLog } from "@shared/schema";

type ErrorSeverity = "info" | "warning" | "error" | "critical";
type ErrorCategory = 
  | "job_failure" 
  | "slack_disconnect" 
  | "notion_error" 
  | "ai_error" 
  | "database_error"
  | "integration_error"
  | "auth_error"
  | "system_error";

interface LogErrorOptions {
  teamId?: string;
  severity?: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class ErrorMonitor {
  private alertCheckInterval: NodeJS.Timeout | null = null;
  private adminEmail: string | null = null;

  async logError(options: LogErrorOptions): Promise<ErrorLog> {
    const { teamId, severity = "error", category, message, context, error } = options;

    console.error(`[ErrorMonitor] [${severity.toUpperCase()}] [${category}] ${message}`, context || {});

    const errorLog = await storage.createErrorLog({
      teamId: teamId || null,
      severity,
      category,
      message,
      context: context || {},
      stack: error?.stack || null,
      resolved: false,
      notificationSent: false,
    });

    if (severity === "critical") {
      await this.sendImmediateAlert(errorLog);
    }

    return errorLog;
  }

  async logJobFailure(teamId: string, jobId: string, jobType: string, error: Error): Promise<void> {
    await this.logError({
      teamId,
      severity: "error",
      category: "job_failure",
      message: `Job ${jobType} failed: ${error.message}`,
      context: { jobId, jobType },
      error,
    });
  }

  async logSlackDisconnect(teamId: string, reason: string): Promise<void> {
    await this.logError({
      teamId,
      severity: "warning",
      category: "slack_disconnect",
      message: `Slack connection lost: ${reason}`,
      context: { reason },
    });
  }

  async logCriticalSlackFailure(teamId: string, reason: string): Promise<void> {
    await this.logError({
      teamId,
      severity: "critical",
      category: "slack_disconnect",
      message: `Slack connection failed after multiple retries: ${reason}`,
      context: { reason },
    });
  }

  async logNotionError(teamId: string, operation: string, error: Error): Promise<void> {
    await this.logError({
      teamId,
      severity: "error",
      category: "notion_error",
      message: `Notion ${operation} failed: ${error.message}`,
      context: { operation },
      error,
    });
  }

  async logAIError(teamId: string, phase: string, error: Error): Promise<void> {
    await this.logError({
      teamId,
      severity: "error",
      category: "ai_error",
      message: `AI ${phase} failed: ${error.message}`,
      context: { phase },
      error,
    });
  }

  async logDatabaseError(operation: string, error: Error): Promise<void> {
    await this.logError({
      severity: "critical",
      category: "database_error",
      message: `Database ${operation} failed: ${error.message}`,
      context: { operation },
      error,
    });
  }

  async logSystemError(component: string, error: Error): Promise<void> {
    await this.logError({
      severity: "critical",
      category: "system_error",
      message: `System error in ${component}: ${error.message}`,
      context: { component },
      error,
    });
  }

  private async sendImmediateAlert(errorLog: ErrorLog): Promise<void> {
    try {
      if (!this.adminEmail) {
        console.log("[ErrorMonitor] No admin email configured, skipping alert");
        return;
      }

      let teamName = "System";
      if (errorLog.teamId) {
        const team = await storage.getTeam(errorLog.teamId);
        teamName = team?.name || "Unknown Team";
      }

      await sendErrorAlert({
        email: this.adminEmail,
        severity: errorLog.severity,
        category: errorLog.category,
        message: errorLog.message,
        teamName,
        timestamp: errorLog.createdAt?.toISOString() || new Date().toISOString(),
        context: errorLog.context as Record<string, any> || {},
      });

      await storage.markNotificationSent(errorLog.id);
      console.log(`[ErrorMonitor] Alert sent for critical error: ${errorLog.id}`);
    } catch (e) {
      console.error("[ErrorMonitor] Failed to send alert:", e);
    }
  }

  async checkAndSendAlerts(): Promise<void> {
    try {
      const unnotifiedErrors = await storage.getUnnotifiedCriticalErrors();
      
      for (const error of unnotifiedErrors) {
        await this.sendImmediateAlert(error);
      }
    } catch (e) {
      console.error("[ErrorMonitor] Failed to check alerts:", e);
    }
  }

  async getStats(): Promise<{ total: number; critical: number; unresolved: number; byCategory: Record<string, number> }> {
    return await storage.getErrorLogStats();
  }

  async getRecentErrors(limit: number = 50): Promise<ErrorLog[]> {
    return await storage.getErrorLogs({ limit, resolved: false });
  }

  async resolveError(errorId: string, resolvedBy: string): Promise<ErrorLog | undefined> {
    return await storage.resolveErrorLog(errorId, resolvedBy);
  }

  setAdminEmail(email: string): void {
    this.adminEmail = email;
    console.log(`[ErrorMonitor] Admin email set for alerts`);
  }

  startAlertChecker(intervalMs: number = 5 * 60 * 1000): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }

    this.alertCheckInterval = setInterval(() => {
      this.checkAndSendAlerts();
    }, intervalMs);

    console.log(`[ErrorMonitor] Alert checker started (runs every ${intervalMs / 1000}s)`);
  }

  stopAlertChecker(): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
      console.log("[ErrorMonitor] Alert checker stopped");
    }
  }
}

export const errorMonitor = new ErrorMonitor();
