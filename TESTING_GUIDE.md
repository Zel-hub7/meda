# Testing Guide: Slack → AI → Notion Flow

This guide shows you how to test the complete knowledge extraction flow from Slack to Notion without needing a full Slack integration setup.

## Required API Keys

To test the system, you need two API keys:

### 1. Anthropic API Key (Required for AI)

**Get Your Key:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key (starts with `sk-ant-`)

**Add to Replit:**
1. Click the "Secrets" tab (lock icon) in the left sidebar
2. Add new secret:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-...` (your key)

### 2. Notion API Token (Required for Page Matching)

**Setup Steps:**

1. **Create a Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "+ New integration"
   - Give it a name like "KnowledgeSync"
   - Select your workspace
   - Click "Submit"
   - Copy the "Internal Integration Token" (starts with `secret_`)

2. **Share Pages with Integration:**
   - Open your Notion workspace
   - Go to a page you want KnowledgeSync to update
   - Click "•••" menu → "Connections" → "Connect to" → Select your integration
   - Repeat for any pages you want the system to access

3. **Add to Replit:**
   - Key: `NOTION_TOKEN`
   - Value: `secret_...` (your token)

## Testing Without Real Slack

You don't need a full Slack setup to test! Use the `/api/process-text` endpoint to manually submit messages:

### Option 1: Quick cURL Test

```bash
curl -X POST http://localhost:5000/api/process-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Team decision: We are switching our deployment process to use GitHub Actions instead of Jenkins. This will give us better integration with our repository and faster CI/CD pipelines. Effective immediately for all new projects.",
    "source": "Slack #engineering",
    "sourceType": "slack",
    "sourceLink": "https://slack.com/archives/C123/p1234567890"
  }'
```

### Option 2: Create Test Messages in the App

I can create a simple admin/testing page where you can:
- Paste Slack messages
- Click "Process" to run them through AI
- See suggestions appear in the approval queue
- Approve them to update Notion

### Option 3: Postman/Insomnia

Use any API client:
- **Method:** POST
- **URL:** `http://localhost:5000/api/process-text`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "text": "Your message text here - should contain some policy, decision, or knowledge",
  "source": "Slack #channel-name",
  "sourceType": "slack",
  "sourceLink": "https://slack.com/archives/CHANNEL/pTIMESTAMP"
}
```

## Expected Flow

When you submit text:

1. **AI Extraction** (Claude Sonnet 4.5)
   - Analyzes the text
   - Identifies knowledge type (policy/decision/SOP/etc)
   - Assigns confidence score

2. **AI Validation** (Claude Opus 4.1)
   - Double-checks the extraction
   - Validates the knowledge claim
   - Provides second confidence score

3. **Confidence Check**
   - Both models must score ≥70%
   - Average confidence calculated

4. **Notion Page Matching**
   - Searches your Notion workspace
   - Finds best matching page by title
   - Extracts current content

5. **Suggestion Created**
   - Appears in Approval Queue
   - Shows proposed vs. current content
   - Displays AI reasoning

6. **Human Approval**
   - You review in the UI
   - Approve or reject
   - On approval: Notion page updated automatically

## Testing Examples

### Example 1: Policy Update
```json
{
  "text": "New policy: All pull requests must have at least 2 approvals before merging. Code owners are required for any changes to the /api directory. This policy is effective starting next Monday.",
  "source": "Slack #engineering",
  "sourceType": "slack"
}
```

### Example 2: SOP (Standard Operating Procedure)
```json
{
  "text": "Here's our updated on-call rotation process: 1) Check PagerDuty at start of shift 2) Acknowledge all alerts within 5 minutes 3) Update incident doc with status every 30 minutes 4) Post summary in #incidents when resolved",
  "source": "Slack #operations",
  "sourceType": "slack"
}
```

### Example 3: Engineering Decision
```json
{
  "text": "After discussing the API versioning strategy, we've decided to use URL path versioning (e.g., /v1/users, /v2/users) instead of header-based versioning. This makes it easier for external partners to integrate.",
  "source": "Slack #architecture",
  "sourceType": "slack"
}
```

### Example 4: Product Decision
```json
{
  "text": "Product decision from today's meeting: We're deprecating the old dashboard UI in Q2 2024. All users will be migrated to the new React-based dashboard. Marketing will send announcement emails 30 days before migration.",
  "source": "Slack #product",
  "sourceType": "slack"
}
```

## Troubleshooting

### "Error: Anthropic API key not found"
- Add `ANTHROPIC_API_KEY` to Replit Secrets
- Restart the application workflow

### "Error: Notion API key not found"
- Add `NOTION_TOKEN` to Replit Secrets
- Make sure you shared at least one Notion page with your integration
- Restart the application workflow

### "No suggestion created"
- Check console logs for AI confidence scores
- Text might not contain clear knowledge (policy/decision/etc)
- Try more explicit/formal language
- Confidence threshold is 70% - both AI models must agree

### "Demo mode: Notion update skipped"
- This happens when `NOTION_TOKEN` is missing
- The approval flow still works, just won't update Notion
- Add the token to enable real updates

## Next Steps

1. **Get API Keys** - Follow instructions above
2. **Test Manually** - Use curl or create a test UI
3. **Review Suggestions** - Check the Approval Queue page
4. **Approve Updates** - Test the Notion sync
5. **Optional:** Set up real Slack integration for production

Would you like me to create a simple testing UI page where you can paste messages and process them?
