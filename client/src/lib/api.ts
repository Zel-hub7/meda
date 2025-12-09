import type { Suggestion, ActivityLog, Settings } from "@shared/schema";

const API_BASE = "/api";

export const api = {
  async getSuggestions(filters?: { status?: string; source?: string; minConfidence?: number }): Promise<Suggestion[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.source) params.append("source", filters.source);
    if (filters?.minConfidence) params.append("minConfidence", filters.minConfidence.toString());
    
    const url = `${API_BASE}/suggestions${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch suggestions");
    return res.json();
  },

  async getSuggestion(id: string): Promise<Suggestion> {
    const res = await fetch(`${API_BASE}/suggestions/${id}`);
    if (!res.ok) throw new Error("Failed to fetch suggestion");
    return res.json();
  },

  async approveSuggestion(id: string, userName?: string): Promise<Suggestion> {
    const res = await fetch(`${API_BASE}/suggestions/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName }),
    });
    if (!res.ok) throw new Error("Failed to approve suggestion");
    return res.json();
  },

  async rejectSuggestion(id: string, userName?: string): Promise<Suggestion> {
    const res = await fetch(`${API_BASE}/suggestions/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName }),
    });
    if (!res.ok) throw new Error("Failed to reject suggestion");
    return res.json();
  },

  async getActivity(filters?: { status?: string; source?: string; limit?: number }): Promise<ActivityLog[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.source) params.append("source", filters.source);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    
    const url = `${API_BASE}/activity${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch activity");
    return res.json();
  },

  async getSettings(userId: string): Promise<Settings> {
    const res = await fetch(`${API_BASE}/settings/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
  },

  async updateSettings(settings: Partial<Settings> & { userId: string }): Promise<Settings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
  },

  async getStats(): Promise<{ pending: number; approvedToday: number; accuracyRate: number }> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  async processText(data: {
    text: string;
    source: string;
    sourceType: string;
    sourceLink: string;
    originalSource: string;
  }): Promise<{ detected: boolean; suggestion?: Suggestion }> {
    const res = await fetch(`${API_BASE}/process-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to process text");
    return res.json();
  },
};
