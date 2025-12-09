import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const userId = claims["sub"];
  const email = claims["email"];
  const firstName = claims["first_name"];
  const lastName = claims["last_name"];
  
  await storage.upsertUser({
    id: userId,
    email,
    firstName,
    lastName,
    profileImageUrl: claims["profile_image_url"],
  });
  
  // Check if user has a team, if not create one
  const existingTeams = await storage.getTeamsByUserId(userId);
  if (existingTeams.length === 0) {
    try {
      // Create a personal team for the user
      const teamName = firstName && lastName 
        ? `${firstName}'s Team` 
        : email?.split("@")[0] + "'s Team" || "My Team";
      
      // Generate a unique slug with timestamp to avoid collisions
      const timestamp = Date.now().toString(36);
      const baseSlug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      let slug = `${baseSlug}-${timestamp}`;
      
      // Double-check for the unlikely case of collision
      let counter = 1;
      while (await storage.getTeamBySlug(slug)) {
        slug = `${baseSlug}-${timestamp}-${counter}`;
        counter++;
      }
      
      // Create team with 14-day trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);
      
      const team = await storage.createTeam({
        name: teamName,
        slug,
        ownerId: userId,
        subscriptionPlan: "trial",
        subscriptionStatus: "trialing",
        trialEndsAt,
        suggestionsLimit: 20, // Starter tier limit during trial
        sourcesLimit: 1,
        seatsLimit: 5,
        suggestionsUsed: 0,
      });
      
      // Add user as owner of the team
      await storage.addTeamMember({
        teamId: team.id,
        userId,
        role: "owner",
      });
      
      // Create default settings for the team
      await storage.upsertSettings({
        teamId: team.id,
        autoApproveEnabled: false,
        confidenceThreshold: 95,
        adminOnlyApprovals: true,
        slackNotificationsEnabled: true,
        emailDigestEnabled: false,
      });
      
      console.log(`Created team "${teamName}" (${slug}) for new user ${email}`);
    } catch (error: any) {
      // Log the error but don't throw - user can still use the app
      // They just won't have a team until they retry login
      console.error(`Failed to create team for user ${email}:`, error.message);
      
      // If team was created but member/settings failed, try to clean up
      // This is a best-effort cleanup
      try {
        const partialTeams = await storage.getTeamsByUserId(userId);
        if (partialTeams.length === 0) {
          // Team creation itself failed, nothing to clean up
          console.log("Team creation failed, user will need to retry login");
        }
      } catch (cleanupError) {
        console.error("Cleanup check failed:", cleanupError);
      }
    }
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // First check for email-based authentication (session userId)
  const session = req.session as any;
  if (session?.userId) {
    // Email auth user - session is valid
    return next();
  }
  
  // Check for Replit OAuth authentication
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
