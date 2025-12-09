import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Slack, CheckCircle, Loader2, ExternalLink, AlertCircle, 
  RefreshCw, Zap, Hash, ChevronDown, ChevronUp, Copy, Check,
  Radio, Circle, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SlackStatus {
  connected: boolean;
  socketMode: boolean;
  workspaceName?: string;
  workspaceId?: string;
  botUserId?: string;
  error?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  isMember: boolean;
}

export function SlackIntegration() {
  const { toast } = useToast();
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [channelsExpanded, setChannelsExpanded] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const { data: status, isLoading, refetch } = useQuery<SlackStatus>({
    queryKey: ["/api/integrations/slack/status"],
    refetchInterval: 30000,
  });

  const { data: channels = [], isLoading: channelsLoading, refetch: refetchChannels } = useQuery<SlackChannel[]>({
    queryKey: ["/api/integrations/slack/channels"],
    enabled: status?.connected === true,
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/integrations/slack/test", { method: "POST" });
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      if (data.success) {
        toast({ title: "Connection Successful", description: data.message });
      } else {
        toast({ title: "Connection Failed", description: data.message, variant: "destructive" });
      }
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Test Failed", description: error.message, variant: "destructive" });
    },
  });

  const connectSocketModeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/integrations/slack/connect", { method: "POST" });
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      if (data.success) {
        toast({ title: "Socket Mode Connected", description: "Now listening for messages in real-time" });
      } else {
        toast({ title: "Connection Failed", description: data.message, variant: "destructive" });
      }
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    },
  });

  const joinChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return apiRequest(`/api/integrations/slack/channels/${channelId}/join`, { method: "POST" });
    },
    onSuccess: () => {
      toast({ title: "Channel Joined", description: "The bot has joined the channel and will monitor it for knowledge" });
      refetchChannels();
    },
    onError: (error: any) => {
      toast({ title: "Failed to Join", description: error.message, variant: "destructive" });
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/integrations/slack/simulate", { method: "POST" });
    },
    onSuccess: (data: { success: boolean; message: string }) => {
      if (data.success) {
        toast({ title: "Demo Message Processed", description: data.message });
        queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      } else {
        toast({ title: "Simulation Failed", description: data.message, variant: "destructive" });
      }
    },
    onError: (error: any) => {
      toast({ title: "Simulation Failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy to clipboard", variant: "destructive" });
    }
  };

  const requiredScopes = [
    { scope: "channels:history", description: "Read messages in public channels" },
    { scope: "channels:read", description: "List channels and their info" },
    { scope: "chat:write", description: "Send notifications to channels" },
    { scope: "users:read", description: "Get user profile information" },
    { scope: "groups:history", description: "Read messages in private channels" },
    { scope: "groups:read", description: "List private channels" },
  ];

  const monitoredChannels = channels.filter(c => c.isMember);
  const availableChannels = channels.filter(c => !c.isMember);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-[#4A154B]/10 flex items-center justify-center">
              <Slack className="h-5 w-5 text-[#4A154B]" />
            </div>
            <div>
              <CardTitle className="text-lg">Slack Integration</CardTitle>
              <CardDescription>Monitor channels for knowledge updates</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status?.connected ? (
              <div className="flex items-center gap-2">
                {status.socketMode ? (
                  <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    Live
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Circle className="w-3 h-3" />
                    API Only
                  </Badge>
                )}
              </div>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.connected ? (
          <>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Connected to <strong>{status.workspaceName || "Slack"}</strong>
                  {status.socketMode && " with real-time monitoring"}
                </span>
              </div>
              {!status.socketMode && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-1 ml-6">
                  API is connected but Socket Mode is not active. Click "Start Listening" to enable real-time message processing.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isPending}
                data-testid="button-test-slack"
              >
                {testConnectionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>

              {!status.socketMode && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => connectSocketModeMutation.mutate()}
                  disabled={connectSocketModeMutation.isPending}
                  data-testid="button-connect-socket"
                >
                  {connectSocketModeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4 mr-2" />
                  )}
                  Start Listening
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateMutation.mutate()}
                disabled={simulateMutation.isPending}
                data-testid="button-simulate-slack"
              >
                {simulateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Send Demo Message
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { refetch(); refetchChannels(); }}
                data-testid="button-refresh-slack"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <Separator />

            <Collapsible open={channelsExpanded} onOpenChange={setChannelsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between" data-testid="button-toggle-channels">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>Channel Monitoring</span>
                    <Badge variant="secondary" className="ml-2">
                      {monitoredChannels.length} monitored
                    </Badge>
                  </div>
                  {channelsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                {channelsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {monitoredChannels.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Currently Monitoring</p>
                        <div className="grid gap-2">
                          {monitoredChannels.map((channel) => (
                            <div
                              key={channel.id}
                              className="flex items-center justify-between p-2 border rounded-md bg-green-50/50 dark:bg-green-950/20"
                              data-testid={`channel-monitored-${channel.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">{channel.name}</span>
                              </div>
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {availableChannels.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Available Channels</p>
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                          {availableChannels.slice(0, 10).map((channel) => (
                            <div
                              key={channel.id}
                              className="flex items-center justify-between p-2 border rounded-md"
                              data-testid={`channel-available-${channel.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{channel.name}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => joinChannelMutation.mutate(channel.id)}
                                disabled={joinChannelMutation.isPending}
                                data-testid={`button-join-${channel.id}`}
                              >
                                Join
                              </Button>
                            </div>
                          ))}
                          {availableChannels.length > 10 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              And {availableChannels.length - 10} more channels...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {channels.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No channels found. Make sure the bot has access to channels in your Slack workspace.
                      </p>
                    )}
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Slack Integration Required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Connect your Slack workspace to automatically detect knowledge from team conversations.
                  </p>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="setup">
                <AccordionTrigger className="text-sm font-medium" data-testid="accordion-setup-guide">
                  Step-by-Step Setup Guide
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 border rounded-md">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        1
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Create a Slack App</p>
                        <p className="text-xs text-muted-foreground">
                          Go to the Slack API dashboard and create a new app for your workspace.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://api.slack.com/apps?new_app=1", "_blank")}
                          data-testid="button-create-slack-app"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Create Slack App
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 border rounded-md">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        2
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Enable Socket Mode</p>
                        <p className="text-xs text-muted-foreground">
                          In your app settings, go to "Socket Mode" and enable it. Generate an App-Level Token with <code className="bg-muted px-1 rounded">connections:write</code> scope.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 border rounded-md">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        3
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Add Bot Token Scopes</p>
                        <p className="text-xs text-muted-foreground">
                          Go to "OAuth & Permissions" and add these Bot Token Scopes:
                        </p>
                        <div className="grid gap-1">
                          {requiredScopes.map((item) => (
                            <div
                              key={item.scope}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <code className="font-mono">{item.scope}</code>
                                <span className="text-muted-foreground">- {item.description}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(item.scope, item.scope)}
                              >
                                {copiedItem === item.scope ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 border rounded-md">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        4
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Subscribe to Events</p>
                        <p className="text-xs text-muted-foreground">
                          Go to "Event Subscriptions", enable events, and subscribe to these bot events:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {["message.channels", "message.groups", "app_mention"].map((event) => (
                            <Badge key={event} variant="secondary" className="font-mono text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 border rounded-md">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        5
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Install App to Workspace</p>
                        <p className="text-xs text-muted-foreground">
                          Go to "Install App" and install it to your workspace. Copy the Bot User OAuth Token.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 border rounded-md bg-primary/5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        6
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Add Tokens to Replit Secrets</p>
                        <p className="text-xs text-muted-foreground">
                          In your Replit project, go to the Secrets tab and add:
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 p-2 bg-background rounded border">
                            <code className="text-xs font-mono flex-1">SLACK_BOT_TOKEN</code>
                            <span className="text-xs text-muted-foreground">= xoxb-...</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-background rounded border">
                            <code className="text-xs font-mono flex-1">SLACK_APP_TOKEN</code>
                            <span className="text-xs text-muted-foreground">= xapp-...</span>
                          </div>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          After adding the tokens, restart the application for changes to take effect.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isPending}
                data-testid="button-test-slack"
              >
                {testConnectionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                data-testid="button-refresh-slack-status"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => simulateMutation.mutate()}
                disabled={simulateMutation.isPending}
                data-testid="button-simulate-slack"
              >
                {simulateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                Try Demo Mode
              </Button>
            </div>

            {status?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Error:</strong> {status.error}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
