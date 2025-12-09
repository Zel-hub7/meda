import { storage } from "../storage";
import type { Integration } from "@shared/schema";

export type IntegrationType = "notion" | "slack" | "google_drive" | "zoom" | "google_meet";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface IntegrationStatus {
  connected: boolean;
  type: IntegrationType;
  teamId: string;
  error?: string;
  lastRefresh?: Date;
  metadata?: Record<string, any>;
}

export class IntegrationTokenService {
  async getToken(teamId: string, type: IntegrationType): Promise<TokenData | null> {
    const integration = await storage.getIntegrationByType(teamId, type);
    
    if (!integration || integration.status !== "connected" || !integration.accessToken) {
      return null;
    }

    if (integration.tokenExpiresAt && new Date(integration.tokenExpiresAt) < new Date()) {
      const refreshed = await this.refreshToken(teamId, type, integration);
      if (!refreshed) {
        return null;
      }
      return refreshed;
    }

    return {
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      expiresAt: integration.tokenExpiresAt || undefined,
      metadata: integration.metadata as Record<string, any> || undefined,
    };
  }

  async getValidToken(teamId: string, type: IntegrationType): Promise<TokenData | null> {
    const typeMapping: Record<string, IntegrationType> = {
      "zoom": "zoom",
      "meet": "google_meet",
      "drive": "google_drive",
      "notion": "notion",
      "slack": "slack",
      "google_meet": "google_meet",
      "google_drive": "google_drive",
    };
    
    const mappedType = typeMapping[type] || type;
    return this.getToken(teamId, mappedType as IntegrationType);
  }

  async saveToken(
    teamId: string, 
    type: IntegrationType, 
    tokenData: TokenData
  ): Promise<Integration> {
    const existing = await storage.getIntegrationByType(teamId, type);
    
    if (existing) {
      const updated = await storage.updateIntegration(existing.id, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken || null,
        tokenExpiresAt: tokenData.expiresAt || null,
        status: "connected",
        metadata: tokenData.metadata || existing.metadata,
      });
      return updated!;
    }
    
    return await storage.createIntegration({
      teamId,
      type,
      status: "connected",
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || null,
      tokenExpiresAt: tokenData.expiresAt || null,
      metadata: tokenData.metadata || null,
    });
  }

  async revokeToken(teamId: string, type: IntegrationType): Promise<void> {
    const integration = await storage.getIntegrationByType(teamId, type);
    if (integration) {
      await storage.updateIntegration(integration.id, {
        status: "pending",
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
      });
    }
  }

  async getIntegrationStatus(teamId: string, type: IntegrationType): Promise<IntegrationStatus> {
    const integration = await storage.getIntegrationByType(teamId, type);
    
    if (!integration) {
      return {
        connected: false,
        type,
        teamId,
        error: "Integration not configured",
      };
    }

    if (integration.status === "error") {
      return {
        connected: false,
        type,
        teamId,
        error: (integration.metadata as any)?.error || "Connection error",
        metadata: integration.metadata as Record<string, any>,
      };
    }

    if (integration.status !== "connected" || !integration.accessToken) {
      return {
        connected: false,
        type,
        teamId,
        error: "Not connected - please authorize",
      };
    }

    if (integration.tokenExpiresAt && new Date(integration.tokenExpiresAt) < new Date()) {
      return {
        connected: false,
        type,
        teamId,
        error: "Token expired - please reconnect",
      };
    }

    return {
      connected: true,
      type,
      teamId,
      lastRefresh: integration.updatedAt || undefined,
      metadata: integration.metadata as Record<string, any>,
    };
  }

  async getAllIntegrationStatuses(teamId: string): Promise<IntegrationStatus[]> {
    const types: IntegrationType[] = ["notion", "slack", "google_drive", "zoom", "google_meet"];
    return Promise.all(types.map(type => this.getIntegrationStatus(teamId, type)));
  }

  private async refreshToken(
    teamId: string, 
    type: IntegrationType, 
    integration: Integration
  ): Promise<TokenData | null> {
    if (!integration.refreshToken) {
      await storage.updateIntegration(integration.id, {
        status: "error",
        metadata: { ...integration.metadata as object, error: "No refresh token available" },
      });
      return null;
    }

    try {
      let newTokenData: TokenData | null = null;

      switch (type) {
        case "notion":
          newTokenData = await this.refreshNotionToken(integration.refreshToken);
          break;
        case "google_drive":
        case "google_meet":
          newTokenData = await this.refreshGoogleToken(integration.refreshToken, type);
          break;
        case "zoom":
          newTokenData = await this.refreshZoomToken(integration.refreshToken);
          break;
        case "slack":
          return {
            accessToken: integration.accessToken!,
            refreshToken: integration.refreshToken,
            metadata: integration.metadata as Record<string, any>,
          };
        default:
          return null;
      }

      if (newTokenData) {
        await this.saveToken(teamId, type, newTokenData);
        return newTokenData;
      }

      return null;
    } catch (error: any) {
      console.error(`Failed to refresh ${type} token for team ${teamId}:`, error);
      await storage.updateIntegration(integration.id, {
        status: "error",
        metadata: { ...integration.metadata as object, error: error.message },
      });
      return null;
    }
  }

  private async refreshNotionToken(refreshToken: string): Promise<TokenData | null> {
    console.log("Notion token refresh not implemented - tokens are long-lived");
    return null;
  }

  private async refreshGoogleToken(refreshToken: string, type: IntegrationType): Promise<TokenData | null> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log("Google OAuth credentials not configured");
      return null;
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
    };
  }

  private async refreshZoomToken(refreshToken: string): Promise<TokenData | null> {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log("Zoom OAuth credentials not configured");
      return null;
    }

    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
    };
  }
}

export const integrationTokens = new IntegrationTokenService();
