# Current - AI-Powered Knowledge Base Agent

## Overview

Current is an AI-powered knowledge management system designed to automatically detect, validate, and suggest updates to an organization's Notion knowledge base. It integrates with various sources like Slack, Google Drive, Zoom, and Google Meet, leveraging Claude AI for intelligent content extraction and validation. The system provides a human-in-the-loop approval workflow through an intuitive dashboard, allowing team members to review, compare, and approve or reject AI-generated suggestions, which are then synced to Notion. Its purpose is to enhance productivity by streamlining knowledge base maintenance and ensuring up-to-date information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, using Vite for development and Wouter for routing. It features a UI component system based on Shadcn/ui, Radix UI, and Tailwind CSS, with a design inspired by leading productivity tools. State management relies on TanStack Query for server state with aggressive caching and React hooks for local UI state. The layout includes a fixed sidebar for navigation and responsive grid systems, supporting light/dark themes.

### Backend

The backend utilizes Express.js for its HTTP server and API routing, with a WebSocket server for real-time client notifications. It follows a RESTful API design pattern for CRUD operations and action-based workflows. AI integration is handled via Anthropic Claude (claude-sonnet-4-5 model) for a two-phase extraction and validation process, providing structured JSON responses. The service layer is modular, with dedicated modules for AI, Notion, Slack, Google Drive, Zoom, Google Meet, and a storage abstraction.

### Data Storage

The application uses PostgreSQL (via Neon serverless) with Drizzle ORM for persistent data storage. The database schema includes tables for users, suggestions (tracking source, type, content, confidence, Notion linkage, status, and AI reasoning), activity logs (for audit trails), and settings (per-user/team configuration like auto-approval thresholds and notification preferences). UUIDs are used for primary keys, and the system is configured for serverless compatibility.

### Authentication and Authorization

The system implements dual authentication supporting both Replit OAuth and email/password login. It supports multi-tenancy with team-scoped data queries, role-based permissions (Owner, Admin, Member), and an invitation system for team members.

### Integration Patterns

The system employs WebSockets for real-time updates and a webhook architecture to receive and process events from external services. Robust error handling is implemented through try-catch blocks, structured logging, HTTP status codes, Zod validation, and user-facing toast notifications.

### Key Features

- **Approval Queue UX**: Streamlined approval flow, AI reasoning display, Notion page picker, and an enhanced diff viewer with "Preview," "Compare," and "Unified View" options.
- **Slack Context Enrichment**: Includes channel name, user info, and thread context for AI extraction.
- **Onboarding Wizard**: Multi-step wizard guiding users through integration setup with connection status checks and a demo mode.
- **Subscription Limit Enforcement**: Middleware for checking usage limits and displaying upgrade prompts.
- **Email Notifications**: For new suggestion alerts, trial warnings, and trial expiration.
- **Role-Based Approval Permissions**: Ensures secure and granular control over suggestion approvals.
- **AI Confidence Explanations**: Collapsible reasoning display in approval cards with distinct styling for extraction and validation.
- **Job Queue Hardening**: Implements a persistent job queue with atomic claiming, per-team limits, auto-retry with exponential backoff, and a dead-letter queue.
- **Duplicate Detection Enhancement**: Improved Jaccard similarity calculation for accurate duplicate prevention.
- **Multi-Tenant Architecture**: Supports 50+ concurrent teams with a persistent job queue, staged SlackClientManager startup, and a health dashboard.
- **Error Monitoring System**: Centralized logging, email alerts for critical errors, and integration with the health dashboard.
- **Admin Dashboard**: Provides team overview, job monitoring, bulk actions, and error tracking.
- **Bulk Approve/Reject**: Multi-select checkboxes and bulk action bar in the approval queue with permission checks.
- **Usage Meters**: Visual progress bars showing usage against plan limits with warning states (80% amber, 100% red) and upgrade prompts.
- **Notion Allowlist Preview**: Coming soon card in Settings for future page-level governance controls.

### Marketing Pages

The marketing site includes the following pages:
- **Home** (`/`): Landing page with ROI-focused messaging, problem/solution framing, and ROI calculator
- **Product** (`/product`): Feature overview with interactive approval workflow preview
- **How It Works** (`/how-it-works`): 4-step visual flow explaining the workflow (Connect → Listen → AI Compares → Approve), under-the-hood explanation, and target audience cards
- **Use Cases** (`/use-cases`): Detailed use cases for Customer Success, Engineering, Marketing/Content, and Product teams
- **Pricing** (`/pricing`): 5 pricing tiers (Starter $99/mo to Enterprise custom) with Stripe integration, "Why Enterprise?" section, and coming-soon source indicators
- **Security** (`/security`): Security & Trust page with SOC2 roadmap, SSO roadmap, data policies, compliance information, and enterprise governance details
- **Compare pages** (`/compare/notion`, `/compare/confluence`, `/compare/guru`): Competitive comparison pages
- **Blog** (`/blog`): Coming soon placeholder with newsletter signup

Navigation includes: Product, How It Works, Use Cases, Pricing, Blog in the header. All pages share consistent footer with Product, Compare, Company, and Legal sections.

## External Dependencies

*   **Anthropic Claude API**: For AI-powered knowledge extraction and validation (via Replit AI Integrations).
*   **Notion API**: For knowledge base integration, including page search and updates.
*   **Slack**: For message monitoring via Socket Mode and notifications.
*   **Google Drive**: For document change monitoring and content extraction.
*   **Zoom**: For cloud recording transcript extraction via webhooks.
*   **Google Meet**: For conference transcript fetching.
*   **Neon Serverless PostgreSQL**: Primary data store.
*   **Resend**: For sending email notifications.
*   **Stripe**: For managing subscription pricing tiers, free trials, and billing.

## Security & Scalability Assessment (Dec 2024)

### Security Hardening Completed
- **Admin Route Authorization**: All `/api/admin/*` endpoints require system admin access (via ADMIN_EMAILS env var or oldest team owner)
- **Health Endpoint Protection**: `/api/health/system` requires authentication and system admin role
- **Error Handler Fix**: Removed re-throw after response to prevent unhandled exceptions
- **Admin Check Caching**: 5-minute cache TTL to reduce database queries on admin checks

### Production Readiness: 100 Clients
✅ **Ready** - The current architecture can reliably serve 100 paying clients at $299/month with:
- Multi-tenant Slack/Notion/Drive integrations
- Persistent job queue with retry logic and dead-letter queue
- Role-based permissions (Owner, Admin, Member)
- Stripe billing integration with 14-day trials
- Email notifications for suggestions and trial warnings

### Scalability Blockers for 1000 Clients
⚠️ **Needs Work** - The following architectural changes are required for 1000-client scale:

1. **Rate Limiting**: In-memory Map won't work across multiple server instances; needs Redis-backed distributed rate limiting
2. **Job Queue**: Single-process, no horizontal scaling; needs BullMQ or cloud queue (AWS SQS, GCP Pub/Sub)
3. **Slack Connections**: Sequential batching (5 connections every 2s) would take ~7 minutes for 1000 clients at startup; needs parallel bounded connection pool with jitter
4. **OAuth State**: In-memory storage breaks with horizontal scaling; needs Redis or database-backed sessions
5. **Database Indexes**: May need optimization for jobs/suggestions/activity tables as data grows

### Recommended Next Steps for Scale
1. Move to Redis for distributed state (sessions, rate limits, admin cache)
2. Adopt durable job queue with multiple workers (BullMQ)
3. Implement connection pooling with parallel bounded pool for Slack/integrations
4. Add explicit `isSystemAdmin` flag to user table for cleaner admin authorization
5. Add database indexes on frequently queried columns (teamId, status, createdAt)