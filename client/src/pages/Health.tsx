import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  Activity,
  Database,
  Zap,
  MessageSquare,
  FileText,
  Video,
  Users,
  AlertTriangle,
  Bug,
  Check
} from "lucide-react";

interface IntegrationHealth {
  teamId: string;
  integrations: {
    slack: {
      configured: boolean;
      connected: boolean;
      workspace: string | null;
      lastError: string | null;
    };
    notion: {
      configured: boolean;
      connected?: boolean;
    };
    googleDrive: {
      configured: boolean;
      connected?: boolean;
    };
    zoom: {
      configured: boolean;
    };
    googleMeet: {
      configured: boolean;
    };
  };
  jobQueue: {
    pending: number;
    processing: number;
    failed: number;
    completed: number;
  };
  timestamp: string;
}

interface SystemHealth {
  status: string;
  database: { connected: boolean };
  slackConnections: {
    total: number;
    connected: number;
    disconnected: number;
    idle: number;
  };
  jobQueue: {
    activeWorkers: number;
    workerId: string;
  };
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  timestamp: string;
}

interface ErrorStats {
  total: number;
  critical: number;
  unresolved: number;
  byCategory: Record<string, number>;
}

interface ErrorLog {
  id: string;
  teamId: string | null;
  severity: string;
  category: string;
  message: string;
  context: Record<string, any>;
  stack: string | null;
  resolved: boolean;
  createdAt: string;
}

function StatusBadge({ connected, configured }: { connected?: boolean; configured: boolean }) {
  if (!configured) {
    return <Badge variant="secondary">Not Configured</Badge>;
  }
  if (connected === undefined) {
    return <Badge variant="outline">Configured</Badge>;
  }
  if (connected) {
    return <Badge className="bg-green-500 hover:bg-green-600">Connected</Badge>;
  }
  return <Badge variant="destructive">Disconnected</Badge>;
}

function IntegrationCard({ 
  name, 
  icon: Icon, 
  configured, 
  connected,
  workspace,
  error 
}: { 
  name: string; 
  icon: any; 
  configured: boolean; 
  connected?: boolean;
  workspace?: string | null;
  error?: string | null;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{name}</p>
              {workspace && (
                <p className="text-sm text-muted-foreground">{workspace}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connected === true && <CheckCircle className="h-4 w-4 text-green-500" />}
            {connected === false && configured && <XCircle className="h-4 w-4 text-red-500" />}
            {!configured && <AlertCircle className="h-4 w-4 text-muted-foreground" />}
            <StatusBadge connected={connected} configured={configured} />
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function JobQueueCard({ stats }: { stats: { pending: number; processing: number; failed: number; completed: number } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Background Jobs
        </CardTitle>
        <CardDescription>Persistent job queue for AI processing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
            <p className="text-sm text-muted-foreground">Processing</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorMonitoringCard({ stats, errors, onResolve }: { 
  stats: ErrorStats; 
  errors: ErrorLog[];
  onResolve: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Error Monitoring
        </CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">{stats.unresolved}</p>
            <p className="text-sm text-muted-foreground">Unresolved</p>
          </div>
        </div>

        {Object.keys(stats.byCategory).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">By Category</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <Badge key={category} variant="secondary">
                  {category}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Recent Errors</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {errors.slice(0, 5).map((error) => (
                <div 
                  key={error.id} 
                  className={`p-2 rounded-md text-sm ${
                    error.severity === 'critical' ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800' :
                    error.severity === 'error' ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800' :
                    'bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                          {error.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{error.category}</span>
                      </div>
                      <p className="mt-1 truncate">{error.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(error.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!error.resolved && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onResolve(error.id)}
                        data-testid={`button-resolve-error-${error.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Health() {
  const { toast } = useToast();
  
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery<IntegrationHealth>({
    queryKey: ["/api/health/integrations"],
    refetchInterval: 30000,
  });

  const { data: system, isLoading: systemLoading, refetch: refetchSystem } = useQuery<SystemHealth>({
    queryKey: ["/api/health/system"],
    refetchInterval: 30000,
  });

  const { data: errorStats, refetch: refetchErrorStats } = useQuery<ErrorStats>({
    queryKey: ["/api/health/errors/stats"],
    refetchInterval: 30000,
  });

  const { data: recentErrors, refetch: refetchErrors } = useQuery<ErrorLog[]>({
    queryKey: ["/api/health/errors", { resolved: "false", limit: "10" }],
    refetchInterval: 30000,
  });

  const retryJobsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/health/jobs/retry", { method: "POST" });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Jobs Retried",
        description: `${data.retriedCount} failed jobs queued for retry`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health/system"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to retry jobs",
        variant: "destructive",
      });
    },
  });

  const clearJobsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/health/jobs/failed", { method: "DELETE" });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Jobs Cleared",
        description: `${data.clearedCount} failed jobs removed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health/integrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health/system"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear jobs",
        variant: "destructive",
      });
    },
  });

  const resolveErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return apiRequest(`/api/health/errors/${errorId}/resolve`, { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "Error Resolved",
        description: "Error marked as resolved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/health/errors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health/errors/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve error",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetchHealth();
    refetchSystem();
    refetchErrorStats();
    refetchErrors();
    toast({
      title: "Refreshing",
      description: "Fetching latest health status...",
    });
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  if (healthLoading || systemLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Integration Health</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integration Health</h1>
          <p className="text-muted-foreground">
            Monitor your integrations and background jobs
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          data-testid="button-refresh-health"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Status */}
      {system && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Ready for 50+ concurrent teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Database:</span>
                {system.database.connected ? (
                  <Badge className="bg-green-500">Connected</Badge>
                ) : (
                  <Badge variant="destructive">Disconnected</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Uptime:</span>
                <Badge variant="secondary">{formatUptime(system.uptime)}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Memory:</span>
                <Badge variant="secondary">
                  {formatBytes(system.memory.heapUsed)} / {formatBytes(system.memory.heapTotal)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Workers:</span>
                <Badge variant="secondary">{system.jobQueue.activeWorkers} active</Badge>
              </div>
            </div>
            
            {/* Slack Connection Details */}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Slack Connections
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{system.slackConnections.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-500">{system.slackConnections.connected}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">{system.slackConnections.idle}</p>
                  <p className="text-xs text-muted-foreground">Idle</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{system.slackConnections.disconnected}</p>
                  <p className="text-xs text-muted-foreground">Disconnected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Status */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {health && (
            <>
              <IntegrationCard
                name="Slack"
                icon={MessageSquare}
                configured={health.integrations.slack.configured}
                connected={health.integrations.slack.connected}
                workspace={health.integrations.slack.workspace}
                error={health.integrations.slack.lastError}
              />
              <IntegrationCard
                name="Notion"
                icon={FileText}
                configured={health.integrations.notion.configured}
                connected={health.integrations.notion.connected}
              />
              <IntegrationCard
                name="Google Drive"
                icon={FileText}
                configured={health.integrations.googleDrive.configured}
                connected={health.integrations.googleDrive.connected}
              />
              <IntegrationCard
                name="Zoom"
                icon={Video}
                configured={health.integrations.zoom.configured}
              />
              <IntegrationCard
                name="Google Meet"
                icon={Video}
                configured={health.integrations.googleMeet.configured}
              />
            </>
          )}
        </div>
      </div>

      {/* Job Queue and Error Monitoring */}
      <div className="grid gap-6 md:grid-cols-2">
        {health && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Background Processing</h2>
              {health.jobQueue.failed > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retryJobsMutation.mutate()}
                    disabled={retryJobsMutation.isPending}
                    data-testid="button-retry-jobs"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Failed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearJobsMutation.mutate()}
                    disabled={clearJobsMutation.isPending}
                    data-testid="button-clear-jobs"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Failed
                  </Button>
                </div>
              )}
            </div>
            <JobQueueCard stats={health.jobQueue} />
          </div>
        )}

        {/* Error Monitoring */}
        {errorStats && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Error Monitoring</h2>
            <ErrorMonitoringCard 
              stats={errorStats} 
              errors={recentErrors || []}
              onResolve={(id) => resolveErrorMutation.mutate(id)}
            />
          </div>
        )}
      </div>

      {/* Last Updated */}
      {health && (
        <p className="text-sm text-muted-foreground text-center">
          Last updated: {new Date(health.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}
