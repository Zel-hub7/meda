/**
 * Development Seed Script
 *
 * Creates a complete set of fake development data including:
 * - A test user with email authentication
 * - A team for the test user
 * - Team settings
 * - Additional suggestions and activity logs
 *
 * This script is idempotent - it checks for existing data before inserting.
 */

import { sql } from "drizzle-orm";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type * as schema from "../shared/schema";
import bcrypt from "bcrypt";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables when run as standalone script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  const envPath = resolve(__dirname, "..", ".env");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=");
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvFile();

// Test user credentials for local development
const TEST_USER = {
  email: "dev@example.com",
  password: "password123",
  firstName: "Dev",
  lastName: "User",
};

const TEST_TEAM = {
  name: "Development Team",
  slug: "dev-team",
};

export async function seedDevelopmentData(db: NeonDatabase<typeof schema>) {
  console.log("🌱 Seeding development data...");

  try {
    // Check if test user already exists
    const existingUserResult = await db.execute(
      sql`SELECT id FROM users WHERE email = ${TEST_USER.email.toLowerCase()}`
    );
    const existingUsers = Array.isArray(existingUserResult)
      ? existingUserResult
      : (existingUserResult as any).rows || [];

    let userId: string;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`  ✓ Test user already exists (${TEST_USER.email})`);
    } else {
      // Create test user with email auth
      const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

      const insertUserResult = await db.execute(sql`
        INSERT INTO users (email, first_name, last_name, password_hash, auth_provider, email_verified)
        VALUES (${TEST_USER.email.toLowerCase()}, ${TEST_USER.firstName}, ${TEST_USER.lastName}, ${passwordHash}, 'email', true)
        RETURNING id
      `);

      const insertedUsers = Array.isArray(insertUserResult)
        ? insertUserResult
        : (insertUserResult as any).rows || [];
      userId = insertedUsers[0].id;
      console.log(`  ✓ Created test user: ${TEST_USER.email} / ${TEST_USER.password}`);
    }

    // Check if team already exists
    const existingTeamResult = await db.execute(
      sql`SELECT id FROM teams WHERE slug = ${TEST_TEAM.slug}`
    );
    const existingTeams = Array.isArray(existingTeamResult)
      ? existingTeamResult
      : (existingTeamResult as any).rows || [];

    let teamId: string;

    if (existingTeams.length > 0) {
      teamId = existingTeams[0].id;
      console.log(`  ✓ Test team already exists (${TEST_TEAM.name})`);
    } else {
      // Create team
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial

      const insertTeamResult = await db.execute(sql`
        INSERT INTO teams (name, slug, owner_id, subscription_status, subscription_plan, trial_ends_at, suggestions_limit, sources_limit, seats_limit)
        VALUES (${TEST_TEAM.name}, ${TEST_TEAM.slug}, ${userId}, 'trialing', 'growth', ${trialEndsAt}, 75, 2, 15)
        RETURNING id
      `);

      const insertedTeams = Array.isArray(insertTeamResult)
        ? insertTeamResult
        : (insertTeamResult as any).rows || [];
      teamId = insertedTeams[0].id;
      console.log(`  ✓ Created test team: ${TEST_TEAM.name}`);

      // Add user as team owner
      await db.execute(sql`
        INSERT INTO team_members (team_id, user_id, role, can_approve)
        VALUES (${teamId}, ${userId}, 'owner', true)
        ON CONFLICT DO NOTHING
      `);
      console.log(`  ✓ Added user as team owner`);

      // Create default settings for the team
      await db.execute(sql`
        INSERT INTO settings (team_id, auto_approve_enabled, confidence_threshold, admin_only_approvals, slack_notifications_enabled)
        VALUES (${teamId}, false, 95, true, true)
        ON CONFLICT DO NOTHING
      `);
      console.log(`  ✓ Created team settings`);
    }

    // Check if we already have team-linked suggestions
    const existingSuggestionsResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM suggestions WHERE team_id = ${teamId}`
    );
    const existingSuggestions = Array.isArray(existingSuggestionsResult)
      ? existingSuggestionsResult
      : (existingSuggestionsResult as any).rows || [];
    const suggestionCount = parseInt(existingSuggestions[0]?.count || "0");

    if (suggestionCount === 0) {
      // Create team-linked suggestions
      const teamSuggestions = [
        {
          source: "#engineering",
          sourceType: "slack",
          knowledgeType: "engineering",
          title: "API Rate Limiting Update",
          proposedContent:
            "All API endpoints now have rate limiting enabled. Free tier: 100 requests/minute. Pro tier: 1000 requests/minute. Enterprise: unlimited. Exceeding limits returns HTTP 429.",
          currentContent: null,
          confidence: 94,
          sourceLink: "https://slack.com/archives/C123/p1234567890",
          notionPageUrl: "https://notion.so/api-docs",
          aiReasoning:
            "Extraction: Clear technical specification about rate limiting.\n\nValidation: Important engineering documentation that should be captured.",
        },
        {
          source: "Product Weekly",
          sourceType: "meeting",
          knowledgeType: "process",
          title: "Sprint Planning Process Change",
          proposedContent:
            "Sprint planning meetings are now held bi-weekly on Mondays at 10 AM PT. Each team lead presents their sprint goals and blockers. Attendance is required for all engineers and product managers.",
          currentContent:
            "Sprint planning meetings are held weekly on Fridays at 2 PM PT.",
          confidence: 88,
          sourceLink: "https://zoom.us/rec/share/abc123",
          notionPageUrl: "https://notion.so/sprint-planning",
          aiReasoning:
            "Extraction: Process change discussed in product meeting.\n\nValidation: Impacts team workflow, should be documented.",
        },
        {
          source: "Engineering Docs",
          sourceType: "drive",
          knowledgeType: "sop",
          title: "Incident Response Procedure",
          proposedContent:
            "Updated incident response:\n1. Acknowledge in #incidents within 5 minutes\n2. Assign severity (P1-P4)\n3. Create incident channel for P1/P2\n4. Post updates every 30 minutes\n5. Complete post-mortem within 48 hours",
          currentContent: null,
          confidence: 91,
          sourceLink: "https://drive.google.com/file/d/incident-doc",
          notionPageUrl: "https://notion.so/incident-response",
          aiReasoning:
            "Extraction: Standard operating procedure for incident response.\n\nValidation: Critical SOP that needs to be widely accessible.",
        },
        {
          source: "#product",
          sourceType: "slack",
          knowledgeType: "policy",
          title: "Feature Flag Policy",
          proposedContent:
            "All new features must be behind feature flags before deployment to production. Flags should follow naming convention: team_feature_description. Flags must be cleaned up within 2 sprints of full rollout.",
          currentContent: null,
          confidence: 86,
          sourceLink: "https://slack.com/archives/C456/p9876543210",
          notionPageUrl: "https://notion.so/feature-flags",
          aiReasoning:
            "Extraction: Policy announcement in product channel.\n\nValidation: Engineering policy that affects development workflow.",
        },
        {
          source: "#announcements",
          sourceType: "slack",
          knowledgeType: "policy",
          title: "PTO Request Process",
          proposedContent:
            "PTO requests should be submitted via BambooHR at least 2 weeks in advance for requests of 3+ days. Requests under 3 days require 48-hour notice. All requests need manager approval.",
          currentContent:
            "PTO requests should be emailed to HR at least 1 week in advance.",
          confidence: 93,
          sourceLink: "https://slack.com/archives/C789/p1122334455",
          notionPageUrl: "https://notion.so/pto-policy",
          aiReasoning:
            "Extraction: HR policy update announced in announcements channel.\n\nValidation: Important policy change that affects all employees.",
        },
      ];

      for (const suggestion of teamSuggestions) {
        await db.execute(sql`
          INSERT INTO suggestions (
            team_id, source, source_type, knowledge_type, title,
            proposed_content, current_content, confidence, source_link,
            notion_page_url, ai_reasoning, status
          ) VALUES (
            ${teamId}, ${suggestion.source}, ${suggestion.sourceType}, ${suggestion.knowledgeType},
            ${suggestion.title}, ${suggestion.proposedContent}, ${suggestion.currentContent},
            ${suggestion.confidence}, ${suggestion.sourceLink}, ${suggestion.notionPageUrl},
            ${suggestion.aiReasoning}, 'pending'
          )
        `);
      }
      console.log(`  ✓ Created ${teamSuggestions.length} sample suggestions`);
    } else {
      console.log(`  ✓ Sample suggestions already exist (${suggestionCount} found)`);
    }

    // Check if we already have team-linked activity logs
    const existingActivityResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM activity_log WHERE team_id = ${teamId}`
    );
    const existingActivity = Array.isArray(existingActivityResult)
      ? existingActivityResult
      : (existingActivityResult as any).rows || [];
    const activityCount = parseInt(existingActivity[0]?.count || "0");

    if (activityCount === 0) {
      // Create activity logs for the team
      const activityLogs = [
        {
          status: "approved",
          title: "Database Migration Guide updated",
          source: "#backend",
          sourceType: "slack",
          userName: "Alex Chen",
        },
        {
          status: "approved",
          title: "Onboarding Checklist v2 synced",
          source: "HR Docs",
          sourceType: "drive",
          userName: "Sarah Miller",
        },
        {
          status: "rejected",
          title: "Draft: Coffee machine instructions",
          source: "#random",
          sourceType: "slack",
          userName: "System",
        },
        {
          status: "approved",
          title: "Q4 OKRs documentation added",
          source: "Leadership Sync",
          sourceType: "meeting",
          userName: "Jordan Lee",
        },
        {
          status: "connected",
          title: "Slack integration connected",
          source: "slack",
          sourceType: "slack",
          userName: "Dev User",
        },
      ];

      for (const activity of activityLogs) {
        await db.execute(sql`
          INSERT INTO activity_log (team_id, status, title, source, source_type, user_name)
          VALUES (${teamId}, ${activity.status}, ${activity.title}, ${activity.source}, ${activity.sourceType}, ${activity.userName})
        `);
      }
      console.log(`  ✓ Created ${activityLogs.length} activity log entries`);
    } else {
      console.log(`  ✓ Activity logs already exist (${activityCount} found)`);
    }

    console.log();
    console.log("📋 Development credentials:");
    console.log(`   Email:    ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log();

  } catch (error: any) {
    console.error("Error seeding development data:", error.message);
    throw error;
  }
}

// Main execution when run directly
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Please check your .env file.");
    process.exit(1);
  }

  const { db } = await import("../server/db.js");
  await seedDevelopmentData(db as any);
  console.log("✅ Development data seeded successfully!");
  process.exit(0);
}

// Check if this file is being run directly
const isMainModule = process.argv[1]?.includes("seed-dev");
if (isMainModule) {
  main().catch((error) => {
    console.error("❌ Failed to seed:", error.message);
    process.exit(1);
  });
}

