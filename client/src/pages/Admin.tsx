import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Building2,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TeamWithStats {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  suggestionsUsed: number;
  suggestionsLimit: number;
  memberCount: number;
  pendingJobs: number;
  failedJobs: number;
  recentErrors: number;
  slackConnected: boolean;
  notionConnected: boolean;
  createdAt: string;
}

interface TeamJobs {
  stats: {
    pending: number;
    processing: number;
    failed: number;
    completed: number;
  };
  failedJobs: Array<{
    id: string;
    type: string;
    error: string;
    createdAt: string;
  }>;
}

function TeamCard({ team, onExpand, isExpanded }: { 
  team: TeamWithStats; 
  onExpand: () => void;
  isExpanded: boolean;
}) {
  const { toast } = useToast();
  
  const { data: teamJobs, isLoading: jobsLoading } = useQuery<TeamJobs>({
    queryKey: ["/api/admin/teams", team.id, "jobs"],
    enabled: isExpanded,
  });

  const retryJobsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/admin/teams/${team.id}/jobs/retry`, { method: "POST" });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Jobs Retried",
        description: `${data.retriedCount} failed jobs queued for retry`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams", team.id, "jobs"] });
    },
  });

  const clearJobsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/admin/teams/${team.id}/jobs/failed`, { method: "DELETE" });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Jobs Cleared",
        description: `${data.clearedCount} failed jobs removed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/teams", team.id, "jobs"] });
    },
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter": return "bg-blue-500";
      case "growth": return "bg-green-500";
      case "scale": return "bg-purple-500";
      case "pro_scale": return "bg-orange-500";
      case "enterprise": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "trialing": return "bg-blue-500";
      case "past_due": return "bg-yellow-500";
      case "canceled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onExpand}>
      <Card className={team.failedJobs > 0 || team.recentErrors > 0 ? "border-yellow-500" : ""}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>{team.slug}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPlanColor(team.subscriptionPlan)}>
                  {team.subscriptionPlan}
                </Badge>
                <Badge className={getStatusColor(team.subscriptionStatus)}>
                  {team.subscriptionStatus}
                </Badge>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{team.memberCount} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {team.suggestionsUsed}/{team.suggestionsLimit === -1 ? "∞" : team.suggestionsLimit} suggestions
              </span>
            </div>
            <div className="flex items-center gap-2">
              {team.slackConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Slack</span>
            </div>
            <div className="flex items-center gap-2">
              {team.notionConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <FileText className="h-4 w-4" />
              <span className="text-sm">Notion</span>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Jobs:</span>
              <Badge variant="secondary">{team.pendingJobs} pending</Badge>
              {team.failedJobs > 0 && (
                <Badge variant="destructive">{team.failedJobs} failed</Badge>
              )}
            </div>
            {team.recentErrors > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-500">{team.recentErrors} errors (24h)</span>
              </div>
            )}
          </div>

          <CollapsibleContent>
            {jobsLoading ? (
              <div className="py-4">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : teamJobs && (
              <div className="py-4 border-t space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{teamJobs.stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-500">{teamJobs.stats.processing}</p>
                    <p className="text-xs text-muted-foreground">Processing</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-500">{teamJobs.stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-red-500">{teamJobs.stats.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                {teamJobs.failedJobs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Failed Jobs</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryJobsMutation.mutate()}
                          disabled={retryJobsMutation.isPending}
                          data-testid={`button-retry-team-${team.id}`}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => clearJobsMutation.mutate()}
                          disabled={clearJobsMutation.isPending}
                          data-testid={`button-clear-team-${team.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {teamJobs.failedJobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="p-2 bg-red-50 dark:bg-red-950 rounded-md text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{job.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(job.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-red-600 dark:text-red-400 truncate">{job.error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const { data: teams, isLoading, refetch } = useQuery<TeamWithStats[]>({
    queryKey: ["/api/admin/teams"],
    refetchInterval: 30000,
  });

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Fetching latest team data...",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const teamsWithIssues = teams?.filter(t => t.failedJobs > 0 || t.recentErrors > 0) || [];
  const healthyTeams = teams?.filter(t => t.failedJobs === 0 && t.recentErrors === 0) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all teams and monitor system health
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          data-testid="button-refresh-admin"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{teams?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                {teams?.filter(t => t.subscriptionStatus === "active").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">
                {teams?.filter(t => t.subscriptionStatus === "trialing").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">In Trial</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {teamsWithIssues.length}
              </p>
              <p className="text-sm text-muted-foreground">Need Attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams with Issues */}
      {teamsWithIssues.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Teams Needing Attention ({teamsWithIssues.length})
          </h2>
          <div className="space-y-4">
            {teamsWithIssues.map((team) => (
              <TeamCard 
                key={team.id} 
                team={team} 
                onExpand={() => toggleTeam(team.id)}
                isExpanded={expandedTeams.has(team.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Healthy Teams */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          All Teams ({healthyTeams.length})
        </h2>
        <div className="space-y-4">
          {healthyTeams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              onExpand={() => toggleTeam(team.id)}
              isExpanded={expandedTeams.has(team.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
