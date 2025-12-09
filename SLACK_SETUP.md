# Slack Integration Setup Guide

This guide shows you how to connect KnowledgeSync to Slack so it can automatically detect knowledge from your team's conversations.

## Overview

Once configured, Knowledge Sync will:
- ✅ Monitor specified Slack channels
- ✅ Detect when team members share policies, decisions, SOPs, etc.
- ✅ Extract knowledge using dual-model AI validation (Claude Sonnet + Opus)
- ✅ Create suggestions in the approval queue
- ✅ Update Notion pages when you approve suggestions

## Prerequisites

- Slack workspace admin access
- Your Replit app must be publicly accessible (for webhooks)
- Anthropic API key configured (`ANTHROPIC_API_KEY`)
- Notion integration set up

## Step 1: Create a Slack App

1. **Go to Slack API Console:**
   - Visit https://api.slack.com/apps
   - Click "Create New App"
   - Choose "From scratch"

2. **Name Your App:**
   - App Name: `KnowledgeSync` (or your choice)
   - Workspace: Select your workspace
   - Click "Create App"

## Step 2: Configure OAuth & Permissions

1. **Navigate to "OAuth & Permissions"** in the left sidebar

2. **Add Bot Token Scopes:**
   Under "Scopes" → "Bot Token Scopes", add:
   - `channels:history` - Read messages from public channels
   - `channels:read` - View basic channel information
   - `chat:write` - Send messages (optional, for notifications)

3. **Install App to Workspace:**
   - Scroll to top of page
   - Click "Install to Workspace"
   - Authorize the app
   - **Copy the "Bot User OAuth Token"** (starts with `xoxb-`)

4. **Add to Replit Secrets:**
   ```
   SLACK_BOT_TOKEN=xoxb-your-token-here
   ```

## Step 3: Enable Event Subscriptions

1. **Navigate to "Event Subscriptions"** in the left sidebar

2. **Enable Events:**
   - Toggle "Enable Events" to ON

3. **Configure Request URL:**
   - Enter your webhook URL: `https://your-replit-app.replit.app/api/webhooks/slack`
   - Slack will send a verification challenge
   - KnowledgeSync will automatically respond
   - Wait for "Verified" checkmark ✓

4. **Subscribe to Bot Events:**
   Under "Subscribe to bot events", add:
   - `message.channels` - Listen to messages in public channels

5. **Save Changes:**
   - Click "Save Changes" at the bottom

## Step 4: Get Signing Secret

1. **Navigate to "Basic Information"** in the left sidebar

2. **Find "App Credentials":**
   - Locate "Signing Secret"
   - Click "Show"
   - **Copy the signing secret**

3. **Add to Replit Secrets:**
   ```
   SLACK_SIGNING_SECRET=your-signing-secret-here
   ```

## Step 5: Invite Bot to Channels

The bot can only read messages from channels it's a member of.

1. **Open a Slack channel** you want to monitor (e.g., #engineering, #product)

2. **Invite the bot:**
   - Type: `/invite @KnowledgeSync`
   - Or: Click channel name → "Integrations" → "Add apps"

3. **Repeat for all channels** you want to monitor

## Step 6: Restart Your Application

After adding secrets to Replit:
1. Stop the workflow ("Start application")
2. Start it again
3. Check logs for: `Slack webhook endpoint ready`

## Testing Your Integration

### Test 1: Send a Test Message

In a channel where the bot is a member, post:

```
New engineering policy: All database migrations must be reviewed by at least 2 senior engineers before deployment. This ensures data safety and reduces production incidents. Effective immediately.
```

**Expected Results:**
1. Check your Replit logs for: `Slack message received from channel: C12345`
2. If AI detects knowledge: `Created suggestion from Slack message: Engineering Migration Policy`
3. Check Approval Queue page - new suggestion should appear

### Test 2: Verify Signature

The webhook should reject requests with invalid signatures. You can test this using curl:

```bash
# This should fail with 401 Unauthorized
curl -X POST https://your-app.replit.app/api/webhooks/slack \
  -H "Content-Type: application/json" \
  -H "X-Slack-Signature: v0=invalid" \
  -H "X-Slack-Request-Timestamp: 1234567890" \
  -d '{"type":"url_verification","challenge":"test"}'
```

## Environment Variables Summary

```bash
# Required
SLACK_SIGNING_SECRET=your-signing-secret-here
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (for sending notifications back to Slack)
SLACK_BOT_TOKEN=xoxb-your-token-here
```

## How It Works

### Message Flow

```
Slack Channel → Webhook → KnowledgeSync → AI Analysis → Notion Suggestion
```

1. **User posts message** in monitored channel
2. **Slack sends webhook** to `/api/webhooks/slack`
3. **Signature verified** using signing secret
4. **Message filtered** (ignore bots, DMs, edits)
5. **AI extracts knowledge** (Sonnet extraction + Opus validation)
6. **Confidence check** (must be ≥70% from both models)
7. **Notion page matched** by title
8. **Suggestion created** in approval queue
9. **User approves** → Notion page updated

### What Messages Are Processed?

**✅ Processed:**
- Public channel messages from humans
- Messages containing policies, decisions, SOPs
- Clear knowledge statements

**❌ Ignored:**
- Bot messages
- Direct messages (DMs)
- Message edits
- Deleted messages
- Thread replies (optional - can be enabled)

### Performance Notes

- **3-Second Rule**: Slack requires webhook responses within 3 seconds
- **Async Processing**: AI analysis happens in the background
- **No Blocking**: Webhook responds immediately, processes later

## Troubleshooting

### "Webhook verification failed"

**Problem:** Slack shows "Cannot verify URL"

**Solutions:**
1. Make sure app is publicly accessible
2. Check Replit logs for errors
3. Verify `/api/webhooks/slack` endpoint exists
4. Restart application workflow

### "No suggestions appearing"

**Problem:** Messages sent but no suggestions created

**Possible causes:**
1. **Bot not invited to channel** - Run `/invite @KnowledgeSync`
2. **Message too casual** - Try more formal language: "New policy: ..."
3. **Confidence too low** - AI requires ≥70% confidence from both models
4. **ANTHROPIC_API_KEY missing** - Check Replit Secrets
5. **Check logs** - Look for "No actionable knowledge detected"

**Debug checklist:**
```bash
# Check if webhook received message
grep "Slack message received" logs

# Check if AI processed it
grep "Created suggestion from Slack" logs

# Check confidence scores
grep "confidence" logs
```

### "Invalid signature" errors

**Problem:** Logs show "Invalid Slack webhook signature"

**Solutions:**
1. Double-check `SLACK_SIGNING_SECRET` in Replit Secrets
2. Make sure secret has no extra spaces
3. Restart application after updating secrets

### "Event already processed" warnings

**Problem:** Duplicate events being received

**Solution:** This is normal - Slack sometimes retries events. KnowledgeSync handles this gracefully.

## Advanced Configuration

### Enable Thread Monitoring

To monitor thread replies (not just top-level messages), edit `server/routes.ts`:

```typescript
// Change this line:
if (event.type === "message" && 
    event.channel_type === "channel" && 
    !event.bot_id && 
    !event.subtype) {

// To this (removes subtype check):
if (event.type === "message" && 
    event.channel_type === "channel" && 
    !event.bot_id) {
```

### Filter Specific Channels

To only process specific channels, add filtering:

```typescript
const allowedChannels = ['C123456', 'C789012']; // Channel IDs
if (!allowedChannels.includes(event.channel)) {
  return res.json({ success: true }); // Ignore
}
```

### Custom Confidence Threshold

To change the AI confidence requirement (default 70%), edit `server/services/ai.ts`:

```typescript
// Change both occurrences:
if (!extraction.isKnowledge || extraction.confidence < 80) { // Stricter
if (!validation.isValid || validation.confidence < 80) {
```

## Security Best Practices

1. **Always verify signatures** - Don't skip signature verification in production
2. **Use HTTPS only** - Slack requires HTTPS for webhooks
3. **Rotate secrets** - Regenerate signing secret periodically
4. **Monitor logs** - Watch for suspicious activity
5. **Limit scopes** - Only request necessary OAuth scopes

## Rate Limits

- **Slack Events API**: ~30,000 events per hour per workspace
- **Anthropic API**: Check your plan limits
- **Notion API**: 3 requests/second per integration

If you hit rate limits:
- Add message queuing
- Implement exponential backoff
- Filter messages before processing

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Test with sample messages
3. ✅ Invite bot to key channels
4. ✅ Configure Notion integration
5. ✅ Train team on posting knowledge-worthy updates
6. 📊 Monitor approval queue daily
7. 📈 Track accuracy rates in dashboard

## Need Help?

- **Slack API Docs**: https://api.slack.com/apis/events-api
- **KnowledgeSync Issues**: Check application logs in Replit
- **Test Endpoint**: Use `/api/process-text` for manual testing

## Production Checklist

Before going live:
- [ ] SLACK_SIGNING_SECRET configured
- [ ] ANTHROPIC_API_KEY configured  
- [ ] Notion connection working
- [ ] Bot invited to channels
- [ ] Tested with real messages
- [ ] Monitored logs for errors
- [ ] Set up alerting for failures
- [ ] Documented for team

---

**Congratulations!** Your Slack → Notion knowledge sync is ready! 🎉
