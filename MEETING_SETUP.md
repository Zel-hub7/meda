# Meeting Integration Setup Guide

This guide explains how to configure Zoom and Google Meet integrations to automatically extract knowledge from meeting transcripts.

## Overview

KnowledgeSync can monitor your team's meetings and automatically:
1. Detect when meeting transcripts become available
2. Extract actionable knowledge (policies, decisions, SOPs, processes)
3. Create suggestions for your approval queue
4. Link suggestions to relevant Notion pages

## Zoom Integration

### Prerequisites
- **Zoom Account**: Business, Pro, or Enterprise plan (Basic/Free plans don't support cloud recording)
- **Cloud Recording**: Enabled in account settings
- **Audio Transcript**: Enabled in account settings (disabled by default)

### Setup Steps

#### 1. Create a Zoom Server-to-Server OAuth App

1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Click "Develop" → "Build App"
3. Select "Server-to-Server OAuth"
4. Fill in app details:
   - **App Name**: KnowledgeSync
   - **Short Description**: Automated knowledge base updates from meetings
   - **Company Name**: Your organization

#### 2. Configure App Scopes

Add the following scopes:
- `cloud_recording:read:admin` (or `recording:read`)
- `meeting:read:admin` (optional, for meeting details)

#### 3. Get API Credentials

1. Copy the following from your app's credentials page:
   - **Account ID**
   - **Client ID**
   - **Client Secret**

2. Generate an access token:
   ```bash
   # Get access token (expires in 1 hour)
   curl -X POST https://zoom.us/oauth/token \
     -H "Authorization: Basic <BASE64_ENCODED_CLIENT_ID:CLIENT_SECRET>" \
     -d "grant_type=account_credentials&account_id=YOUR_ACCOUNT_ID"
   ```

   **⚠️ IMPORTANT - Token Expiration:**
   - Zoom Server-to-Server OAuth tokens expire after **1 hour**
   - Without automatic refresh, the integration will stop working
   - **Production Recommendation**: Implement automatic token refresh (see Production section below)
   - **Quick Test**: Manually refresh the token hourly for initial testing

3. Add to Replit Secrets:
   ```
   ZOOM_ACCESS_TOKEN=your_access_token_here
   ZOOM_CLIENT_ID=your_client_id
   ZOOM_CLIENT_SECRET=your_client_secret
   ZOOM_ACCOUNT_ID=your_account_id
   ```

#### 4. Configure Webhook

1. In your Zoom app, go to "Features" → "Event Subscriptions"
2. Enable "Event Subscriptions"
3. Add Event Subscription:
   - **Subscription Name**: Recording Transcripts
   - **Event notification endpoint URL**: `https://your-replit-app.replit.app/api/webhooks/zoom`

4. Subscribe to events:
   - `recording.transcript_completed` (recommended)
   - `recording.completed` (fallback)

5. Generate and save Webhook Secret Token:
   ```
   ZOOM_WEBHOOK_SECRET=your_webhook_secret_here
   ```

#### 5. Enable Transcription

For each meeting or account-wide:
1. Go to Zoom Settings → Recording
2. Enable **Cloud recording**
3. Enable **Audio transcript**
4. (Optional) Enable automatic recording for all meetings

### How It Works

1. Meeting ends with cloud recording enabled
2. Zoom processes the recording (takes ~2x meeting duration)
3. Zoom sends webhook to `/api/webhooks/zoom` when transcript is ready
4. KnowledgeSync downloads the VTT transcript
5. Claude AI analyzes the transcript for knowledge
6. If knowledge is detected (confidence ≥70%), creates a suggestion
7. You review and approve in the approval queue

### Webhook Payload Example

```json
{
  "event": "recording.transcript_completed",
  "payload": {
    "account_id": "abc123",
    "object": {
      "id": "1234567890",
      "uuid": "abc-def-ghi",
      "host_id": "user123",
      "topic": "Product Planning Meeting",
      "start_time": "2024-11-17T10:00:00Z",
      "duration": 3600
    }
  }
}
```

---

## Google Meet Integration

### Prerequisites
- **Google Workspace**: Business Standard or higher (or Education Plus)
- **Transcript Feature**: Enabled for your organization
- **OAuth Scopes**: Sensitive/Restricted scopes require Google verification

### Setup Steps

#### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "KnowledgeSync"
3. Enable the following APIs:
   - Google Meet API
   - Google Drive API

#### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "Internal" (for Google Workspace) or "External"
3. Fill in app information
4. Add scopes:
   - `https://www.googleapis.com/auth/meetings.space.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`

**Note**: These are **Sensitive/Restricted scopes** requiring Google verification (1-6 weeks).

#### 3. Create OAuth 2.0 Credentials

1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: **Web application**
3. Add authorized redirect URIs:
   - `https://your-replit-app.replit.app/oauth/callback`
   - `http://localhost:5000/oauth/callback` (for development)

4. Download the JSON credentials file

#### 4. Obtain User Access Token

Google Meet requires user-specific access tokens (not service accounts):

```bash
# Use Google OAuth Playground or implement OAuth flow
# https://developers.google.com/oauthplayground/

# Required scopes:
# - https://www.googleapis.com/auth/meetings.space.readonly
# - https://www.googleapis.com/auth/drive.readonly
```

Add to Replit Secrets:
```
GOOGLE_MEET_TOKEN=your_access_token_here
GOOGLE_DRIVE_TOKEN=your_drive_access_token_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

**⚠️ IMPORTANT - Token Expiration:**
- Google OAuth access tokens expire after **1 hour**
- Google OAuth refresh tokens expire after **6 months** (if unused)
- Without automatic refresh, the integration will stop working
- **Production Recommendation**: Implement automatic token refresh using the refresh token
- Store the refresh token securely and use it to obtain new access tokens automatically

#### 5. Configure Webhook (Optional - Advanced)

For automatic notifications, use Google Workspace Events API:

1. Enable Workspace Events API in Google Cloud Console
2. Create a webhook subscription for conference records
3. Point to: `https://your-replit-app.replit.app/api/webhooks/meet`

**Alternative (Simpler)**: Manual triggering
- Call `/api/webhooks/meet` with `conferenceId` after meetings end
- Integrate with Google Calendar to detect meeting ends

### How It Works

#### Automatic (with Workspace Events API):
1. Meeting ends
2. Google processes transcript (7-45+ minutes)
3. Workspace Events API sends notification
4. KnowledgeSync fetches transcript via Meet API
5. Claude AI analyzes for knowledge
6. Creates suggestion if detected

#### Manual (without Events API):
1. Get conference ID from Meet URL or Calendar
2. POST to `/api/webhooks/meet`:
   ```json
   {
     "conferenceId": "abc-defg-hij",
     "conferenceName": "Weekly Team Sync"
   }
   ```
3. System fetches transcript and processes

### API Request Example

```bash
curl -X POST https://your-app.replit.app/api/webhooks/meet \
  -H "Content-Type: application/json" \
  -d '{
    "conferenceId": "abc-defg-hij",
    "conferenceName": "Product Planning Meeting"
  }'
```

---

## Environment Variables Summary

Add these to your Replit Secrets:

### Zoom
```bash
ZOOM_ACCESS_TOKEN=your_zoom_access_token
ZOOM_WEBHOOK_SECRET=your_zoom_webhook_secret
```

### Google Meet
```bash
GOOGLE_MEET_TOKEN=your_meet_access_token
GOOGLE_DRIVE_TOKEN=your_drive_access_token  # Can be same as MEET token
```

### Already Configured
```bash
ANTHROPIC_API_KEY=your_anthropic_key
NOTION_TOKEN=your_notion_integration_token
DATABASE_URL=your_postgres_connection_string
```

---

## Testing the Integration

### Test Zoom Webhook

1. Create a test meeting with cloud recording
2. Enable transcript
3. Check Replit logs for webhook reception:
   ```
   Zoom transcript ready for meeting: Test Meeting (1234567890)
   Created suggestion from Zoom meeting: [Title]
   ```

### Test Google Meet Webhook

```bash
# Manual test
curl -X POST http://localhost:5000/api/webhooks/meet \
  -H "Content-Type: application/json" \
  -d '{
    "conferenceId": "YOUR_CONFERENCE_ID",
    "conferenceName": "Test Meeting"
  }'
```

---

## Troubleshooting

### Zoom Issues

**Transcript not appearing:**
- Verify "Audio transcript" is enabled in account settings
- Check meeting was recorded to cloud (not local)
- Wait ~2x meeting duration for processing
- Verify webhook is properly configured

**Webhook not received:**
- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Check Zoom app event subscriptions are active

**401 Unauthorized:**
- Refresh your Zoom access token
- Verify scopes include `cloud_recording:read:admin`

### Google Meet Issues

**Transcript not found:**
- Verify transcript was enabled during the meeting (someone must click "Start transcription")
- Wait 7-45+ minutes after meeting ends
- Check conference ID is correct
- Verify OAuth scopes are granted

**403 Forbidden:**
- OAuth verification may be required (sensitive scopes)
- Verify user has access to the meeting space
- Check API is enabled in Google Cloud Console

**No transcript entries:**
- Transcription may not have been started during meeting
- Meeting may have been too short
- Audio quality issues may prevent transcription

---

## Production Recommendations

### 1. Token Refresh (CRITICAL)

Both Zoom and Google tokens expire within 1 hour. **The integrations will stop working without automatic refresh.**

#### Zoom Token Refresh Implementation

```typescript
// server/services/zoom-auth.ts
export async function refreshZoomToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: process.env.ZOOM_ACCOUNT_ID!,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

// Refresh every 50 minutes (before 60-minute expiration)
setInterval(async () => {
  try {
    const newToken = await refreshZoomToken();
    process.env.ZOOM_ACCESS_TOKEN = newToken;
    console.log('Zoom token refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh Zoom token:', error);
  }
}, 50 * 60 * 1000);
```

#### Google Token Refresh Implementation

```typescript
// server/services/google-auth.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// OAuth2 client automatically refreshes access tokens
export function getAuthenticatedClient() {
  return oauth2Client;
}

// Monitor token expiration
oauth2Client.on('tokens', (tokens) => {
  if (tokens.access_token) {
    process.env.GOOGLE_MEET_TOKEN = tokens.access_token;
    process.env.GOOGLE_DRIVE_TOKEN = tokens.access_token;
    console.log('Google token refreshed successfully');
  }
});
```

### 2. Rate Limiting
- **Zoom**: 10 requests/second per app
- **Google**: Varies by API (typically 1000-10,000 requests/day)
- Implement exponential backoff for 429 responses

### 3. Error Handling
- Log all failures with context (meeting ID, error type)
- Retry with exponential backoff (max 3 attempts)
- Alert on repeated failures

### 4. Monitoring
- Track webhook delivery success rates
- Monitor transcript processing latency
- Alert when tokens fail to refresh

### 5. Webhook Security
- Always verify Zoom webhook signatures
- Use HTTPS endpoints only
- Implement request rate limiting

### 6. Data Privacy
- Review data handling policies for meeting transcripts
- Ensure GDPR/CCPA compliance
- Store transcripts encrypted at rest

### 7. User Consent
- Inform meeting participants about transcript processing
- Provide opt-out mechanisms
- Include privacy notices in calendar invites

---

## Alternative: Recording Bot APIs

If native APIs don't meet your needs, consider third-party meeting bots:
- **Recall.ai**: Cross-platform (Zoom, Meet, Teams) with real-time transcription
- **Fireflies.ai**: Automated note-taking and knowledge extraction
- **Otter.ai**: Real-time transcription with speaker identification

These services join meetings as participants and provide better transcript quality and cross-platform support.
