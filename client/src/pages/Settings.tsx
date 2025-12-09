import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, CreditCard, Users, Zap,
  Loader2, AlertCircle, Calendar, UserPlus, Trash2, Crown, Shield, Mail, RefreshCw, ExternalLink, Lock, Bell
} from "lucide-react";
import { SiGoogledrive, SiNotion, SiZoom, SiGooglemeet } from "react-icons/si";
import { SlackIntegration } from "@/components/SlackIntegration";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member";
  canApprove: boolean;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

function TeamTab({ team }: { team?: { id: string; name: string; seatsLimit?: number } }) {
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");

  const { data: members = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: [`/api/teams/${team?.id}/members`],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${team?.id}/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!team?.id,
  });

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: [`/api/teams/${team?.id}/invitations`],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${team?.id}/invitations`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return res.json();
    },
    enabled: !!team?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      return apiRequest(`/api/teams/${team?.id}/members`, {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team?.id}/invitations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team?.id}/members`] });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      toast({
        title: "Invitation Sent",
        description: "Team member has been invited via email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation.",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest(`/api/teams/${team?.id}/members/${memberId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team?.id}/members`] });
      toast({
        title: "Member Removed",
        description: "Team member has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive",
      });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return apiRequest(`/api/teams/${team?.id}/invitations/${invitationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team?.id}/invitations`] });
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-amber-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-amber-100 text-amber-700">Owner</Badge>;
      case "admin":
        return <Badge className="bg-blue-100 text-blue-700">Admin</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const seatsUsed = members.length;
  const seatsLimit = team?.seatsLimit ?? 5;
  const canInviteMore = seatsLimit === -1 || seatsUsed < seatsLimit;

  return (
    <TabsContent value="team" className="space-y-6 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              Manage who has access to your team's knowledge base
              {seatsLimit !== -1 && (
                <span className="ml-2 text-muted-foreground">
                  ({seatsUsed}/{seatsLimit} seats used)
                </span>
              )}
            </CardDescription>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={!canInviteMore} 
                data-testid="button-invite-member"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new member to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    data-testid="input-invite-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger data-testid="select-invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member - Can view and approve suggestions</SelectItem>
                      <SelectItem value="admin">Admin - Can manage team settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInvite} 
                  disabled={!inviteEmail || inviteMutation.isPending}
                  data-testid="button-send-invite"
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No team members yet. Invite someone to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                  data-testid={`team-member-${member.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.profileImageUrl} />
                      <AvatarFallback>
                        {member.user?.firstName?.[0] || member.user?.email?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.user?.firstName && member.user?.lastName
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.user?.email || "Unknown"}
                        </span>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(member.role)}
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        disabled={removeMemberMutation.isPending}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {invitations.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium mb-3">Pending Invitations</h4>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-muted/50"
                      data-testid={`invitation-${invitation.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Pending</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                          disabled={cancelInvitationMutation.isPending}
                          data-testid={`button-cancel-invitation-${invitation.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!canInviteMore && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Seat Limit Reached</h4>
                <p className="text-sm text-amber-700 mt-1">
                  You've reached your plan's seat limit. Upgrade your plan to add more team members.
                </p>
                <Link href="/pricing">
                  <Button variant="outline" size="sm" className="mt-3" data-testid="button-upgrade-seats">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}

interface IntegrationStatus {
  notion: { connected: boolean; workspaceName?: string; error?: string; lastActivity?: string; status?: string };
  slack: { connected: boolean; socketMode?: boolean; workspaceName?: string; error?: string; lastActivity?: string; status?: string };
  email: { connected: boolean; error?: string };
  google_drive: { connected: boolean; userEmail?: string; error?: string; lastActivity?: string; status?: string };
  zoom: { connected: boolean; lastActivity?: string; status?: string };
  google_meet: { connected: boolean; lastActivity?: string; status?: string };
}

function formatLastActivity(date?: string): string {
  if (!date) return "Never";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

function IntegrationsTab() {
  const { toast } = useToast();
  const { data: status, isLoading, refetch } = useQuery<IntegrationStatus>({
    queryKey: ["/api/integrations/status"],
  });

  const getConnectionStatus = (connected: boolean, lastActivity?: string, error?: string) => {
    if (connected) {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-green-600">Connected</span>
          </div>
          {lastActivity && (
            <span className="text-xs text-muted-foreground">
              Last activity: {formatLastActivity(lastActivity)}
            </span>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="text-sm text-muted-foreground">Not connected</span>
      </div>
    );
  };

  return (
    <TabsContent value="integrations" className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Output Destination</CardTitle>
          <CardDescription>
            Where approved knowledge updates are synced (required)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-foreground/10 flex items-center justify-center">
                <SiNotion className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Notion</p>
                <p className="text-xs text-muted-foreground">
                  Your team's knowledge base destination
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                getConnectionStatus(status?.notion?.connected || false, status?.notion?.lastActivity, status?.notion?.error)
              )}
            </div>
          </div>
          
          {status?.notion?.connected ? (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Notion is connected and ready to receive updates</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1 ml-6">
                When you approve a suggestion, it will be automatically synced to your Notion workspace.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Notion connection required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Connect your Notion workspace to enable syncing approved suggestions to your knowledge base.
                  </p>
                </div>
              </div>
              <div className="ml-7 space-y-2">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  How to connect:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-amber-700 dark:text-amber-400">
                  <li>Open the Replit workspace Tools panel (bottom of screen)</li>
                  <li>Click on "Integrations" or "Connectors"</li>
                  <li>Find and connect "Notion"</li>
                  <li>Authorize access to your Notion workspace</li>
                  <li>Refresh this page to see your connection status</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                  data-testid="button-refresh-notion-status"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card 
        className="relative overflow-visible border-2 border-transparent bg-gradient-to-r from-amber-100/50 via-orange-100/50 to-purple-100/50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-purple-900/20"
        data-testid="card-notion-allowlist-preview"
      >
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-amber-400 via-orange-400 to-purple-400 opacity-20 dark:opacity-10" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-gradient-to-r from-amber-500 to-purple-500 text-white border-0 text-xs">
              Coming Soon
            </Badge>
          </div>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Notion Page Allowlists
          </CardTitle>
          <CardDescription>
            Control exactly which Notion pages and databases Current can update. Protect sensitive documentation by scoping AI updates to approved locations only.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Restrict updates to specific pages or databases</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span>Protect sensitive documentation from unintended changes</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span>Set different confidence thresholds per destination</span>
            </li>
          </ul>
          <Button
            variant="outline"
            className="w-full bg-white/50 dark:bg-slate-900/50 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            onClick={() => {
              toast({
                title: "You're on the list!",
                description: "We'll notify you when Notion Page Allowlists is available.",
              });
            }}
            data-testid="button-notify-allowlist"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </CardContent>
      </Card>

      <SlackIntegration />

      <Card>
        <CardHeader>
          <CardTitle>Other Knowledge Sources</CardTitle>
          <CardDescription>
            Additional integrations coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-md opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[#4285F4]/10 flex items-center justify-center">
                  <SiGoogledrive className="h-5 w-5 text-[#4285F4]" />
                </div>
                <div>
                  <p className="font-medium">Google Drive</p>
                  <p className="text-xs text-muted-foreground">
                    Watch folders for document changes
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </div>

          <div className="p-4 border rounded-md opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[#2D8CFF]/10 flex items-center justify-center">
                  <SiZoom className="h-5 w-5 text-[#2D8CFF]" />
                </div>
                <div>
                  <p className="font-medium">Zoom</p>
                  <p className="text-xs text-muted-foreground">
                    Extract knowledge from meeting transcripts
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </div>

          <div className="p-4 border rounded-md opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[#00897B]/10 flex items-center justify-center">
                  <SiGooglemeet className="h-5 w-5 text-[#00897B]" />
                </div>
                <div>
                  <p className="font-medium">Google Meet</p>
                  <p className="text-xs text-muted-foreground">
                    Process Meet transcripts for insights
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Send team invitations and activity digests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Service</p>
                <p className="text-xs text-muted-foreground">
                  Powered by Resend
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                getConnectionStatus(status?.email?.connected || false, undefined)
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

interface BillingUsageOverviewProps {
  subscriptionData: {
    suggestionsUsed?: number;
    suggestionsLimit?: number;
    seatsUsed?: number;
    seatsLimit?: number;
    sourcesConnected?: number;
    sourcesLimit?: number;
    team?: {
      plan?: string;
      suggestionsUsed?: number;
      suggestionsLimit?: number;
      sourcesLimit?: number;
      seatsLimit?: number;
    };
  } | undefined;
}

function BillingUsageOverview({ subscriptionData }: BillingUsageOverviewProps) {
  const suggestionsUsed = subscriptionData?.suggestionsUsed ?? subscriptionData?.team?.suggestionsUsed ?? 0;
  const suggestionsLimit = subscriptionData?.suggestionsLimit ?? subscriptionData?.team?.suggestionsLimit ?? 20;
  const seatsUsed = subscriptionData?.seatsUsed ?? 1;
  const seatsLimit = subscriptionData?.seatsLimit ?? subscriptionData?.team?.seatsLimit ?? 5;
  const sourcesConnected = subscriptionData?.sourcesConnected ?? 0;
  const sourcesLimit = subscriptionData?.sourcesLimit ?? subscriptionData?.team?.sourcesLimit ?? 1;

  const isUnlimitedSuggestions = suggestionsLimit === -1;
  const isUnlimitedSeats = seatsLimit === -1;
  const isUnlimitedSources = sourcesLimit === -1;

  const suggestionsPercent = isUnlimitedSuggestions ? 0 : Math.min(100, Math.round((suggestionsUsed / suggestionsLimit) * 100));
  const seatsPercent = isUnlimitedSeats ? 0 : Math.min(100, Math.round((seatsUsed / seatsLimit) * 100));
  const sourcesPercent = isUnlimitedSources ? 0 : Math.min(100, Math.round((sourcesConnected / sourcesLimit) * 100));

  const isApproachingLimit = suggestionsPercent >= 80 || seatsPercent >= 80 || sourcesPercent >= 80;
  const isAtLimit = suggestionsPercent >= 100 || seatsPercent >= 100 || sourcesPercent >= 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div 
          className="p-4 border rounded-lg text-center"
          data-testid="meter-suggestions-usage"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${suggestionsPercent >= 100 ? "text-destructive" : suggestionsPercent >= 80 ? "text-amber-500" : "text-primary"}`} />
            <span className="text-sm text-muted-foreground">Suggestions</span>
          </div>
          <p className="text-2xl font-bold">
            {suggestionsUsed}
            <span className="text-sm text-muted-foreground font-normal">
              /{isUnlimitedSuggestions ? "∞" : suggestionsLimit}
            </span>
          </p>
          {!isUnlimitedSuggestions && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${suggestionsPercent >= 100 ? "bg-destructive" : suggestionsPercent >= 80 ? "bg-amber-500" : "bg-primary"}`}
                style={{ width: `${suggestionsPercent}%` }}
              />
            </div>
          )}
        </div>

        <div 
          className="p-4 border rounded-lg text-center"
          data-testid="meter-sources-usage"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className={`w-4 h-4 ${sourcesPercent >= 100 ? "text-destructive" : sourcesPercent >= 80 ? "text-amber-500" : "text-primary"}`} />
            <span className="text-sm text-muted-foreground">Sources</span>
          </div>
          <p className="text-2xl font-bold">
            {sourcesConnected}
            <span className="text-sm text-muted-foreground font-normal">
              /{isUnlimitedSources ? "∞" : sourcesLimit}
            </span>
          </p>
          {!isUnlimitedSources && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${sourcesPercent >= 100 ? "bg-destructive" : sourcesPercent >= 80 ? "bg-amber-500" : "bg-primary"}`}
                style={{ width: `${sourcesPercent}%` }}
              />
            </div>
          )}
        </div>

        <div 
          className="p-4 border rounded-lg text-center"
          data-testid="meter-seats-usage"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className={`w-4 h-4 ${seatsPercent >= 100 ? "text-destructive" : seatsPercent >= 80 ? "text-amber-500" : "text-primary"}`} />
            <span className="text-sm text-muted-foreground">Seats</span>
          </div>
          <p className="text-2xl font-bold">
            {seatsUsed}
            <span className="text-sm text-muted-foreground font-normal">
              /{isUnlimitedSeats ? "∞" : seatsLimit}
            </span>
          </p>
          {!isUnlimitedSeats && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${seatsPercent >= 100 ? "bg-destructive" : seatsPercent >= 80 ? "bg-amber-500" : "bg-primary"}`}
                style={{ width: `${seatsPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {isApproachingLimit && (
        <div 
          className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg"
          data-testid="text-usage-warning"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            {isAtLimit 
              ? "You've reached one or more limits. Upgrade to continue adding resources."
              : "You're approaching your usage limits."}
          </span>
          <Link href="/pricing" className="ml-auto">
            <Button size="sm" data-testid="button-upgrade-plan">
              <Zap className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscription"],
  });

  const [confidenceThreshold, setConfidenceThreshold] = useState([95]);
  const [slackNotificationsEnabled, setSlackNotificationsEnabled] = useState(true);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [adminOnlyApprovals, setAdminOnlyApprovals] = useState(true);

  useEffect(() => {
    if (settings) {
      setConfidenceThreshold([settings.confidenceThreshold || 95]);
      setSlackNotificationsEnabled(settings.slackNotificationsEnabled ?? true);
      setAutoApproveEnabled(settings.autoApproveEnabled ?? false);
      setEmailDigestEnabled(settings.emailDigestEnabled ?? false);
      setAdminOnlyApprovals(settings.adminOnlyApprovals ?? true);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      confidenceThreshold: number;
      slackNotificationsEnabled: boolean;
      autoApproveEnabled: boolean;
      emailDigestEnabled: boolean;
      adminOnlyApprovals: boolean;
    }) => {
      return apiRequest("/api/settings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/billing-portal", { method: "POST" });
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateMutation.mutate({
      confidenceThreshold: confidenceThreshold[0],
      slackNotificationsEnabled,
      autoApproveEnabled,
      emailDigestEnabled,
      adminOnlyApprovals,
    });
  };

  const team = subscriptionData?.team;
  const subscription = subscriptionData?.subscription;

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "trial": return "bg-amber-100 text-amber-700";
      case "starter": return "bg-blue-100 text-blue-700";
      case "growth": return "bg-green-100 text-green-700";
      case "scale": return "bg-purple-100 text-purple-700";
      case "pro_scale": return "bg-indigo-100 text-indigo-700";
      case "enterprise": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case "trial": return "Free Trial";
      case "starter": return "Starter";
      case "growth": return "Growth";
      case "scale": return "Scale";
      case "pro_scale": return "Pro Scale";
      case "enterprise": return "Enterprise";
      default: return plan;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "trialing":
        return <Badge className="bg-amber-100 text-amber-700">Trial</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "past_due":
        return <Badge className="bg-red-100 text-red-700">Past Due</Badge>;
      case "canceled":
        return <Badge className="bg-slate-100 text-slate-700">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (settingsLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your team settings, integrations, and billing
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Settings</CardTitle>
              <CardDescription>
                Configure how AI suggestions are processed and approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Confidence Threshold</Label>
                  <span className="text-sm font-medium">{confidenceThreshold[0]}%</span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={70}
                  max={100}
                  step={5}
                  data-testid="slider-threshold"
                />
                <p className="text-xs text-muted-foreground">
                  Suggestions with confidence above this threshold will be auto-approved (Growth plans and above)
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-approve">Enable auto-approval</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically approve suggestions above the confidence threshold
                  </p>
                </div>
                <Switch
                  id="auto-approve"
                  checked={autoApproveEnabled}
                  onCheckedChange={setAutoApproveEnabled}
                  data-testid="switch-auto-approve"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admin-only">Admin-only approvals</Label>
                  <p className="text-xs text-muted-foreground">
                    Only admins and owners can approve or reject suggestions
                  </p>
                </div>
                <Switch
                  id="admin-only"
                  checked={adminOnlyApprovals}
                  onCheckedChange={setAdminOnlyApprovals}
                  data-testid="switch-admin-only"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Control how you receive updates about knowledge changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="slack-notifications">Slack notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified in Slack when new knowledge updates are detected
                  </p>
                </div>
                <Switch
                  id="slack-notifications"
                  checked={slackNotificationsEnabled}
                  onCheckedChange={setSlackNotificationsEnabled}
                  data-testid="switch-slack-notifications"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-digest">Daily email digest</Label>
                  <p className="text-xs text-muted-foreground">
                    Summary of all activity sent every morning
                  </p>
                </div>
                <Switch 
                  id="email-digest"
                  checked={emailDigestEnabled}
                  onCheckedChange={setEmailDigestEnabled}
                  data-testid="switch-email-digest"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </TabsContent>

        <TeamTab team={team} />

        <IntegrationsTab />

        <TabsContent value="billing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                {team && getStatusBadge(team.status)}
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {team && (
                <>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{getPlanDisplayName(team.plan)}</h3>
                        <Badge className={getPlanBadgeColor(team.plan)}>
                          {team.plan === "trial" ? "14-Day Trial" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {team.name}
                      </p>
                    </div>
                    <Link href="/pricing">
                      <Button variant="outline" data-testid="button-change-plan">
                        {team.plan === "trial" ? "Choose a Plan" : "Change Plan"}
                      </Button>
                    </Link>
                  </div>

                  {team.plan === "trial" && team.trialEndsAt && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Your trial ends on {new Date(team.trialEndsAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <BillingUsageOverview subscriptionData={subscriptionData} />
                </>
              )}
            </CardContent>
          </Card>

          {team && team.plan !== "trial" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing Management
                </CardTitle>
                <CardDescription>
                  Update payment methods, view invoices, and manage your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => billingPortalMutation.mutate()}
                  disabled={billingPortalMutation.isPending}
                  className="w-full sm:w-auto"
                  data-testid="button-billing-portal"
                >
                  {billingPortalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Billing Portal
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Manage your payment methods, view invoices, and update billing details in Stripe's secure portal.
                </p>
              </CardContent>
            </Card>
          )}

          {team && team.plan === "trial" && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Upgrade Your Plan
                </CardTitle>
                <CardDescription>
                  Get more suggestions, integrations, and team seats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button className="w-full sm:w-auto" data-testid="button-upgrade">
                    View Plans & Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
