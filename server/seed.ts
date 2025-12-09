import { storage } from "./storage";
import { db } from "./db";
import { suggestions } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDemoData() {
  console.log("Checking for existing demo data...");

  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(suggestions);
    const suggestionCount = Number(result[0]?.count || 0);
    
    if (suggestionCount > 0) {
      console.log(`Found ${suggestionCount} existing suggestions, skipping demo data seeding`);
      return;
    }
  } catch (error) {
    console.warn("Could not check for existing data, proceeding with seeding:", error);
  }

  console.log("No existing data found, seeding demo data...");

  const demoSuggestions = [
    {
      source: "#engineering",
      sourceType: "slack" as const,
      knowledgeType: "policy" as const,
      title: "Update to Remote Work Policy",
      proposedContent: "Effective immediately, all team members are required to attend Monday standup meetings via Zoom at 10 AM EST. This replaces the previous async Slack update requirement. Attendance is mandatory unless you have a scheduling conflict approved by your manager.",
      currentContent: "Team members should post async updates in #standup every Monday by 12 PM EST.",
      confidence: 92,
      sourceLink: "https://slack.com/archives/C123/p1234567890",
      notionPageId: null,
      notionPageUrl: "https://notion.so/remote-work-policy",
      aiReasoning: "Extraction: This is a clear policy change with specific requirements.\n\nValidation: Confirmed as actionable policy update that should be documented.",
      metadata: null,
    },
    {
      source: "Engineering Docs",
      sourceType: "drive" as const,
      knowledgeType: "engineering" as const,
      title: "API Endpoint Deprecation",
      proposedContent: "The /v1/search endpoint is now deprecated. All clients should migrate to /v2/search which includes improved filtering and pagination. The old endpoint will be removed on December 1st, 2024.",
      currentContent: null,
      confidence: 88,
      sourceLink: "https://drive.google.com/file/d/abc123",
      notionPageId: null,
      notionPageUrl: "https://notion.so/api-docs",
      aiReasoning: "Extraction: Important technical documentation about API changes.\n\nValidation: Critical engineering information that requires documentation.",
      metadata: null,
    },
    {
      source: "Product Meeting 11/15",
      sourceType: "meeting" as const,
      knowledgeType: "process" as const,
      title: "Customer Provisioning Workflow Update",
      proposedContent: "New provisioning step added: Email verification is now required before account activation. Users will receive a verification email immediately after signup. Accounts remain in pending state until email is verified.",
      currentContent: null,
      confidence: 85,
      sourceLink: "https://zoom.us/rec/share/abc123",
      notionPageId: null,
      notionPageUrl: "https://notion.so/provisioning-flow",
      aiReasoning: "Extraction: Clear process change discussed in product meeting.\n\nValidation: Important workflow update that affects user onboarding.",
      metadata: null,
    },
    {
      source: "#product",
      sourceType: "slack" as const,
      knowledgeType: "sop" as const,
      title: "Code Review Standards",
      proposedContent: "All pull requests must now include: 1) Description of changes, 2) Test coverage report, 3) Screenshots for UI changes, 4) Link to related ticket. PRs without these will be automatically rejected by the CI system.",
      currentContent: null,
      confidence: 90,
      sourceLink: "https://slack.com/archives/C456/p9876543210",
      notionPageId: null,
      notionPageUrl: "https://notion.so/code-review-standards",
      aiReasoning: "Extraction: Standard operating procedure for code reviews.\n\nValidation: Clear SOP that should be documented for team consistency.",
      metadata: null,
    },
  ];

  for (const suggestion of demoSuggestions) {
    await storage.createSuggestion(suggestion);
  }

  const demoActivity = [
    {
      suggestionId: null,
      status: "approved",
      title: "Customer Provisioning Flow updated",
      source: "Product Meeting",
      sourceType: "meeting" as const,
      userName: "Sarah Johnson",
      metadata: null,
    },
    {
      suggestionId: null,
      status: "approved",
      title: "Billing Architecture documentation",
      source: "#engineering",
      sourceType: "slack" as const,
      userName: "Mike Chen",
      metadata: null,
    },
    {
      suggestionId: null,
      status: "rejected",
      title: "Onboarding process suggestion",
      source: "Team Handbook.docx",
      sourceType: "drive" as const,
      userName: "Emily Davis",
      metadata: null,
    },
    {
      suggestionId: null,
      status: "approved",
      title: "Security Policy Update",
      source: "#security",
      sourceType: "slack" as const,
      userName: "Alice Brown",
      metadata: null,
    },
  ];

  for (const activity of demoActivity) {
    await storage.createActivityLog(activity);
  }

  console.log("Demo data seeded successfully!");
}
