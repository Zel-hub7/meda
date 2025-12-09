import { storage } from "../storage";
import { processTextForKnowledge } from "./ai";
import { findBestMatchingPage } from "./notion";
import { notifyNewSuggestion } from "./notifications";
import { checkSuggestionsQuota } from "../middleware/quotas";
import { integrationTokens } from "./integrationTokens";

async function getZoomToken(teamId?: string): Promise<string | null> {
  if (teamId) {
    const teamToken = await integrationTokens.getToken(teamId, "zoom");
    if (teamToken) {
      return teamToken.accessToken;
    }
  }
  
  return process.env.ZOOM_ACCESS_TOKEN || null;
}

export interface ZoomRecording {
  id: string;
  uuid: string;
  host_id: string;
  topic: string;
  start_time: string;
  duration: number;
  recording_files: ZoomRecordingFile[];
}

export interface ZoomRecordingFile {
  id: string;
  file_type: string;
  file_size: number;
  download_url: string;
  recording_start: string;
  recording_end: string;
}

export interface ZoomTranscript {
  meetingId: string;
  meetingTopic: string;
  text: string;
  startTime: string;
  downloadUrl: string;
}

export async function getRecordings(meetingId: string, teamId?: string): Promise<ZoomRecording | null> {
  try {
    const token = await getZoomToken(teamId);
    if (!token) {
      console.log("Zoom access token not configured");
      return null;
    }

    const response = await fetch(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Zoom API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data as ZoomRecording;
  } catch (error) {
    console.error("Error fetching Zoom recordings:", error);
    return null;
  }
}

export async function downloadTranscript(downloadUrl: string, teamId?: string): Promise<string | null> {
  try {
    const token = await getZoomToken(teamId);
    if (!token) {
      console.log("Zoom access token not configured");
      return null;
    }

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to download transcript: ${response.status}`);
      return null;
    }

    const vttContent = await response.text();
    return parseVTTTranscript(vttContent);
  } catch (error) {
    console.error("Error downloading Zoom transcript:", error);
    return null;
  }
}

function parseVTTTranscript(vttContent: string): string {
  const lines = vttContent.split('\n');
  const textLines: string[] = [];
  
  let isContent = false;
  let currentSpeaker = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'WEBVTT' || 
        trimmed.startsWith('NOTE') || 
        trimmed.startsWith('Kind:') ||
        trimmed.startsWith('Language:') ||
        trimmed.startsWith('STYLE') ||
        trimmed.startsWith('::cue')) {
      continue;
    }
    
    const cueIdMatch = trimmed.match(/^\d+$/);
    if (cueIdMatch) {
      continue;
    }
    
    if (trimmed.includes('-->')) {
      isContent = true;
      continue;
    }
    
    if (isContent && trimmed) {
      let cleaned = trimmed.replace(/<[^>]*>/g, '');
      
      cleaned = cleaned.replace(/&nbsp;/g, ' ')
                       .replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>')
                       .replace(/&quot;/g, '"');
      
      const speakerMatch = cleaned.match(/^([A-Za-z\s]+):\s*(.*)$/);
      if (speakerMatch) {
        const speaker = speakerMatch[1].trim();
        const text = speakerMatch[2].trim();
        if (speaker !== currentSpeaker && text) {
          currentSpeaker = speaker;
          textLines.push(`${speaker}: ${text}`);
        } else if (text) {
          textLines.push(text);
        }
      } else if (cleaned) {
        textLines.push(cleaned);
      }
    }
    
    if (!trimmed) {
      isContent = false;
    }
  }
  
  let result = textLines.join(' ');
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

export async function getTranscriptFromRecording(meetingId: string, teamId?: string): Promise<ZoomTranscript | null> {
  try {
    const recording = await getRecordings(meetingId, teamId);
    
    if (!recording) {
      return null;
    }

    const transcriptFile = recording.recording_files.find(
      (file) => file.file_type === "TRANSCRIPT" || file.file_type === "TIMELINE"
    );

    if (!transcriptFile) {
      console.log(`No transcript found for meeting ${meetingId}`);
      return null;
    }

    const transcriptText = await downloadTranscript(transcriptFile.download_url, teamId);
    
    if (!transcriptText) {
      return null;
    }

    return {
      meetingId: recording.id,
      meetingTopic: recording.topic,
      text: transcriptText,
      startTime: recording.start_time,
      downloadUrl: transcriptFile.download_url,
    };
  } catch (error) {
    console.error("Error getting Zoom transcript:", error);
    return null;
  }
}

export async function processZoomTranscript(
  transcript: string,
  meetingTopic: string,
  teamId: string
): Promise<{ processed: boolean; suggestionCreated: boolean; reason?: string }> {
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
      channelName: meetingTopic,
      userName: "Zoom Meeting",
    };

    const result = await processTextForKnowledge(transcript, "Zoom", context);
    
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
      source: "Zoom",
      sourceType: "zoom",
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
        meetingTopic,
        source: "zoom_transcript",
      },
    });

    await storage.createActivityLog({
      teamId,
      suggestionId: suggestion.id,
      status: "detected",
      title: result.title,
      source: "Zoom",
      sourceType: "zoom",
      metadata: { meetingTopic },
    });

    await notifyNewSuggestion(suggestion);

    return { processed: true, suggestionCreated: true };
  } catch (error: any) {
    console.error("Error processing Zoom transcript:", error);
    return { processed: false, suggestionCreated: false, reason: error.message };
  }
}

export function verifyZoomWebhook(
  rawBody: Buffer,
  signature: string,
  timestamp: string
): boolean {
  try {
    if (!process.env.ZOOM_WEBHOOK_SECRET) {
      console.warn("Zoom webhook secret not configured - skipping verification");
      return true;
    }

    const crypto = require('crypto');
    const messagePrefix = `v0:${timestamp}:`;
    const messagePrefixBuffer = Buffer.from(messagePrefix, 'utf8');
    const messageBuffer = Buffer.concat([messagePrefixBuffer, rawBody]);
    
    const hash = crypto
      .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET)
      .update(messageBuffer)
      .digest('hex');
    
    const expectedSignature = `v0=${hash}`;
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      console.error(`Zoom webhook signature length mismatch: ${signatureBuffer.length} vs ${expectedBuffer.length}`);
      return false;
    }
    
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error verifying Zoom webhook:", error);
    return false;
  }
}
