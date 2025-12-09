#!/usr/bin/env tsx
/**
 * Bootstrap Script for Local Development
 *
 * This script sets up a local development environment in one command:
 * 1. Checks/copies .env.example to .env
 * 2. Installs npm dependencies
 * 3. Pushes database schema (creates tables)
 * 4. Seeds the database with development data
 *
 * Usage: npm run bootstrap
 */

import { execSync, spawn } from "child_process";
import { existsSync, copyFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");

// ANSI color codes for pretty output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function log(message: string, type: "info" | "success" | "warn" | "error" | "step" = "info") {
  const prefix = {
    info: `${colors.cyan}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    step: `${colors.bright}→${colors.reset}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

function logHeader(title: string) {
  console.log();
  console.log(`${colors.bright}${colors.cyan}━━━ ${title} ━━━${colors.reset}`);
  console.log();
}

function exec(command: string, options: { silent?: boolean; cwd?: string } = {}) {
  const { silent = false, cwd = ROOT_DIR } = options;
  try {
    const result = execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    return { success: true, output: result };
  } catch (error: any) {
    return { success: false, output: error.message, error };
  }
}

// Step 1: Check and copy .env file
function setupEnvFile() {
  logHeader("Environment Setup");

  const envPath = resolve(ROOT_DIR, ".env");
  const envExamplePath = resolve(ROOT_DIR, ".env.example");

  if (existsSync(envPath)) {
    log(".env file already exists, keeping your existing configuration", "success");
    return true;
  }

  if (!existsSync(envExamplePath)) {
    log(".env.example not found! Please ensure the file exists.", "error");
    return false;
  }

  log("Copying .env.example to .env...", "step");
  copyFileSync(envExamplePath, envPath);
  log(".env file created from template", "success");
  log(
    `${colors.yellow}Please review and update your .env file with the correct values:${colors.reset}`,
    "warn"
  );
  log(`  ${colors.dim}• DATABASE_URL - Your PostgreSQL connection string${colors.reset}`);
  log(`  ${colors.dim}• SESSION_SECRET - Generate a secure random string${colors.reset}`);
  log(
    `  ${colors.dim}• AI_INTEGRATIONS_ANTHROPIC_API_KEY - For AI features (optional)${colors.reset}`
  );
  console.log();

  return true;
}

// Step 2: Install dependencies
function installDependencies() {
  logHeader("Installing Dependencies");

  log("Running npm install...", "step");
  const result = exec("npm install");

  if (!result.success) {
    log("Failed to install dependencies", "error");
    console.error(result.output);
    return false;
  }

  log("Dependencies installed successfully", "success");
  return true;
}

// Step 3: Check database connection and push schema
async function setupDatabase() {
  logHeader("Database Setup");

  // Load .env file
  const envPath = resolve(ROOT_DIR, ".env");
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

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    log("DATABASE_URL is not set in your .env file", "error");
    log("Please update your .env file with a valid PostgreSQL connection string", "warn");
    log("Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/current_dev", "info");
    return false;
  }

  log("Checking database connection...", "step");

  // Test database connection using a simple query
  try {
    const { Pool } = await import("@neondatabase/serverless");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query("SELECT 1");
    await pool.end();
    log("Database connection successful", "success");
  } catch (error: any) {
    log("Failed to connect to database", "error");
    log(`Error: ${error.message}`, "error");
    log("Please ensure your database server is running and DATABASE_URL is correct", "warn");
    return false;
  }

  // Push schema using drizzle-kit
  log("Pushing database schema with Drizzle...", "step");
  const pushResult = exec("npm run db:push");

  if (!pushResult.success) {
    log("Failed to push database schema", "error");
    return false;
  }

  log("Database schema pushed successfully", "success");
  return true;
}

// Step 4: Seed the database
async function seedDatabase() {
  logHeader("Seeding Database");

  log("Running seed script...", "step");

  // Import and run the seed function directly
  try {
    // Re-import db with the environment loaded
    const { db } = await import("../server/db.js");
    const { seedDemoData } = await import("../server/seed.js");
    const { seedDevelopmentData } = await import("./seed-dev.js");

    // Run the enhanced development seed
    await seedDevelopmentData(db);

    // Also run the original demo data seed (it has idempotency checks)
    await seedDemoData();

    log("Database seeded successfully", "success");
    return true;
  } catch (error: any) {
    // If seed-dev doesn't exist yet, just run the built-in seed
    if (error.code === "ERR_MODULE_NOT_FOUND" && error.message.includes("seed-dev")) {
      try {
        const { seedDemoData } = await import("../server/seed.js");
        await seedDemoData();
        log("Database seeded with demo data", "success");
        return true;
      } catch (innerError: any) {
        log(`Failed to seed database: ${innerError.message}`, "error");
        return false;
      }
    }
    log(`Failed to seed database: ${error.message}`, "error");
    return false;
  }
}

// Print success summary
function printSummary(steps: { name: string; success: boolean }[]) {
  logHeader("Setup Summary");

  const allSuccess = steps.every((s) => s.success);

  steps.forEach((step) => {
    log(step.name, step.success ? "success" : "error");
  });

  console.log();

  if (allSuccess) {
    console.log(`${colors.green}${colors.bright}✨ Bootstrap completed successfully!${colors.reset}`);
    console.log();
    console.log(`${colors.bright}Next steps:${colors.reset}`);
    console.log(`  1. Review your ${colors.cyan}.env${colors.reset} file and update any missing values`);
    console.log(`  2. Start the development server:`);
    console.log();
    console.log(`     ${colors.cyan}npm run dev${colors.reset}`);
    console.log();
    console.log(`  3. Open ${colors.cyan}http://localhost:5000${colors.reset} in your browser`);
    console.log();
    console.log(`${colors.dim}Pre-seeded data includes:`);
    console.log(`  • Demo suggestions in the approval queue`);
    console.log(`  • Activity log entries`);
    console.log(`  • Sample team and user for testing${colors.reset}`);
    console.log();
  } else {
    console.log(
      `${colors.red}${colors.bright}⚠ Bootstrap completed with errors.${colors.reset}`
    );
    console.log(`Please fix the issues above and run ${colors.cyan}npm run bootstrap${colors.reset} again.`);
    console.log();
  }
}

// Main execution
async function main() {
  console.log();
  console.log(
    `${colors.bright}${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}║     Current - Local Development Bootstrap      ║${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}`
  );

  const steps: { name: string; success: boolean }[] = [];

  // Step 1: Setup .env file
  const envSuccess = setupEnvFile();
  steps.push({ name: "Environment file setup", success: envSuccess });

  if (!envSuccess) {
    printSummary(steps);
    process.exit(1);
  }

  // Step 2: Install dependencies
  const depsSuccess = installDependencies();
  steps.push({ name: "Install dependencies", success: depsSuccess });

  if (!depsSuccess) {
    printSummary(steps);
    process.exit(1);
  }

  // Step 3: Setup database
  const dbSuccess = await setupDatabase();
  steps.push({ name: "Database schema setup", success: dbSuccess });

  if (!dbSuccess) {
    printSummary(steps);
    process.exit(1);
  }

  // Step 4: Seed database
  const seedSuccess = await seedDatabase();
  steps.push({ name: "Database seeding", success: seedSuccess });

  // Print summary
  printSummary(steps);

  process.exit(steps.every((s) => s.success) ? 0 : 1);
}

main().catch((error) => {
  log(`Unexpected error: ${error.message}`, "error");
  process.exit(1);
});

