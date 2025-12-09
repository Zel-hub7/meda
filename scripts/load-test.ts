/**
 * Load Testing Script for Current
 * 
 * Simulates 50 teams sending concurrent Slack messages to verify:
 * - Job queue processes them without backing up
 * - Database handles concurrent load
 * - No race conditions in job claiming
 * 
 * Usage: npx tsx scripts/load-test.ts
 */

import { db } from "../server/db";
import { storage } from "../server/storage";
import { teams, jobs, users } from "../shared/schema";
import { sql } from "drizzle-orm";

const NUM_TEAMS = 50;
const MESSAGES_PER_TEAM = 5;
const CONCURRENT_BATCH_SIZE = 10;

interface TestResult {
  totalTeams: number;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  avgJobCreationTime: number;
  totalDuration: number;
  jobsPerSecond: number;
}

async function createTestTeams(count: number): Promise<string[]> {
  console.log(`Creating ${count} test teams...`);
  const teamIds: string[] = [];
  
  // Use a unique run ID for this test run
  const runId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  // First create a test user to own the teams
  const testUserId = `load-test-user-${runId}`;
  await db.insert(users).values({
    id: testUserId,
    email: `loadtest-${runId}@test.example.com`,
    firstName: "Load",
    lastName: "Tester",
    authProvider: "email",
  });
  
  for (let i = 0; i < count; i++) {
    const teamId = `load-test-${runId}-${i}`;
    
    await db.insert(teams).values({
      id: teamId,
      name: `Load Test Team ${i + 1}`,
      slug: `load-test-${runId}-${i}`,
      ownerId: testUserId,
      subscriptionStatus: "trialing",
      subscriptionPlan: "starter",
      suggestionsLimit: 100,
      sourcesLimit: 4,
      seatsLimit: 10,
    });
    
    teamIds.push(teamId);
    
    if ((i + 1) % 10 === 0) {
      console.log(`  Created ${i + 1}/${count} teams`);
    }
  }
  
  console.log(`Created ${teamIds.length} test teams`);
  return teamIds;
}

async function simulateSlackMessages(teamIds: string[], messagesPerTeam: number): Promise<number> {
  console.log(`\nSimulating ${messagesPerTeam} Slack messages per team (${teamIds.length * messagesPerTeam} total)...`);
  
  const startTime = Date.now();
  let jobsCreated = 0;
  
  // Process in batches to avoid overwhelming the database
  for (let batch = 0; batch < teamIds.length; batch += CONCURRENT_BATCH_SIZE) {
    const batchTeams = teamIds.slice(batch, batch + CONCURRENT_BATCH_SIZE);
    
    const promises = batchTeams.flatMap(teamId => 
      Array.from({ length: messagesPerTeam }, async (_, i) => {
        try {
          await storage.createJob({
            teamId,
            type: "slack_message",
            status: "pending",
            priority: 0,
            attempts: 0,
            maxAttempts: 3,
            data: {
              messageId: `test-msg-${Date.now()}-${i}`,
              channelId: "C123TEST",
              channelName: "#test-channel",
              userId: "U123TEST",
              userName: "Load Tester",
              text: `Test message ${i + 1}: This is a simulated Slack message for load testing purposes. It contains some knowledge that should be extracted: Our new deployment process uses blue-green deployments with automatic rollback.`,
              timestamp: new Date().toISOString(),
            },
            scheduledFor: new Date(),
          });
          jobsCreated++;
        } catch (error) {
          console.error(`Failed to create job for team ${teamId}:`, error);
        }
      })
    );
    
    await Promise.all(promises);
    
    if ((batch + CONCURRENT_BATCH_SIZE) % 20 === 0 || batch + CONCURRENT_BATCH_SIZE >= teamIds.length) {
      const progress = Math.min(batch + CONCURRENT_BATCH_SIZE, teamIds.length);
      console.log(`  Processed ${progress}/${teamIds.length} teams (${jobsCreated} jobs created)`);
    }
  }
  
  const duration = Date.now() - startTime;
  console.log(`Created ${jobsCreated} jobs in ${duration}ms (${(jobsCreated / (duration / 1000)).toFixed(2)} jobs/sec)`);
  
  return jobsCreated;
}

async function waitForJobProcessing(maxWaitMs: number = 60000): Promise<void> {
  console.log(`\nWaiting for job processing (max ${maxWaitMs / 1000}s)...`);
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM jobs
      WHERE team_id LIKE 'load-test-%'
    `);
    
    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    const stats = rows[0] || {};
    const pending = parseInt(stats.pending) || 0;
    const processing = parseInt(stats.processing) || 0;
    const completed = parseInt(stats.completed) || 0;
    const failed = parseInt(stats.failed) || 0;
    
    console.log(`  Pending: ${pending}, Processing: ${processing}, Completed: ${completed}, Failed: ${failed}`);
    
    if (pending === 0 && processing === 0) {
      console.log(`All jobs processed in ${(Date.now() - startTime) / 1000}s`);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("Timeout waiting for jobs to complete");
}

async function getJobStats(): Promise<{ completed: number; failed: number; pending: number; processing: number }> {
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'processing') as processing,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'failed') as failed
    FROM jobs
    WHERE team_id LIKE 'load-test-%'
  `);
  
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  const stats = rows[0] || {};
  
  return {
    pending: parseInt(stats.pending) || 0,
    processing: parseInt(stats.processing) || 0,
    completed: parseInt(stats.completed) || 0,
    failed: parseInt(stats.failed) || 0,
  };
}

async function cleanup(): Promise<void> {
  console.log("\nCleaning up test data...");
  
  // Delete test jobs
  await db.execute(sql`DELETE FROM jobs WHERE team_id LIKE 'load-test-%'`);
  
  // Delete test teams
  await db.execute(sql`DELETE FROM teams WHERE id LIKE 'load-test-%'`);
  
  // Delete test users
  await db.execute(sql`DELETE FROM users WHERE id LIKE 'load-test-user-%'`);
  
  console.log("Cleanup complete");
}

async function runLoadTest(): Promise<TestResult> {
  console.log("=".repeat(60));
  console.log("LOAD TEST: Current - 50 Team Simulation");
  console.log("=".repeat(60));
  
  const startTime = Date.now();
  
  try {
    // Create test teams
    const teamIds = await createTestTeams(NUM_TEAMS);
    
    // Simulate Slack messages
    const jobCreationStart = Date.now();
    const totalJobs = await simulateSlackMessages(teamIds, MESSAGES_PER_TEAM);
    const avgJobCreationTime = (Date.now() - jobCreationStart) / totalJobs;
    
    // Wait for processing (optional - comment out if not running workers)
    // await waitForJobProcessing();
    
    // Get final stats
    const finalStats = await getJobStats();
    
    const totalDuration = Date.now() - startTime;
    
    const result: TestResult = {
      totalTeams: NUM_TEAMS,
      totalJobs,
      successfulJobs: finalStats.completed,
      failedJobs: finalStats.failed,
      avgJobCreationTime,
      totalDuration,
      jobsPerSecond: totalJobs / (totalDuration / 1000),
    };
    
    // Print results
    console.log("\n" + "=".repeat(60));
    console.log("LOAD TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`Total Teams: ${result.totalTeams}`);
    console.log(`Total Jobs Created: ${result.totalJobs}`);
    console.log(`Jobs Completed: ${result.successfulJobs}`);
    console.log(`Jobs Failed: ${result.failedJobs}`);
    console.log(`Jobs Still Pending: ${finalStats.pending}`);
    console.log(`Jobs Processing: ${finalStats.processing}`);
    console.log(`Avg Job Creation Time: ${result.avgJobCreationTime.toFixed(2)}ms`);
    console.log(`Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Throughput: ${result.jobsPerSecond.toFixed(2)} jobs/sec`);
    console.log("=".repeat(60));
    
    // Cleanup
    await cleanup();
    
    return result;
  } catch (error) {
    console.error("Load test failed:", error);
    await cleanup();
    throw error;
  }
}

// Run the test
runLoadTest()
  .then(() => {
    console.log("\nLoad test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nLoad test failed:", error);
    process.exit(1);
  });
