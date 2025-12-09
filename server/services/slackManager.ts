import { WebClient } from "@slack/web-api";
import { SocketModeClient } from "@slack/socket-mode";
import { storage } from "../storage";
import { SlackMessage, processSlackMessageForKnowledge, SlackConnectionStatus } from "./slack";

interface TeamSlackConnection {
  teamId: string;
  socketClient: SocketModeClient | null;
  webClient: WebClient;
  workspaceId?: string;
  workspaceName?: string;
  connected: boolean;
  lastError?: string;
  lastConnected?: Date;
  lastActivity?: Date;
  lastHeartbeat?: Date;
  reconnectAttempts: number;
  connectionStarted?: Date;
}

class SlackClientManager {
  private connections: Map<string, TeamSlackConnection> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private stagedStartupDelay = 2000; // 2 second delay between team connections
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatCheckMs = 60000; // Check heartbeats every minute
  private maxIdleTimeMs = 3600000; // 1 hour idle = potential cleanup candidate
  private maxConnectionsPerBatch = 5; // Connect 5 teams at a time

  async initializeAllTeams(): Promise<void> {
    console.log("[SlackManager] Initializing connections for all teams with Slack integrations...");
    
    try {
      const teams = await this.getTeamsWithSlackIntegration();
      console.log(`[SlackManager] Found ${teams.length} teams with Slack integrations`);
      
      // Staged startup: connect teams in batches to avoid overwhelming the system
      await this.stagedConnect(teams);
      
      // Start heartbeat monitoring
      this.startHeartbeatMonitor();
      
      console.log(`[SlackManager] Multi-tenant Slack manager initialized with staged startup`);
    } catch (error) {
      console.error("[SlackManager] Error initializing teams:", error);
    }
  }

  private async stagedConnect(teams: Array<{ teamId: string; botToken: string; appToken: string }>): Promise<void> {
    // Connect teams in batches with delays
    for (let i = 0; i < teams.length; i += this.maxConnectionsPerBatch) {
      const batch = teams.slice(i, i + this.maxConnectionsPerBatch);
      
      // Connect this batch in parallel
      await Promise.allSettled(
        batch.map(team => this.connectTeam(team.teamId, team.botToken, team.appToken))
      );
      
      // Wait before next batch (if there are more teams)
      if (i + this.maxConnectionsPerBatch < teams.length) {
        console.log(`[SlackManager] Staged startup: waiting ${this.stagedStartupDelay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, this.stagedStartupDelay));
      }
    }
  }

  private startHeartbeatMonitor(): void {
    if (this.heartbeatInterval) return;
    
    console.log("[SlackManager] Starting heartbeat monitor...");
    this.heartbeatInterval = setInterval(() => this.checkHeartbeats(), this.heartbeatCheckMs);
  }

  private stopHeartbeatMonitor(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private checkHeartbeats(): void {
    const now = new Date();
    let activeCount = 0;
    let idleCount = 0;
    let disconnectedCount = 0;

    for (const [teamId, connection] of this.connections) {
      if (!connection.connected) {
        disconnectedCount++;
        continue;
      }

      // Update heartbeat for connected sockets
      connection.lastHeartbeat = now;
      
      // Check for idle connections
      const lastActivity = connection.lastActivity || connection.lastConnected || connection.connectionStarted;
      if (lastActivity) {
        const idleTime = now.getTime() - lastActivity.getTime();
        if (idleTime > this.maxIdleTimeMs) {
          idleCount++;
        } else {
          activeCount++;
        }
      } else {
        activeCount++;
      }
    }

    console.log(`[SlackManager] Heartbeat: ${activeCount} active, ${idleCount} idle, ${disconnectedCount} disconnected connections`);
  }

  // Mark activity for a team (called when messages are received)
  markTeamActivity(teamId: string): void {
    const connection = this.connections.get(teamId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  private async getTeamsWithSlackIntegration(): Promise<Array<{ teamId: string; botToken: string; appToken: string }>> {
    const result: Array<{ teamId: string; botToken: string; appToken: string }> = [];
    
    try {
      const allTeams = await storage.getAllTeams();
      
      for (const team of allTeams) {
        const integration = await storage.getIntegrationByType(team.id, "slack");
        
        if (integration?.status === "connected" && integration.metadata) {
          const metadata = integration.metadata as any;
          if (metadata.botToken && metadata.appToken) {
            result.push({
              teamId: team.id,
              botToken: metadata.botToken,
              appToken: metadata.appToken,
            });
          }
        }
      }
    } catch (error) {
      console.error("[SlackManager] Error fetching teams with Slack:", error);
    }
    
    return result;
  }

  async connectTeam(teamId: string, botToken: string, appToken: string): Promise<boolean> {
    console.log(`[SlackManager] Connecting team ${teamId} to Slack...`);
    
    if (this.connections.has(teamId)) {
      await this.disconnectTeam(teamId);
    }

    try {
      const webClient = new WebClient(botToken);
      
      const authResult = await webClient.auth.test();
      if (!authResult.ok) {
        throw new Error("Auth test failed");
      }

      const now = new Date();
      const connection: TeamSlackConnection = {
        teamId,
        socketClient: null,
        webClient,
        workspaceId: authResult.team_id as string,
        workspaceName: authResult.team as string,
        connected: false,
        reconnectAttempts: 0,
        connectionStarted: now,
        lastActivity: now,
      };

      const socketClient = new SocketModeClient({ appToken });

      socketClient.on("message", async ({ event, ack }) => {
        await ack();
        
        // Mark activity for this team
        this.markTeamActivity(teamId);
        
        if (event.subtype === "bot_message" || event.bot_id) {
          return;
        }

        const message: SlackMessage = {
          text: event.text || "",
          user: event.user,
          channel: event.channel,
          timestamp: event.ts,
          threadTs: event.thread_ts,
        };

        this.queueMessageProcessing(teamId, message);
      });

      socketClient.on("connected", () => {
        console.log(`[SlackManager] Team ${teamId} connected to Slack (${connection.workspaceName})`);
        connection.connected = true;
        connection.lastConnected = new Date();
        connection.reconnectAttempts = 0;
      });

      socketClient.on("disconnected", () => {
        console.log(`[SlackManager] Team ${teamId} disconnected from Slack`);
        connection.connected = false;
        this.scheduleReconnect(teamId, botToken, appToken);
      });

      socketClient.on("error", (error) => {
        console.error(`[SlackManager] Team ${teamId} Slack error:`, error.message);
        connection.lastError = error.message;
        connection.connected = false;
      });

      connection.socketClient = socketClient;
      this.connections.set(teamId, connection);

      await socketClient.start();
      return true;
    } catch (error: any) {
      console.error(`[SlackManager] Failed to connect team ${teamId}:`, error.message);
      
      this.connections.set(teamId, {
        teamId,
        socketClient: null,
        webClient: new WebClient(botToken),
        connected: false,
        lastError: error.message,
        reconnectAttempts: 0,
      });
      
      return false;
    }
  }

  private scheduleReconnect(teamId: string, botToken: string, appToken: string): void {
    const connection = this.connections.get(teamId);
    if (!connection) return;

    if (connection.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[SlackManager] Team ${teamId} max reconnect attempts reached`);
      return;
    }

    connection.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, connection.reconnectAttempts - 1);
    
    console.log(`[SlackManager] Scheduling reconnect for team ${teamId} in ${delay}ms (attempt ${connection.reconnectAttempts})`);
    
    setTimeout(async () => {
      const currentConnection = this.connections.get(teamId);
      if (currentConnection && !currentConnection.connected) {
        await this.connectTeam(teamId, botToken, appToken);
      }
    }, delay);
  }

  private queueMessageProcessing(teamId: string, message: SlackMessage): void {
    jobQueue.addJob({
      type: "slack_message",
      teamId,
      data: message,
    });
  }

  async disconnectTeam(teamId: string): Promise<void> {
    const connection = this.connections.get(teamId);
    if (connection) {
      // Disconnect socket if active
      if (connection.socketClient) {
        try {
          await connection.socketClient.disconnect();
        } catch (error) {
          console.error(`[SlackManager] Error disconnecting team ${teamId}:`, error);
        }
      }
      // Clear the connection object to remove tokens from memory
      connection.socketClient = null;
      (connection as any).webClient = null;
    }
    this.connections.delete(teamId);
    console.log(`[SlackManager] Team ${teamId} disconnected and tokens cleared from memory`);
  }

  async disconnectAll(): Promise<void> {
    this.stopHeartbeatMonitor();
    for (const teamId of this.connections.keys()) {
      await this.disconnectTeam(teamId);
    }
  }

  // Get detailed connection stats for health dashboard
  getConnectionStats(): { total: number; connected: number; disconnected: number; idle: number } {
    let connected = 0;
    let disconnected = 0;
    let idle = 0;
    const now = new Date();

    for (const connection of this.connections.values()) {
      if (!connection.connected) {
        disconnected++;
      } else {
        const lastActivity = connection.lastActivity || connection.lastConnected;
        const idleTime = lastActivity ? now.getTime() - lastActivity.getTime() : 0;
        if (idleTime > this.maxIdleTimeMs) {
          idle++;
        } else {
          connected++;
        }
      }
    }

    return { total: this.connections.size, connected, disconnected, idle };
  }

  getConnectionStatus(teamId: string): SlackConnectionStatus {
    const connection = this.connections.get(teamId);
    
    if (!connection) {
      return { connected: false, error: "No connection configured" };
    }

    return {
      connected: connection.connected,
      workspaceName: connection.workspaceName,
      workspaceId: connection.workspaceId,
      error: connection.lastError,
    };
  }

  getWebClient(teamId: string): WebClient | null {
    return this.connections.get(teamId)?.webClient || null;
  }

  getAllConnectionStatuses(): Map<string, SlackConnectionStatus> {
    const statuses = new Map<string, SlackConnectionStatus>();
    for (const [teamId, connection] of this.connections) {
      statuses.set(teamId, {
        connected: connection.connected,
        workspaceName: connection.workspaceName,
        workspaceId: connection.workspaceId,
        error: connection.lastError,
      });
    }
    return statuses;
  }

  getConnectedTeamsCount(): number {
    let count = 0;
    for (const connection of this.connections.values()) {
      if (connection.connected) count++;
    }
    return count;
  }
}

type JobType = "slack_message" | "drive_file" | "zoom_transcript" | "meet_transcript";

class PersistentJobQueue {
  private processInterval: NodeJS.Timeout | null = null;
  private activeJobs = 0;
  private maxConcurrent = 5; // Increased for 50 teams
  private maxPerTeam = 2; // Max concurrent jobs per team
  private workerId: string;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  start(): void {
    if (this.processInterval) return;
    
    console.log(`[JobQueue] Starting persistent job processor (worker: ${this.workerId})...`);
    this.processInterval = setInterval(() => this.processJobs(), 1000);
    
    // Clean up completed jobs older than 7 days, every hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000);
  }

  stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  async addJob(params: { type: JobType; teamId: string; data: any; priority?: number }): Promise<string> {
    try {
      const job = await storage.createJob({
        teamId: params.teamId,
        type: params.type,
        data: params.data,
        status: "pending",
        priority: params.priority || 0,
        attempts: 0,
        maxAttempts: 3,
      });
      
      console.log(`[JobQueue] Added job ${job.id} (${params.type}) for team ${params.teamId}`);
      return job.id;
    } catch (error: any) {
      console.error(`[JobQueue] Failed to add job:`, error.message);
      throw error;
    }
  }

  private async processJobs(): Promise<void> {
    if (this.activeJobs >= this.maxConcurrent) return;

    try {
      // Claim a job atomically from the database
      const job = await storage.claimNextJob(this.workerId, this.maxPerTeam);
      
      if (!job) return; // No jobs available

      this.activeJobs++;
      
      this.executeJob(job)
        .then(async () => {
          await storage.completeJob(job.id);
          console.log(`[JobQueue] Job ${job.id} completed successfully`);
        })
        .catch(async (error) => {
          console.error(`[JobQueue] Job ${job.id} failed:`, error.message);
          await storage.failJob(job.id, error.message);
        })
        .finally(() => {
          this.activeJobs--;
        });
    } catch (error: any) {
      console.error(`[JobQueue] Error processing jobs:`, error.message);
    }
  }

  private async executeJob(job: { id: string; type: string; teamId: string; data: any }): Promise<void> {
    console.log(`[JobQueue] Processing job ${job.id} (${job.type}) for team ${job.teamId}`);
    
    const jobData = job.data as any;
    
    switch (job.type) {
      case "slack_message":
        await processSlackMessageForKnowledge(jobData, job.teamId, false);
        break;
      
      case "drive_file":
        const { processDriveFileForKnowledge } = await import("./drive");
        await processDriveFileForKnowledge(jobData.fileId, jobData.fileName, job.teamId);
        break;
      
      case "zoom_transcript":
        const { processZoomTranscript } = await import("./zoom");
        await processZoomTranscript(jobData.transcript, jobData.meetingTopic, job.teamId);
        break;
      
      case "meet_transcript":
        const { processMeetTranscript } = await import("./meet");
        await processMeetTranscript(jobData, job.teamId);
        break;
      
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  private async cleanup(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const cleaned = await storage.cleanupOldJobs(sevenDaysAgo);
      if (cleaned > 0) {
        console.log(`[JobQueue] Cleaned up ${cleaned} old completed jobs`);
      }
    } catch (error: any) {
      console.error(`[JobQueue] Cleanup error:`, error.message);
    }
  }

  // Team-scoped methods using storage
  async getStatsForTeam(teamId: string): Promise<{ pending: number; processing: number; failed: number; completed: number }> {
    return await storage.getJobStats(teamId);
  }

  async retryFailedJobsForTeam(teamId: string): Promise<number> {
    return await storage.retryAllFailedJobs(teamId);
  }

  async clearFailedJobsForTeam(teamId: string): Promise<number> {
    return await storage.clearFailedJobs(teamId);
  }

  async getFailedJobsForTeam(teamId: string): Promise<any[]> {
    return await storage.getFailedJobs(teamId);
  }

  // Global stats (for system health)
  getActiveJobCount(): number {
    return this.activeJobs;
  }

  getWorkerId(): string {
    return this.workerId;
  }
}

export const slackManager = new SlackClientManager();
export const jobQueue = new PersistentJobQueue();

export async function initializeSlackManager(): Promise<void> {
  jobQueue.start();
  await slackManager.initializeAllTeams();
}

export async function shutdownSlackManager(): Promise<void> {
  jobQueue.stop();
  await slackManager.disconnectAll();
}
