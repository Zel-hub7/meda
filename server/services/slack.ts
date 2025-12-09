import { WebClient } from "@slack/web-api";
import { SocketModeClient } from "@slack/socket-mode";
import crypto from "crypto";
import { processTextForKnowledge, MessageContext } from "./ai";
import { findBestMatchingPage } from "./notion";
import { storage } from "../storage";
import { checkSuggestionsQuota } from "../middleware/quotas";
import { notifyNewSuggestion } from "./notifications";

export interface SlackMessage {
  text: string;
  user: string;
  channel: string;
  timestamp: string;
  threadTs?: string;
  // Enriched context (populated when available)
  channelName?: string;
  userName?: string;
  userTitle?: string;
  threadContext?: string[];
}

export interface SlackEvent {
  type: string;
  user: string;
  text: string;
  ts: string;
  channel: string;
  event_ts: string;
  channel_type?: string;
  thread_ts?: string;
  bot_id?: string;
}

export interface SlackConnectionStatus {
  connected: boolean;
  workspaceName?: string;
  workspaceId?: string;
  botUserId?: string;
  error?: string;
}

let socketModeClient: SocketModeClient | null = null;
let webClient: WebClient | null = null;
let isConnected = false;

export function verifySlackSignature(
  rawBody: Buffer,
  timestamp: string,
  signature: string
): boolean {
  try {
    if (!process.env.SLACK_SIGNING_SECRET) {
      console.error("CRITICAL: SLACK_SIGNING_SECRET not configured.");
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - requestTime) > 300) {
      console.error("Slack request timestamp too old");
      return false;
    }

    const sigBasestring = `v0:${timestamp}:${rawBody.toString("utf8")}`;
    const mySignature =
      "v0=" +
      crypto
        .createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
        .update(sigBasestring)
        .digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(mySignature, "utf8");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error verifying Slack signature:", error);
    return false;
  }
}

export function getSlackMessageLink(channel: string, timestamp: string | undefined): string {
  if (!timestamp) {
    return `https://slack.com/archives/${channel || 'unknown'}/p${Date.now()}`;
  }
  return `https://slack.com/archives/${channel || 'unknown'}/p${timestamp.replace(".", "")}`;
}

export async function testSlackConnection(): Promise<SlackConnectionStatus> {
  try {
    if (!process.env.SLACK_BOT_TOKEN) {
      return {
        connected: false,
        error: "SLACK_BOT_TOKEN not configured. Add it in Settings > Secrets.",
      };
    }

    const client = new WebClient(process.env.SLACK_BOT_TOKEN);
    const authResult = await client.auth.test();

    return {
      connected: authResult.ok === true,
      workspaceName: authResult.team as string | undefined,
      workspaceId: authResult.team_id as string | undefined,
      botUserId: authResult.user_id as string | undefined,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || "Failed to connect to Slack",
    };
  }
}

export function getWebClient(): WebClient | null {
  if (!webClient && process.env.SLACK_BOT_TOKEN) {
    webClient = new WebClient(process.env.SLACK_BOT_TOKEN);
  }
  return webClient;
}

export async function initializeSlackSocketMode(
  teamId: string,
  onMessage: (message: SlackMessage, teamId: string) => Promise<void>
): Promise<boolean> {
  if (!process.env.SLACK_APP_TOKEN) {
    console.warn("SLACK_APP_TOKEN not configured. Socket Mode will not be initialized.");
    return false;
  }

  if (!process.env.SLACK_BOT_TOKEN) {
    console.warn("SLACK_BOT_TOKEN not configured. Socket Mode will not be initialized.");
    return false;
  }

  try {
    if (socketModeClient) {
      await socketModeClient.disconnect();
    }

    socketModeClient = new SocketModeClient({
      appToken: process.env.SLACK_APP_TOKEN,
    });

    webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

    socketModeClient.on("message", async ({ event, ack }) => {
      await ack();
      
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

      try {
        await onMessage(message, teamId);
      } catch (error) {
        console.error("Error processing Slack message:", error);
      }
    });

    socketModeClient.on("app_mention", async ({ event, ack }) => {
      await ack();
      console.log("Bot was mentioned:", event.text);
    });

    socketModeClient.on("error", (error) => {
      console.error("Slack Socket Mode error:", error);
      isConnected = false;
    });

    socketModeClient.on("connected", () => {
      console.log("Connected to Slack via Socket Mode");
      isConnected = true;
    });

    socketModeClient.on("disconnected", () => {
      console.log("Disconnected from Slack Socket Mode");
      isConnected = false;
    });

    await socketModeClient.start();
    return true;
  } catch (error) {
    console.error("Failed to initialize Slack Socket Mode:", error);
    return false;
  }
}

export async function disconnectSlackSocketMode(): Promise<void> {
  if (socketModeClient) {
    await socketModeClient.disconnect();
    socketModeClient = null;
    isConnected = false;
  }
}

export function isSlackConnected(): boolean {
  return isConnected;
}

export async function postToSlack(
  channel: string,
  message: string,
  threadTs?: string
): Promise<boolean> {
  try {
    const client = getWebClient();
    if (!client) {
      console.warn("Slack client not available");
      return false;
    }

    await client.chat.postMessage({
      channel,
      text: message,
      thread_ts: threadTs,
    });

    return true;
  } catch (error) {
    console.error("Error posting to Slack:", error);
    return false;
  }
}

export async function listSlackChannels(): Promise<Array<{ id: string; name: string; isMember: boolean }>> {
  try {
    const client = getWebClient();
    if (!client) {
      return [];
    }

    const result = await client.conversations.list({
      types: "public_channel,private_channel",
      limit: 100,
    });

    return (result.channels || []).map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      isMember: channel.is_member || false,
    }));
  } catch (error) {
    console.error("Error listing Slack channels:", error);
    return [];
  }
}

export async function joinSlackChannel(channelId: string): Promise<boolean> {
  try {
    const client = getWebClient();
    if (!client) {
      return false;
    }

    await client.conversations.join({ channel: channelId });
    return true;
  } catch (error: any) {
    if (error.data?.error === "already_in_channel") {
      return true;
    }
    console.error("Error joining Slack channel:", error);
    return false;
  }
}

export interface SlackProcessingResult {
  processed: boolean;
  suggestionCreated: boolean;
  suggestionId?: string;
  title?: string;
  confidence?: number;
  reason?: string;
  error?: string;
}

export async function processSlackMessageForKnowledge(
  message: SlackMessage,
  teamId: string,
  skipEnrichment: boolean = false
): Promise<SlackProcessingResult> {
  if (!message.text || message.text.length < 20) {
    return { processed: false, suggestionCreated: false, reason: "Message too short" };
  }

  // Check quota before processing
  const quotaCheck = await checkSuggestionsQuota(teamId);
  if (!quotaCheck.allowed) {
    console.log(`Suggestions quota exceeded for team ${teamId}: ${quotaCheck.used}/${quotaCheck.limit}`);
    return { 
      processed: false, 
      suggestionCreated: false, 
      reason: `Quota exceeded: ${quotaCheck.message}` 
    };
  }

  try {
    // Enrich message with channel/user info if we have Slack credentials
    let enrichedMessage = message;
    if (!skipEnrichment && getWebClient()) {
      enrichedMessage = await enrichSlackMessage(message);
    }
    
    // Build context for AI
    const context: MessageContext = {
      channelName: enrichedMessage.channelName,
      userName: enrichedMessage.userName,
      userTitle: enrichedMessage.userTitle,
      threadContext: enrichedMessage.threadContext,
    };
    
    const result = await processTextForKnowledge(message.text, "Slack", context);
    
    if (!result) {
      return { 
        processed: true, 
        suggestionCreated: false, 
        reason: "AI determined content is not actionable knowledge" 
      };
    }
    
    if (result.confidence < 70) {
      return { 
        processed: true, 
        suggestionCreated: false, 
        reason: `Confidence too low: ${result.confidence}%`,
        confidence: result.confidence 
      };
    }

    const notionPage = await findBestMatchingPage(result.title).catch(() => null);

    const suggestion = await storage.createSuggestion({
      teamId,
      source: "Slack",
      sourceType: "slack",
      knowledgeType: result.knowledgeType || "fact",
      title: result.title,
      proposedContent: result.content,
      currentContent: notionPage?.content || null,
      confidence: result.confidence,
      sourceLink: getSlackMessageLink(message.channel, message.timestamp),
      notionPageId: notionPage?.id || null,
      notionPageUrl: notionPage?.url || "https://notion.so",
      aiReasoning: result.reasoning,
      metadata: {
        slackChannel: enrichedMessage.channelName || message.channel,
        slackUser: enrichedMessage.userName || message.user,
        slackTimestamp: message.timestamp,
        threadTs: message.threadTs,
      },
    });

    // Increment usage counter
    await storage.incrementSuggestionsUsed(teamId);

    await storage.createActivityLog({
      teamId,
      suggestionId: suggestion.id,
      status: "detected",
      title: result.title,
      source: "Slack",
      sourceType: "slack",
      metadata: {
        channel: enrichedMessage.channelName || message.channel,
        user: enrichedMessage.userName || message.user,
      },
    });

    // Send notification to approvers
    notifyNewSuggestion(suggestion).catch(err => 
      console.error("Failed to send suggestion notification:", err)
    );

    console.log(`Created suggestion from Slack message: ${result.title}`);
    
    return {
      processed: true,
      suggestionCreated: true,
      suggestionId: suggestion.id,
      title: result.title,
      confidence: result.confidence,
    };
  } catch (error: any) {
    console.error("Error processing Slack message for knowledge:", error);
    throw error;
  }
}

export async function handleSlackEventCallback(event: SlackEvent, teamId: string): Promise<void> {
  if (event.type === "message" && !event.bot_id) {
    const message: SlackMessage = {
      text: event.text,
      user: event.user,
      channel: event.channel,
      timestamp: event.ts,
      threadTs: event.thread_ts,
    };

    await processSlackMessageForKnowledge(message, teamId);
  }
}

export async function getSlackUserInfo(userId: string): Promise<{ name: string; email?: string; title?: string } | null> {
  try {
    const client = getWebClient();
    if (!client) {
      return null;
    }

    const result = await client.users.info({ user: userId });
    if (result.user) {
      return {
        name: (result.user as any).real_name || (result.user as any).name || "Unknown",
        email: (result.user as any).profile?.email,
        title: (result.user as any).profile?.title,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting Slack user info:", error);
    return null;
  }
}

export async function getSlackChannelInfo(channelId: string): Promise<{ name: string; purpose?: string } | null> {
  try {
    const client = getWebClient();
    if (!client) {
      return null;
    }

    const result = await client.conversations.info({ channel: channelId });
    if (result.channel) {
      return {
        name: (result.channel as any).name || "unknown-channel",
        purpose: (result.channel as any).purpose?.value,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting Slack channel info:", error);
    return null;
  }
}

export async function getThreadMessages(channelId: string, threadTs: string, limit: number = 5): Promise<string[]> {
  try {
    const client = getWebClient();
    if (!client) {
      return [];
    }

    const result = await client.conversations.replies({
      channel: channelId,
      ts: threadTs,
      limit: limit + 1,
    });

    if (result.messages && result.messages.length > 0) {
      return result.messages
        .slice(0, -1)
        .map((msg: any) => msg.text || "")
        .filter((text: string) => text.length > 0);
    }
    return [];
  } catch (error) {
    console.error("Error getting thread messages:", error);
    return [];
  }
}

export async function enrichSlackMessage(message: SlackMessage): Promise<SlackMessage> {
  const enriched = { ...message };

  try {
    const [userInfo, channelInfo] = await Promise.all([
      getSlackUserInfo(message.user),
      getSlackChannelInfo(message.channel),
    ]);

    if (userInfo) {
      enriched.userName = userInfo.name;
      enriched.userTitle = userInfo.title;
    }

    if (channelInfo) {
      enriched.channelName = channelInfo.name;
    }

    if (message.threadTs && message.threadTs !== message.timestamp) {
      enriched.threadContext = await getThreadMessages(message.channel, message.threadTs, 3);
    }
  } catch (error) {
    console.error("Error enriching Slack message:", error);
  }

  return enriched;
}

export async function notifySlackChannel(
  channel: string,
  suggestion: {
    title: string;
    confidence: number;
    knowledgeType: string;
    sourceLink: string;
  }
): Promise<boolean> {
  const message = `📚 *New Knowledge Detected*\n\n*${suggestion.title}*\n\nType: ${suggestion.knowledgeType}\nConfidence: ${suggestion.confidence}%\nSource: <${suggestion.sourceLink}|View original>\n\n_Review this suggestion in the Current dashboard._`;

  return postToSlack(channel, message);
}
