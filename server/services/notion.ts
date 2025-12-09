import { Client } from "@notionhq/client";
import { integrationTokens } from "./integrationTokens";
import crypto from "crypto";

let connectionSettings: any;
let notionClientCache: Map<string, { client: Client; expiresAt: number }> = new Map();

export type NotionErrorCode = "NOT_CONNECTED" | "AUTH_FAILED" | "API_ERROR" | "NOT_FOUND" | "PERMISSION_DENIED" | "CONFLICT" | "RATE_LIMITED";

export class NotionError extends Error {
  constructor(
    message: string,
    public code: NotionErrorCode
  ) {
    super(message);
    this.name = "NotionError";
  }
}

export interface SyncResult {
  success: boolean;
  pageId: string;
  conflictDetected?: boolean;
  retryCount?: number;
  error?: string;
  contentHash?: string;
}

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").substring(0, 16);
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config = RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (error.code === "rate_limited" || error.status === 429) {
        const retryAfter = error.headers?.["retry-after"] 
          ? parseInt(error.headers["retry-after"]) * 1000 
          : Math.min(config.baseDelayMs * Math.pow(2, attempt), config.maxDelayMs);
        console.log(`[Notion] Rate limited on ${operationName}, waiting ${retryAfter}ms before retry ${attempt}/${config.maxRetries}`);
        await delay(retryAfter);
        continue;
      }
      
      if (error.code === "conflict_error" || error.status === 409) {
        console.log(`[Notion] Conflict detected on ${operationName}, attempt ${attempt}/${config.maxRetries}`);
        await delay(config.baseDelayMs * attempt);
        continue;
      }
      
      if (error.code === "service_unavailable" || error.status === 503) {
        const delayMs = Math.min(config.baseDelayMs * Math.pow(2, attempt), config.maxDelayMs);
        console.log(`[Notion] Service unavailable on ${operationName}, waiting ${delayMs}ms before retry ${attempt}/${config.maxRetries}`);
        await delay(delayMs);
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

async function getAccessTokenFromReplit(): Promise<string> {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  if (!hostname) {
    throw new NotionError('Notion connector not available. Please connect Notion through Replit integrations.', 'NOT_CONNECTED');
  }

  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new NotionError('Authentication token not found. Please ensure the app is properly deployed.', 'AUTH_FAILED');
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    if (!response.ok) {
      throw new NotionError(`Failed to fetch Notion connection: ${response.status}`, 'API_ERROR');
    }

    const data = await response.json();
    connectionSettings = data.items?.[0];

    if (!connectionSettings || !connectionSettings.settings) {
      throw new NotionError('Notion not connected. Please connect Notion through Settings > Integrations.', 'NOT_CONNECTED');
    }

    const accessToken = connectionSettings.settings.access_token || connectionSettings.settings.oauth?.credentials?.access_token;

    if (!accessToken) {
      throw new NotionError('Notion access token not found. Please reconnect Notion.', 'AUTH_FAILED');
    }

    return accessToken;
  } catch (error: any) {
    if (error instanceof NotionError) throw error;
    throw new NotionError(`Failed to get Notion access token: ${error.message}`, 'API_ERROR');
  }
}

async function getNotionClientForTeam(teamId: string): Promise<Client> {
  const cacheKey = `team:${teamId}`;
  const cached = notionClientCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.client;
  }

  const tokenData = await integrationTokens.getToken(teamId, "notion");
  
  if (!tokenData) {
    throw new NotionError(
      'Notion not connected for this team. Please connect Notion in Settings > Integrations.',
      'NOT_CONNECTED'
    );
  }

  const client = new Client({ auth: tokenData.accessToken });
  
  notionClientCache.set(cacheKey, {
    client,
    expiresAt: tokenData.expiresAt ? tokenData.expiresAt.getTime() : Date.now() + 3600000,
  });

  return client;
}

async function getUncachableNotionClient(): Promise<Client> {
  const accessToken = await getAccessTokenFromReplit();
  return new Client({ auth: accessToken });
}

async function getNotionClient(teamId?: string): Promise<Client> {
  if (teamId) {
    try {
      return await getNotionClientForTeam(teamId);
    } catch (error) {
      console.log(`Team ${teamId} Notion token not found, falling back to Replit connector`);
    }
  }
  
  return getUncachableNotionClient();
}

export interface NotionPage {
  id: string;
  url: string;
  title: string;
  content: string;
}

export interface NotionConnectionStatus {
  connected: boolean;
  workspaceName?: string;
  workspaceIcon?: string;
  error?: string;
  errorCode?: string;
}

export async function testNotionConnection(teamId?: string): Promise<NotionConnectionStatus> {
  try {
    const notion = await getNotionClient(teamId);
    const response = await notion.search({
      query: "",
      page_size: 1,
    });
    
    return {
      connected: true,
      workspaceName: "Connected",
    };
  } catch (error: any) {
    if (error instanceof NotionError) {
      return {
        connected: false,
        error: error.message,
        errorCode: error.code,
      };
    }
    return {
      connected: false,
      error: error.message || "Unknown error",
      errorCode: "API_ERROR",
    };
  }
}

export async function testNotionConnectionForTeam(teamId: string): Promise<NotionConnectionStatus> {
  try {
    const tokenData = await integrationTokens.getToken(teamId, "notion");
    
    if (!tokenData) {
      return {
        connected: false,
        error: "Notion not connected for this team",
        errorCode: "NOT_CONNECTED",
      };
    }

    const client = new Client({ auth: tokenData.accessToken });
    await client.search({ query: "", page_size: 1 });
    
    return {
      connected: true,
      workspaceName: "Connected",
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || "Connection failed",
      errorCode: "API_ERROR",
    };
  }
}

function extractBlockContent(block: any): string {
  const richTextToString = (richText: any[]): string => {
    if (!richText) return "";
    return richText.map((t: any) => t.plain_text || "").join("");
  };

  switch (block.type) {
    case "paragraph":
      return richTextToString(block.paragraph?.rich_text);
    case "heading_1":
      return `# ${richTextToString(block.heading_1?.rich_text)}`;
    case "heading_2":
      return `## ${richTextToString(block.heading_2?.rich_text)}`;
    case "heading_3":
      return `### ${richTextToString(block.heading_3?.rich_text)}`;
    case "bulleted_list_item":
      return `• ${richTextToString(block.bulleted_list_item?.rich_text)}`;
    case "numbered_list_item":
      return `1. ${richTextToString(block.numbered_list_item?.rich_text)}`;
    case "to_do":
      const checked = block.to_do?.checked ? "☑" : "☐";
      return `${checked} ${richTextToString(block.to_do?.rich_text)}`;
    case "toggle":
      return `▶ ${richTextToString(block.toggle?.rich_text)}`;
    case "code":
      return `\`\`\`${block.code?.language || ""}\n${richTextToString(block.code?.rich_text)}\n\`\`\``;
    case "quote":
      return `> ${richTextToString(block.quote?.rich_text)}`;
    case "callout":
      const emoji = block.callout?.icon?.emoji || "📌";
      return `${emoji} ${richTextToString(block.callout?.rich_text)}`;
    case "divider":
      return "---";
    default:
      return "";
  }
}

export async function searchNotionPages(query: string, teamId?: string): Promise<NotionPage[]> {
  try {
    const notion = await getNotionClient(teamId);
    const response = await notion.search({
      query,
      filter: { property: "object", value: "page" },
      page_size: 10,
    });

    const pages = await Promise.all(
      response.results.map(async (page: any) => {
        if (page.object !== "page") return null;
        
        const title = page.properties?.title?.title?.[0]?.plain_text || 
                     page.properties?.Name?.title?.[0]?.plain_text || 
                     "Untitled";
        
        try {
          const blocks = await notion.blocks.children.list({
            block_id: page.id,
            page_size: 100,
          });
          
          const content = blocks.results
            .map(extractBlockContent)
            .filter(Boolean)
            .join("\n");

          return {
            id: page.id,
            url: page.url,
            title,
            content,
          };
        } catch (blockError) {
          console.warn(`Could not fetch blocks for page ${page.id}:`, blockError);
          return {
            id: page.id,
            url: page.url,
            title,
            content: "",
          };
        }
      })
    );

    return pages.filter((p): p is NotionPage => p !== null);
  } catch (error: any) {
    if (error instanceof NotionError) throw error;
    console.error("Error searching Notion:", error);
    throw new NotionError(`Failed to search Notion: ${error.message}`, "API_ERROR");
  }
}

export async function getNotionPage(pageId: string, teamId?: string): Promise<NotionPage | null> {
  try {
    const notion = await getNotionClient(teamId);
    const page = await notion.pages.retrieve({ page_id: pageId }) as any;
    
    if (!page) return null;
    
    const title = page.properties?.title?.title?.[0]?.plain_text || 
                 page.properties?.Name?.title?.[0]?.plain_text || 
                 "Untitled";
    
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    
    const content = blocks.results
      .map(extractBlockContent)
      .filter(Boolean)
      .join("\n");

    return {
      id: pageId,
      url: page.url,
      title,
      content,
    };
  } catch (error: any) {
    if (error.code === "object_not_found") {
      throw new NotionError("Page not found", "NOT_FOUND");
    }
    if (error.code === "unauthorized") {
      throw new NotionError("Permission denied to access this page", "PERMISSION_DENIED");
    }
    console.error("Error getting Notion page:", error);
    throw new NotionError(`Failed to get page: ${error.message}`, "API_ERROR");
  }
}

export async function updateNotionPage(pageId: string, content: string, teamId?: string): Promise<boolean> {
  try {
    const notion = await getNotionClient(teamId);
    
    const existingBlocks = await notion.blocks.children.list({
      block_id: pageId,
    });
    
    for (const block of existingBlocks.results) {
      try {
        await notion.blocks.delete({ block_id: block.id });
      } catch (deleteError) {
        console.warn(`Could not delete block ${block.id}:`, deleteError);
      }
    }
    
    const lines = content.split("\n");
    const children: any[] = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      if (line.startsWith("### ")) {
        children.push({
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: line.slice(4) } }],
          },
        });
      } else if (line.startsWith("## ")) {
        children.push({
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: line.slice(3) } }],
          },
        });
      } else if (line.startsWith("# ")) {
        children.push({
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [{ type: "text", text: { content: line.slice(2) } }],
          },
        });
      } else if (line.startsWith("• ") || line.startsWith("- ")) {
        children.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: line.slice(2) } }],
          },
        });
      } else if (/^\d+\.\s/.test(line)) {
        children.push({
          object: "block",
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [{ type: "text", text: { content: line.replace(/^\d+\.\s/, "") } }],
          },
        });
      } else if (line.startsWith("> ")) {
        children.push({
          object: "block",
          type: "quote",
          quote: {
            rich_text: [{ type: "text", text: { content: line.slice(2) } }],
          },
        });
      } else if (line === "---") {
        children.push({
          object: "block",
          type: "divider",
          divider: {},
        });
      } else {
        children.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: line } }],
          },
        });
      }
    }
    
    if (children.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < children.length; i += batchSize) {
        const batch = children.slice(i, i + batchSize);
        await notion.blocks.children.append({
          block_id: pageId,
          children: batch,
        });
      }
    }

    return true;
  } catch (error: any) {
    if (error.code === "object_not_found") {
      throw new NotionError("Page not found", "NOT_FOUND");
    }
    if (error.code === "unauthorized") {
      throw new NotionError("Permission denied to update this page", "PERMISSION_DENIED");
    }
    console.error("Error updating Notion page:", error);
    throw new NotionError(`Failed to update page: ${error.message}`, "API_ERROR");
  }
}

export async function updateNotionPageSafe(
  pageId: string, 
  content: string, 
  expectedContentHash?: string,
  teamId?: string
): Promise<SyncResult> {
  let retryCount = 0;
  
  try {
    if (expectedContentHash) {
      const currentPage = await withRetry(
        () => getNotionPage(pageId, teamId),
        `getNotionPage(${pageId})`
      );
      
      if (currentPage) {
        const currentHash = generateContentHash(currentPage.content);
        if (currentHash !== expectedContentHash) {
          console.log(`[Notion] Conflict detected: content changed since last read. Expected: ${expectedContentHash}, Current: ${currentHash}`);
          return {
            success: false,
            pageId,
            conflictDetected: true,
            error: "Page content has been modified since you last viewed it. Please refresh and try again.",
            contentHash: currentHash,
          };
        }
      }
    }
    
    await withRetry(
      async () => {
        retryCount++;
        await updateNotionPage(pageId, content, teamId);
      },
      `updateNotionPage(${pageId})`
    );
    
    const newHash = generateContentHash(content);
    
    return {
      success: true,
      pageId,
      retryCount: retryCount > 1 ? retryCount : undefined,
      contentHash: newHash,
    };
  } catch (error: any) {
    console.error(`[Notion] Failed to update page ${pageId} after ${retryCount} attempts:`, error.message);
    
    if (error.code === "rate_limited" || error.status === 429) {
      return {
        success: false,
        pageId,
        retryCount,
        error: "Rate limited by Notion. Please try again in a few minutes.",
      };
    }
    
    return {
      success: false,
      pageId,
      retryCount,
      error: error.message,
    };
  }
}

export function getContentHash(content: string): string {
  return generateContentHash(content);
}

export async function createNotionPage(
  parentPageId: string,
  title: string,
  content: string,
  teamId?: string
): Promise<NotionPage> {
  try {
    const notion = await getNotionClient(teamId);
    
    const page = await notion.pages.create({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: title } }],
        },
      },
    }) as any;
    
    const lines = content.split("\n").filter(Boolean);
    if (lines.length > 0) {
      const children = lines.map(line => ({
        object: "block" as const,
        type: "paragraph" as const,
        paragraph: {
          rich_text: [{ type: "text" as const, text: { content: line } }],
        },
      }));
      
      await notion.blocks.children.append({
        block_id: page.id,
        children,
      });
    }
    
    return {
      id: page.id,
      url: page.url,
      title,
      content,
    };
  } catch (error: any) {
    if (error.code === "unauthorized") {
      throw new NotionError("Permission denied to create page in this location", "PERMISSION_DENIED");
    }
    console.error("Error creating Notion page:", error);
    throw new NotionError(`Failed to create page: ${error.message}`, "API_ERROR");
  }
}

function calculateTitleSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const wordsA = new Set(normalize(a).split(/\s+/));
  const wordsB = new Set(normalize(b).split(/\s+/));
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  
  let matches = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) matches++;
  }
  
  return matches / Math.max(wordsA.size, wordsB.size);
}

export async function findBestMatchingPage(title: string, teamId?: string): Promise<NotionPage | null> {
  const results = await searchNotionPages(title, teamId);
  
  if (results.length === 0) return null;
  
  let bestMatch = results[0];
  let bestScore = calculateTitleSimilarity(title, results[0].title);
  
  for (const page of results.slice(1)) {
    const score = calculateTitleSimilarity(title, page.title);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = page;
    }
  }
  
  if (bestScore < 0.3) {
    console.log(`No good match found for "${title}". Best match "${bestMatch.title}" scored ${bestScore}`);
  }
  
  return bestMatch;
}

export async function appendToNotionPage(pageId: string, content: string, teamId?: string): Promise<boolean> {
  try {
    const notion = await getNotionClient(teamId);
    
    const lines = content.split("\n").filter(Boolean);
    const children = lines.map(line => ({
      object: "block" as const,
      type: "paragraph" as const,
      paragraph: {
        rich_text: [{ type: "text" as const, text: { content: line } }],
      },
    }));
    
    if (children.length > 0) {
      await notion.blocks.children.append({
        block_id: pageId,
        children,
      });
    }
    
    return true;
  } catch (error: any) {
    console.error("Error appending to Notion page:", error);
    throw new NotionError(`Failed to append to page: ${error.message}`, "API_ERROR");
  }
}

export function clearNotionClientCache(teamId?: string): void {
  if (teamId) {
    notionClientCache.delete(`team:${teamId}`);
  } else {
    notionClientCache.clear();
  }
}
