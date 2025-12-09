import { StatsCard } from "@/components/StatsCard";
import { ApprovalCard } from "@/components/ApprovalCard";
import { ActivityItem } from "@/components/ActivityItem";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { UsageMeters } from "@/components/UsageMeters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, TrendingUp, ArrowRight, Loader2, Zap } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Suggestion, ActivityLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const checkoutStatus = searchParams.get("checkout");
  
  const [diffOpen, setDiffOpen] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<{
    title: string;
    current: string;
    proposed: string;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (checkoutStatus === "success") {
      toast({
        title: "Welcome to Current!",
        description: "Your subscription is now active. Let's get started!",
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [checkoutStatus, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    pending: number;
    approvedToday: number;
    accuracyRate: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions", { status: "pending" }],
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity", { limit: "10" }],
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/subscription"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/suggestions/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ userName: user?.firstName || "User" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Update Approved",
        description: "The knowledge base has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve suggestion",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/suggestions/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ userName: user?.firstName || "User" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Update Rejected",
        description: "The suggestion has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject suggestion",
        variant: "destructive",
      });
    },
  });

  const handleViewDiff = (suggestion: Suggestion) => {
    setSelectedDiff({
      title: suggestion.title,
      current: suggestion.currentContent || "No existing content",
      proposed: suggestion.proposedContent,
    });
    setDiffOpen(true);
  };

  const displaySuggestions = suggestions.slice(0, 2);
  const team = subscriptionData?.team;

  if (statsLoading && suggestionsLoading && activityLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! Monitor knowledge updates and approve suggestions.
          </p>
        </div>
        {team && team.plan === "trial" && (
          <Link href="/pricing">
            <Button size="sm" data-testid="button-upgrade-trial">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        )}
      </div>

      <OnboardingWizard />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Pending Suggestions"
          value={statsLoading ? "..." : stats?.pending || 0}
          icon={FileText}
          description={suggestions.length > 0 ? `${suggestions.length} waiting for review` : "All caught up!"}
        />
        <StatsCard
          title="Approved Today"
          value={statsLoading ? "..." : stats?.approvedToday || 0}
          icon={CheckCircle}
          description="Knowledge updates"
        />
        <StatsCard
          title="Accuracy Rate"
          value={statsLoading ? "..." : `${stats?.accuracyRate || 0}%`}
          icon={TrendingUp}
          description="Last 30 days"
        />
      </div>

      <UsageMeters />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Priority Queue</h2>
          <Link href="/queue">
            <Button variant="outline" size="sm" data-testid="link-view-all-queue">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {suggestionsLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading suggestions...
          </div>
        ) : displaySuggestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground mb-4">
                No pending suggestions. Connect your sources to start detecting knowledge updates.
              </p>
              <Link href="/settings?tab=integrations">
                <Button variant="outline" size="sm">
                  Connect Sources
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displaySuggestions.map((suggestion) => (
              <ApprovalCard
                key={suggestion.id}
                id={suggestion.id}
                source={suggestion.sourceType as any}
                type={suggestion.knowledgeType as any}
                title={suggestion.title}
                proposedContent={suggestion.proposedContent}
                currentContent={suggestion.currentContent || undefined}
                confidence={suggestion.confidence}
                timestamp={formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                sourceLink={suggestion.sourceLink}
                notionPage={suggestion.notionPageUrl}
                onApprove={(id) => approveMutation.mutate(id)}
                onReject={(id) => rejectMutation.mutate(id)}
                onViewDiff={() => handleViewDiff(suggestion)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/activity">
            <Button variant="outline" size="sm" data-testid="link-view-all-activity">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {activityLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading activity...
          </div>
        ) : activity.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No activity yet. Approve some suggestions to see your history here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activity.slice(0, 3).map((item) => (
              <ActivityItem
                key={item.id}
                id={item.id}
                status={item.status as any}
                title={item.title}
                source={item.sourceType as any}
                timestamp={formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                user={item.userName || undefined}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDiff && (
        <DiffViewer
          open={diffOpen}
          onOpenChange={setDiffOpen}
          title={selectedDiff.title}
          currentContent={selectedDiff.current}
          proposedContent={selectedDiff.proposed}
        />
      )}
    </div>
  );
}
