import express, { type Request, Response, NextFunction } from "express";
import { runMigrations } from 'stripe-replit-sync';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDemoData } from "./seed";
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { initializeSlackSocketMode, processSlackMessageForKnowledge } from "./services/slack";
import { initializeSlackManager, shutdownSlackManager } from "./services/slackManager";
import { startTrialWarningScheduler } from "./services/notifications";
import { storage } from "./storage";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ 
      databaseUrl,
      schema: 'stripe'
    });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    console.log('Setting up managed webhook...');
    const domains = process.env.REPLIT_DOMAINS?.split(',');
    if (domains && domains.length > 0) {
      const webhookBaseUrl = `https://${domains[0]}`;
      const { webhook, uuid } = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`,
        {
          enabled_events: ['*'],
          description: 'Managed webhook for Current app',
        }
      );
      console.log(`Webhook configured: ${webhook.url} (UUID: ${uuid})`);
    }

    console.log('Syncing Stripe data in background...');
    stripeSync.syncBackfill()
      .then(() => console.log('Stripe data synced'))
      .catch((err: Error) => console.error('Error syncing Stripe data:', err));
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

await initStripe();

app.post(
  '/api/stripe/webhook/:uuid',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      const { uuid } = req.params;
      await WebhookHandlers.processWebhook(req.body as Buffer, sig, uuid);

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error for debugging (don't re-throw to avoid unhandled exceptions)
    console.error(`[Error Handler] ${status}: ${message}`, err.stack || err);

    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    await seedDemoData();
    
    // Start trial warning email scheduler
    startTrialWarningScheduler();
    
    // Initialize multi-tenant Slack manager
    // This connects to Slack for all teams that have stored their tokens
    try {
      await initializeSlackManager();
      console.log("[SlackManager] Multi-tenant Slack manager initialized");
    } catch (error) {
      console.error("[SlackManager] Failed to initialize:", error);
    }
    
    // Fallback: Also support legacy env var approach for backwards compatibility
    if (process.env.SLACK_APP_TOKEN && process.env.SLACK_BOT_TOKEN) {
      try {
        const teams = await storage.getAllTeams();
        const activeTeam = teams.find(t => t.subscriptionStatus === "trialing" || t.subscriptionStatus === "active");
        
        if (activeTeam) {
          const slackInitialized = await initializeSlackSocketMode(
            activeTeam.id,
            async (message, teamId) => {
              console.log(`[Slack] Received message in team ${teamId}: ${message.text?.substring(0, 50)}...`);
              await processSlackMessageForKnowledge(message, teamId);
            }
          );
          if (slackInitialized) {
            console.log(`[Slack] Legacy Socket Mode started for team: ${activeTeam.name}`);
          }
        }
      } catch (error) {
        console.error("[Slack] Failed to initialize legacy Socket Mode:", error);
      }
    }
  });
})();
