import { google } from "googleapis";
import { storage } from "../storage";
import { processTextForKnowledge } from "./ai";
import { findBestMatchingPage } from "./notion";
import { notifyNewSuggestion } from "./notifications";
import { checkSuggestionsQuota } from "../middleware/quotas";
import { integrationTokens } from "./integrationTokens";

async function getMeetToken(teamId?: string): Promise<string | null> {
  if (teamId) {
    const teamToken = await integrationTokens.getToken(teamId, "google_meet");
    if (teamToken) {
      return teamToken.accessToken;
    }
  }
  
  return process.env.GOOGLE_MEET_TOKEN || null;
}

async function getDriveToken(teamId?: string): Promise<string | null> {
  if (teamId) {
    const teamToken = await integrationTokens.getToken(teamId, "google_drive");
    if (teamToken) {
      return teamToken.accessToken;
    }
  }
  
  return process.env.GOOGLE_DRIVE_TOKEN || null;
}

export interface MeetTranscript {
  conferenceId: string;
  transcriptId: string;
  text: string;
  startTime: string;
  driveFileId: string;
  participants: string[];
}

export interface MeetTranscriptEntry {
  text: string;
  startTime: string;
  endTime: string;
  participant: string;
}

export async function listConferenceTranscripts(
  conferenceId: string,
  teamId?: string
): Promise<any[]> {
  try {
    const token = await getMeetToken(teamId);
    if (!token) {
      console.log("Google Meet token not configured");
      return [];
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: token,
    });

    const meet = google.meet({ version: "v2", auth });
    
    const response = await meet.conferenceRecords.transcripts.list({
      parent: `conferenceRecords/${conferenceId}`,
    });

    return response.data.transcripts || [];
  } catch (error) {
    console.error("Error listing Meet transcripts:", error);
    return [];
  }
}

export async function getTranscriptEntries(
  transcriptName: string,
  teamId?: string
): Promise<MeetTranscriptEntry[]> {
  try {
    const token = await getMeetToken(teamId);
    if (!token) {
      console.log("Google Meet token not configured");
      return [];
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: token,
    });

    const meet = google.meet({ version: "v2", auth });
    
    const response = await meet.conferenceRecords.transcripts.entries.list({
      parent: transcriptName,
    });

    const entries = (response.data.transcriptEntries as any[]) || [];
    
    return entries.map((entry: any) => ({
      text: entry.text || "",
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      participant: entry.participant || "Unknown",
    }));
  } catch (error) {
    console.error("Error getting transcript entries:", error);
    return [];
  }
}

export async function downloadTranscriptFromDrive(
  fileId: string,
  teamId?: string
): Promise<string | null> {
  try {
    const driveToken = await getDriveToken(teamId);
    const meetToken = await getMeetToken(teamId);
    const token = driveToken || meetToken;
    
    if (!token) {
      console.log("Google Drive/Meet token not configured");
      return null;
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: token,
    });

    const drive = google.drive({ version: "v3", auth });
    
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: "text/plain",
    });

    return response.data as string;
  } catch (error) {
    console.error("Error downloading transcript from Drive:", error);
    return null;
  }
}

export async function getMeetTranscript(
  conferenceId: string,
  teamId?: string
): Promise<MeetTranscript | null> {
  try {
    const transcripts = await listConferenceTranscripts(conferenceId, teamId);
    
    if (transcripts.length === 0) {
      console.log(`No transcripts found for conference ${conferenceId}`);
      return null;
    }

    const latestTranscript = transcripts[0];
    const transcriptName = latestTranscript.name;
    
    const entries = await getTranscriptEntries(transcriptName, teamId);
    
    if (entries.length === 0) {
      return null;
    }

    const fullText = entries.map((entry) => entry.text).join(" ");
    const uniqueParticipants = Array.from(new Set(entries.map((e) => e.participant)));

    let driveFileId = "";
    if (latestTranscript.docsDestination?.document) {
      const docUrl = latestTranscript.docsDestination.document;
      const match = docUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        driveFileId = match[1];
      }
    }

    return {
      conferenceId,
      transcriptId: transcriptName,
      text: fullText,
      startTime: latestTranscript.startTime || new Date().toISOString(),
      driveFileId,
      participants: uniqueParticipants,
    };
  } catch (error) {
    console.error("Error getting Meet transcript:", error);
    return null;
  }
}

export async function pollForNewTranscripts(
  onTranscriptReady: (transcript: MeetTranscript) => void
): Promise<void> {
  console.log("Google Meet transcript polling initialized");
  console.log("Note: Real-time polling requires proper OAuth setup and conference tracking");
  console.log("For production, integrate with Google Workspace Events API");
}

export async function processMeetTranscript(
  data: { transcript: string; conferenceId?: string; meetingTitle?: string },
  teamId: string
): Promise<{ processed: boolean; suggestionCreated: boolean; reason?: string }> {
  const transcript = data.transcript;
  const meetingTitle = data.meetingTitle || data.conferenceId || "Google Meet";

  if (!transcript || transcript.length < 50) {
    return { processed: false, suggestionCreated: false, reason: "Transcript too short" };
  }

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
    const context = {
      channelName: meetingTitle,
      userName: "Google Meet",
    };

    const result = await processTextForKnowledge(transcript, "Google Meet", context);
    
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

    const notionPage = await findBestMatchingPage(result.title).catch(() => null);

    const suggestion = await storage.createSuggestion({
      teamId,
      source: "Google Meet",
      sourceType: "meet",
      knowledgeType: result.knowledgeType || "fact",
      title: result.title,
      proposedContent: result.content,
      currentContent: notionPage?.content || null,
      confidence: result.confidence,
      sourceLink: "",
      notionPageId: notionPage?.id || null,
      notionPageUrl: notionPage?.url || "https://notion.so",
      aiReasoning: result.reasoning,
      metadata: {
        meetingTitle,
        conferenceId: data.conferenceId,
        source: "meet_transcript",
      },
    });

    await storage.createActivityLog({
      teamId,
      suggestionId: suggestion.id,
      status: "detected",
      title: result.title,
      source: "Google Meet",
      sourceType: "meet",
      metadata: { meetingTitle },
    });

    await notifyNewSuggestion(suggestion);

    return { processed: true, suggestionCreated: true };
  } catch (error: any) {
    console.error("Error processing Google Meet transcript:", error);
    return { processed: false, suggestionCreated: false, reason: error.message };
  }
}
