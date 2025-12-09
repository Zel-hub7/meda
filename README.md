# Current - AI-Powered Knowledge Base Agent

<div align="center">

![Current Logo](client/public/favicon.png)

**Automatically detect, validate, and suggest updates to your organization's knowledge base**

[Getting Started](#getting-started) • [Features](#features) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

## Overview

Current is an AI-powered knowledge management system that automatically detects updates from your team's communication channels (Slack, Google Drive, Zoom, Google Meet) and suggests changes to your Notion knowledge base. It provides a human-in-the-loop approval workflow through an intuitive dashboard.

### Key Features

- 🤖 **AI-Powered Extraction** - Claude AI analyzes conversations and documents to identify knowledge updates
- ✅ **Human-in-the-Loop** - Review and approve suggestions before they sync to Notion
- 📊 **Confidence Scoring** - AI provides confidence levels and reasoning for each suggestion
- 🔗 **Multi-Source Integration** - Connect Slack, Google Drive, Zoom, and Google Meet
- 👥 **Team Collaboration** - Multi-tenant architecture with role-based permissions
- 📈 **Usage Analytics** - Track knowledge updates and team productivity

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or later ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or later ([Download](https://www.postgresql.org/download/))
  - Or use a cloud provider like [Neon](https://neon.tech) (recommended for serverless)

### Quick Start (< 10 minutes)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd heycurrent-main
   ```

2. **Run the bootstrap script**

   ```bash
   npm run bootstrap
   ```

   This single command will:
   - Copy `.env.example` to `.env` (if not exists)
   - Install all npm dependencies
   - Push the database schema to PostgreSQL
   - Seed the database with sample development data

3. **Configure your environment**

   Open `.env` and update the required values:

   ```bash
   # Required: Your PostgreSQL connection string
   DATABASE_URL=postgresql://postgres:password@localhost:5432/current_dev

   # Required for sessions (generate a random string)
   SESSION_SECRET=your-secret-here

   # Optional: Enable AI features
   AI_INTEGRATIONS_ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:5000](http://localhost:5000) in your browser.

### Development Credentials

After running bootstrap, you can log in with:

| Field    | Value             |
|----------|-------------------|
| Email    | `dev@example.com` |
| Password | `password123`     |

---

## Project Structure

```
heycurrent-main/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # UI components (Shadcn/ui + Radix)
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── services/           # Business logic (AI, Slack, Notion, etc.)
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   └── index.ts            # Server entry point
├── shared/                 # Shared code
│   └── schema.ts           # Drizzle ORM schema (database models)
├── scripts/                # Development scripts
│   ├── bootstrap.ts        # One-command setup script
│   └── seed-dev.ts         # Development data seeder
└── .env.example            # Environment variables template
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run bootstrap` | One-command setup: install deps, push schema, seed data |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run db:push` | Push Drizzle schema changes to database |
| `npm run seed` | Run development seed script only |
| `npm run check` | TypeScript type checking |

---

## Environment Variables

See `.env.example` for the complete list. Key variables:

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session encryption secret |

### Optional (Enable Features)

| Variable | Description |
|----------|-------------|
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Enable AI-powered extraction |
| `SLACK_CLIENT_ID/SECRET` | Enable Slack OAuth integration |
| `NOTION_CLIENT_ID/SECRET` | Enable Notion OAuth integration |
| `GOOGLE_CLIENT_ID/SECRET` | Enable Google Drive/Meet integration |
| `RESEND_API_KEY` | Enable email notifications |

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Neon serverless), Drizzle ORM |
| **AI** | Anthropic Claude (claude-sonnet-4-5) |
| **Auth** | Express sessions, bcrypt (email auth), Replit OAuth |

### Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sources   │───▶│   AI Agent  │───▶│  Dashboard  │
│ Slack/Drive │    │  Extraction │    │   Review    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                             ▼
                                     ┌─────────────┐
                                     │   Notion    │
                                     │    Sync     │
                                     └─────────────┘
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Run the bootstrap: `npm run bootstrap`
4. Make your changes
5. Run type checking: `npm run check`
6. Commit your changes: `git commit -m 'Add my feature'`
7. Push to the branch: `git push origin feature/my-feature`
8. Open a Pull Request

---

## Troubleshooting

### Database Connection Errors

```
Error: connection refused to localhost:5432
```

- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- For Neon, make sure you're using the pooled connection string

### Bootstrap Fails

```
Error: DATABASE_URL is not set
```

- Run `cp .env.example .env` manually
- Edit `.env` with your database credentials
- Run `npm run bootstrap` again

### Port Already in Use

```
Error: EADDRINUSE: port 5000
```

- Change `PORT` in your `.env` file
- Or kill the process using port 5000: `lsof -ti:5000 | xargs kill`

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by the Current team**

</div>

