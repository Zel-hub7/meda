# *Current* - Setup Guide

This guide will help you get *Current* up and running for your team.

## Quick Start

### 1. Connect Your Integrations

*Current* uses Replit's built-in integration system for secure OAuth connections. Go to **Settings > Integrations** in your app to connect:

#### Required Integrations

| Integration | Purpose | How to Connect |
|-------------|---------|----------------|
| **Notion** | Your knowledge base where updates are synced | Click "Connect" in Settings, authorize with Notion |
| **Stripe** | Payment processing for subscriptions | Already configured automatically |

#### Optional Integrations

| Integration | Purpose | How to Connect |
|-------------|---------|----------------|
| **Slack** | Monitor channels for knowledge updates | Click "Connect" in Settings, authorize with Slack |
| **Google Drive** | Watch folders for document changes | Click "Connect" in Settings, authorize with Google |

### 2. Environment Variables

Most integrations are handled automatically through Replit connectors. The following are pre-configured:

| Variable | Description | Status |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection | Auto-configured |
| `SESSION_SECRET` | Session encryption | Auto-configured |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Claude AI for knowledge extraction | Auto-configured |

#### Optional Manual Configuration

For email notifications (team invitations), you can add:

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `RESEND_API_KEY` | Email service for invitations | [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Sender email address | Your verified domain |

### 3. Invite Your Team

1. Go to **Settings > Team**
2. Click **Invite Member**
3. Enter their email and select a role (Admin or Member)
4. They'll receive an email invitation to join

## How It Works

### Knowledge Detection Flow

```
Source (Slack/Drive/Meeting) 
    ↓
AI Extraction (Claude analyzes content)
    ↓
Validation (confidence scoring)
    ↓
Suggestion Queue (human review)
    ↓
Approved → Notion Update
```

### Approval Workflow

1. **Dashboard** shows pending suggestions with confidence scores
2. **Review** each suggestion with side-by-side comparison
3. **Approve** to sync to Notion, or **Reject** with feedback
4. **Activity Log** tracks all decisions for audit

## Pricing Tiers

| Plan | Price | Suggestions/mo | Sources | Team Seats |
|------|-------|----------------|---------|------------|
| Starter | $99/mo | 100 | 2 | 3 |
| Growth | $199/mo | 500 | 4 | 10 |
| Scale | $399/mo | 2,000 | 6 | 25 |
| Pro Scale | $699/mo | 5,000 | Unlimited | 50 |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited |

All plans include a **14-day free trial**.

## Troubleshooting

### "Notion not connected"

1. Go to Settings > Integrations
2. Click "Connect" next to Notion
3. Authorize *Current* to access your Notion workspace
4. Make sure you share the pages you want to update

### "No matching Notion page found"

When approving a suggestion, *Current* searches for a matching page title in Notion. Ensure:
- The page exists in your connected Notion workspace
- The page is shared with the *Current* integration
- The title matches closely (AI will suggest the best match)

### Slack messages not appearing

1. Ensure Slack is connected in Settings > Integrations
2. Invite the *Current* bot to the channels you want to monitor
3. Check that Socket Mode is enabled in your Slack app settings

## Support

- **Email**: support@getcurrent.ai
- **Documentation**: This guide + in-app help
- **Book a Demo**: [/book-demo](/book-demo)

---

*Current* - AI-Powered Knowledge Base
