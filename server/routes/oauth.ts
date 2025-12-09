import { Router, Request, Response as ExpressResponse } from "express";
import { integrationTokens } from "../services/integrationTokens";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import crypto from "crypto";

const router = Router();

const OAUTH_CONFIGS = {
  notion: {
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    clientIdEnv: "NOTION_CLIENT_ID",
    clientSecretEnv: "NOTION_CLIENT_SECRET",
    scopes: [],
    responseType: "code",
  },
  google_drive: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/documents.readonly",
    ],
    responseType: "code",
    accessType: "offline",
    prompt: "consent",
  },
  google_meet: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    scopes: [
      "https://www.googleapis.com/auth/meetings.space.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    responseType: "code",
    accessType: "offline",
    prompt: "consent",
  },
  zoom: {
    authUrl: "https://zoom.us/oauth/authorize",
    tokenUrl: "https://zoom.us/oauth/token",
    clientIdEnv: "ZOOM_CLIENT_ID",
    clientSecretEnv: "ZOOM_CLIENT_SECRET",
    scopes: ["recording:read", "user:read"],
    responseType: "code",
  },
  slack: {
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
    scopes: [
      "channels:history",
      "channels:read",
      "chat:write",
      "users:read",
      "team:read",
    ],
    responseType: "code",
    userScopes: ["channels:history", "channels:read"],
  },
};

const pendingOAuthStates = new Map<string, { teamId: string; type: string; expiresAt: number }>();

function generateState(teamId: string, type: string): string {
  const state = crypto.randomBytes(32).toString("hex");
  pendingOAuthStates.set(state, {
    teamId,
    type,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return state;
}

function validateState(state: string): { teamId: string; type: string } | null {
  const data = pendingOAuthStates.get(state);
  if (!data) return null;
  
  pendingOAuthStates.delete(state);
  
  if (data.expiresAt < Date.now()) {
    return null;
  }
  
  return { teamId: data.teamId, type: data.type };
}

setInterval(() => {
  const now = Date.now();
  for (const [state, data] of pendingOAuthStates.entries()) {
    if (data.expiresAt < now) {
      pendingOAuthStates.delete(state);
    }
  }
}, 60000);

function getRedirectUri(req: Request, type: string): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}/api/oauth/${type}/callback`;
}

router.get("/connect/:type", isAuthenticated, async (req: Request, res: ExpressResponse) => {
  try {
    const { type } = req.params;
    const teamId = req.query.teamId as string;
    
    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const config = OAUTH_CONFIGS[type as keyof typeof OAUTH_CONFIGS];
    if (!config) {
      return res.status(400).json({ error: `Unknown integration type: ${type}` });
    }

    const clientId = process.env[config.clientIdEnv];
    if (!clientId) {
      return res.status(500).json({ 
        error: `OAuth not configured for ${type}. Please set ${config.clientIdEnv} environment variable.`,
        needsConfiguration: true,
      });
    }

    const state = generateState(teamId, type);
    const redirectUri = getRedirectUri(req, type);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: config.responseType,
      state,
    });

    if (config.scopes.length > 0) {
      if (type === "slack") {
        params.set("scope", config.scopes.join(","));
        if ((config as any).userScopes) {
          params.set("user_scope", (config as any).userScopes.join(","));
        }
      } else {
        params.set("scope", config.scopes.join(" "));
      }
    }

    if ((config as any).accessType) {
      params.set("access_type", (config as any).accessType);
    }
    
    if ((config as any).prompt) {
      params.set("prompt", (config as any).prompt);
    }

    if (type === "notion") {
      params.set("owner", "user");
    }

    const authUrl = `${config.authUrl}?${params.toString()}`;
    
    res.json({ authUrl, state });
  } catch (error: any) {
    console.error("OAuth connect error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:type/callback", async (req: Request, res: ExpressResponse) => {
  try {
    const { type } = req.params;
    const { code, state, error: oauthError, error_description } = req.query;

    if (oauthError) {
      console.error(`OAuth error for ${type}:`, oauthError, error_description);
      return res.redirect(`/settings?error=oauth_denied&type=${type}`);
    }

    if (!code || !state) {
      return res.redirect(`/settings?error=oauth_invalid&type=${type}`);
    }

    const stateData = validateState(state as string);
    if (!stateData) {
      return res.redirect(`/settings?error=oauth_expired&type=${type}`);
    }

    const config = OAUTH_CONFIGS[type as keyof typeof OAUTH_CONFIGS];
    if (!config) {
      return res.redirect(`/settings?error=unknown_type&type=${type}`);
    }

    const clientId = process.env[config.clientIdEnv];
    const clientSecret = process.env[config.clientSecretEnv];

    if (!clientId || !clientSecret) {
      return res.redirect(`/settings?error=not_configured&type=${type}`);
    }

    const redirectUri = getRedirectUri(req, type);

    let tokenResponse: Response;
    let tokenData: any;

    if (type === "notion") {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
    } else if (type === "zoom") {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });
    } else {
      tokenResponse = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
    }

    tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error(`Token exchange failed for ${type}:`, tokenData);
      return res.redirect(`/settings?error=token_exchange_failed&type=${type}`);
    }

    let accessToken: string;
    let refreshToken: string | undefined;
    let expiresAt: Date | undefined;
    let metadata: Record<string, any> = {};

    if (type === "slack") {
      accessToken = tokenData.access_token;
      metadata = {
        botUserId: tokenData.bot_user_id,
        teamId: tokenData.team?.id,
        teamName: tokenData.team?.name,
        appId: tokenData.app_id,
      };
      
      if (tokenData.authed_user) {
        metadata.authedUser = tokenData.authed_user;
      }
    } else if (type === "notion") {
      accessToken = tokenData.access_token;
      metadata = {
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name,
        workspaceIcon: tokenData.workspace_icon,
        botId: tokenData.bot_id,
        owner: tokenData.owner,
      };
    } else {
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      
      if (tokenData.expires_in) {
        expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
      }
    }

    await integrationTokens.saveToken(stateData.teamId, type as any, {
      accessToken,
      refreshToken,
      expiresAt,
      metadata,
    });

    await storage.createActivityLog({
      teamId: stateData.teamId,
      status: "connected",
      title: `${type} integration connected`,
      source: type,
      sourceType: type,
      metadata: { action: "oauth_connect" },
    });

    res.redirect(`/settings?success=connected&type=${type}`);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    res.redirect(`/settings?error=callback_failed&type=${req.params.type}`);
  }
});

router.post("/disconnect/:type", isAuthenticated, async (req: Request, res: ExpressResponse) => {
  try {
    const { type } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    await integrationTokens.revokeToken(teamId, type as any);

    await storage.createActivityLog({
      teamId,
      status: "disconnected",
      title: `${type} integration disconnected`,
      source: type,
      sourceType: type,
      metadata: { action: "oauth_disconnect" },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("OAuth disconnect error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/status/:type", isAuthenticated, async (req: Request, res: ExpressResponse) => {
  try {
    const { type } = req.params;
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const status = await integrationTokens.getIntegrationStatus(teamId, type as any);
    
    const config = OAUTH_CONFIGS[type as keyof typeof OAUTH_CONFIGS];
    const clientId = config ? process.env[config.clientIdEnv] : null;

    res.json({
      ...status,
      oauthConfigured: !!clientId,
    });
  } catch (error: any) {
    console.error("OAuth status error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/status", isAuthenticated, async (req: Request, res: ExpressResponse) => {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const statuses = await integrationTokens.getAllIntegrationStatuses(teamId);
    
    const enrichedStatuses = statuses.map(status => {
      const config = OAUTH_CONFIGS[status.type as keyof typeof OAUTH_CONFIGS];
      const clientId = config ? process.env[config.clientIdEnv] : null;
      return {
        ...status,
        oauthConfigured: !!clientId,
      };
    });

    res.json(enrichedStatuses);
  } catch (error: any) {
    console.error("OAuth status error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
