import { google, drive_v3 } from "googleapis";
import { storage } from "../storage";
import { processTextForKnowledge } from "./ai";
import { findBestMatchingPage } from "./notion";
import { notifyNewSuggestion } from "./notifications";
import { checkSuggestionsQuota } from "../middleware/quotas";
import { integrationTokens } from "./integrationTokens";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
}

export class DriveError extends Error {
  constructor(
    message: string,
    public code: "NOT_CONNECTED" | "AUTH_FAILED" | "API_ERROR" | "NOT_FOUND" | "PERMISSION_DENIED"
  ) {
    super(message);
    this.name = "DriveError";
  }
}

export interface DriveConnectionStatus {
  connected: boolean;
  userEmail?: string;
  error?: string;
  errorCode?: string;
}

let connectionSettings: any;
let driveClientCache: Map<string, { client: drive_v3.Drive; expiresAt: number }> = new Map();

async function getAccessTokenFromReplit(): Promise<string> {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  if (!hostname) {
    throw new DriveError('Google Drive connector not available. Please connect Google Drive through Replit integrations.', 'NOT_CONNECTED');
  }

  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new DriveError('Authentication token not found. Please ensure the app is properly deployed.', 'AUTH_FAILED');
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    if (!response.ok) {
      throw new DriveError(`Failed to fetch Google Drive connection: ${response.status}`, 'API_ERROR');
    }

    const data = await response.json();
    connectionSettings = data.items?.[0];

    if (!connectionSettings || !connectionSettings.settings) {
      throw new DriveError('Google Drive not connected. Please connect Google Drive through Settings > Integrations.', 'NOT_CONNECTED');
    }

    const accessToken = connectionSettings.settings.access_token || connectionSettings.settings.oauth?.credentials?.access_token;

    if (!accessToken) {
      throw new DriveError('Google Drive access token not found. Please reconnect Google Drive.', 'AUTH_FAILED');
    }

    return accessToken;
  } catch (error: any) {
    if (error instanceof DriveError) throw error;
    throw new DriveError(`Failed to get Google Drive access token: ${error.message}`, 'API_ERROR');
  }
}

async function getDriveClientForTeam(teamId: string): Promise<drive_v3.Drive> {
  const cacheKey = `team:${teamId}`;
  const cached = driveClientCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.client;
  }

  const tokenData = await integrationTokens.getToken(teamId, "google_drive");
  
  if (!tokenData) {
    throw new DriveError(
      'Google Drive not connected for this team. Please connect Google Drive in Settings > Integrations.',
      'NOT_CONNECTED'
    );
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: tokenData.accessToken
  });

  const client = google.drive({ version: 'v3', auth: oauth2Client });
  
  driveClientCache.set(cacheKey, {
    client,
    expiresAt: tokenData.expiresAt ? tokenData.expiresAt.getTime() : Date.now() + 3600000,
  });

  return client;
}

async function getUncachableGoogleDriveClient(): Promise<drive_v3.Drive> {
  const accessToken = await getAccessTokenFromReplit();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function getDriveClient(teamId?: string): Promise<drive_v3.Drive> {
  if (teamId) {
    try {
      return await getDriveClientForTeam(teamId);
    } catch (error) {
      console.log(`Team ${teamId} Google Drive token not found, falling back to Replit connector`);
    }
  }
  
  return getUncachableGoogleDriveClient();
}

export async function testDriveConnection(teamId?: string): Promise<DriveConnectionStatus> {
  try {
    const drive = await getDriveClient(teamId);
    const response = await drive.about.get({
      fields: 'user(displayName,emailAddress)'
    });
    
    return {
      connected: true,
      userEmail: response.data.user?.emailAddress || undefined,
    };
  } catch (error: any) {
    if (error instanceof DriveError) {
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

export async function testDriveConnectionForTeam(teamId: string): Promise<DriveConnectionStatus> {
  try {
    const tokenData = await integrationTokens.getToken(teamId, "google_drive");
    
    if (!tokenData) {
      return {
        connected: false,
        error: "Google Drive not connected for this team",
        errorCode: "NOT_CONNECTED",
      };
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokenData.accessToken });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.about.get({ fields: 'user(emailAddress)' });
    
    return {
      connected: true,
      userEmail: response.data.user?.emailAddress || undefined,
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || "Connection failed",
      errorCode: "API_ERROR",
    };
  }
}

export async function watchDriveFolder(
  folderId: string,
  onFileChange: (file: DriveFile, content: string) => void
): Promise<void> {
  console.log(`Watching Google Drive folder: ${folderId}`);
  console.log("Note: Full Drive watching requires webhooks and push notifications");
  console.log("For demo purposes, drive monitoring is simulated");
}

export async function getFileContent(fileId: string, teamId?: string): Promise<string | null> {
  try {
    const drive = await getDriveClient(teamId);
    
    const response = await drive.files.get({
      fileId,
      alt: "media",
    });

    return response.data as string;
  } catch (error: any) {
    if (error instanceof DriveError) throw error;
    console.error("Error reading Drive file:", error);
    throw new DriveError(`Failed to read file: ${error.message}`, "API_ERROR");
  }
}

export async function listRecentFiles(folderId?: string, teamId?: string): Promise<DriveFile[]> {
  try {
    const drive = await getDriveClient(teamId);
    
    const query = folderId 
      ? `'${folderId}' in parents and trashed = false`
      : "trashed = false";
    
    const response = await drive.files.list({
      q: query,
      fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
      orderBy: "modifiedTime desc",
      pageSize: 10,
    });

    return (response.data.files || []).map(file => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      modifiedTime: file.modifiedTime || '',
      webViewLink: file.webViewLink || '',
    }));
  } catch (error: any) {
    if (error instanceof DriveError) throw error;
    console.error("Error listing Drive files:", error);
    throw new DriveError(`Failed to list files: ${error.message}`, "API_ERROR");
  }
}

export async function getGoogleDocsContent(fileId: string, teamId?: string): Promise<string | null> {
  try {
    const tokenData = teamId ? await integrationTokens.getToken(teamId, "google_drive") : null;
    let accessToken: string;
    
    if (tokenData) {
      accessToken = tokenData.accessToken;
    } else {
      accessToken = await getAccessTokenFromReplit();
    }
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    
    const response = await docs.documents.get({
      documentId: fileId,
    });

    if (!response.data.body?.content) return null;

    let text = '';
    for (const element of response.data.body.content) {
      if (element.paragraph?.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun?.content) {
            text += elem.textRun.content;
          }
        }
      }
    }
    
    return text;
  } catch (error: any) {
    if (error instanceof DriveError) throw error;
    console.error("Error reading Google Docs:", error);
    throw new DriveError(`Failed to read document: ${error.message}`, "API_ERROR");
  }
}

export async function processDriveFileForKnowledge(
  fileId: string,
  fileName: string,
  teamId: string
): Promise<{ processed: boolean; suggestionCreated: boolean; reason?: string }> {
  const quotaCheck = await checkSuggestionsQuota(teamId);
  if (!quotaCheck.allowed) {
    console.log(`Suggestions quota exceeded for team ${teamId}`);
    return { 
      processed: false, 
      suggestionCreated: false, 
      reason: `Quota exceeded: ${quotaCheck.message}` 
    };
  }

  try {
    let fileContent: string | null = null;
    
    try {
      fileContent = await getGoogleDocsContent(fileId, teamId);
    } catch {
      fileContent = await getFileContent(fileId, teamId);
    }

    if (!fileContent || fileContent.length < 50) {
      return { processed: false, suggestionCreated: false, reason: "File content too short or empty" };
    }

    const context = {
      channelName: fileName,
      userName: "Google Drive",
    };

    const result = await processTextForKnowledge(fileContent, "Google Drive", context);
    
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
        reason: `Confidence too low: ${result.confidence}%`
      };
    }

    const notionPage = await findBestMatchingPage(result.title, teamId).catch(() => null);

    const suggestion = await storage.createSuggestion({
      teamId,
      source: "Google Drive",
      sourceType: "drive",
      knowledgeType: result.knowledgeType || "fact",
      title: result.title,
      proposedContent: result.content,
      currentContent: notionPage?.content || null,
      confidence: result.confidence,
      sourceLink: `https://drive.google.com/file/d/${fileId}`,
      notionPageId: notionPage?.id || null,
      notionPageUrl: notionPage?.url || "https://notion.so",
      aiReasoning: result.reasoning,
      metadata: {
        fileName,
        fileId,
        source: "drive_file",
      },
    });

    await storage.createActivityLog({
      teamId,
      suggestionId: suggestion.id,
      status: "detected",
      title: result.title,
      source: "Google Drive",
      sourceType: "drive",
      metadata: { fileName, fileId },
    });

    await notifyNewSuggestion(suggestion);

    return { processed: true, suggestionCreated: true };
  } catch (error: any) {
    console.error("Error processing Google Drive file:", error);
    return { processed: false, suggestionCreated: false, reason: error.message };
  }
}

export function clearDriveClientCache(teamId?: string): void {
  if (teamId) {
    driveClientCache.delete(`team:${teamId}`);
  } else {
    driveClientCache.clear();
  }
}
