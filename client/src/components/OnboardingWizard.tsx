import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ChevronRight, 
  Slack, 
  FileText, 
  Zap, 
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { SiNotion, SiGoogledrive, SiZoom, SiGooglemeet } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface OnboardingStatus {
  completed: boolean;
  steps: {
    notion: boolean;
    source: boolean;
    firstSuggestion: boolean;
  };
  connectedSources: string[];
}

interface OnboardingWizardProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function OnboardingWizard({ onComplete, onDismiss }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const { data: status, isLoading } = useQuery<OnboardingStatus>({
    queryKey: ["/api/onboarding/status"],
  });

  const { data: integrationStatus } = useQuery<{
    notion: { connected: boolean };
    slack: { connected: boolean };
    google_drive: { connected: boolean };
    zoom: { connected: boolean };
    google_meet: { connected: boolean };
  }>({
    queryKey: ["/api/integrations/status"],
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/integrations/slack/simulate", { method: "POST" });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Demo Suggestion Created!",
          description: "Check your approval queue to see how it works.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/onboarding/status"] });
        queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        setCurrentStep(3);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Demo Failed",
        description: error.message || "Failed to create demo suggestion",
        variant: "destructive",
      });
    },
  });

  const completedSteps = status ? 
    (status.steps.notion ? 1 : 0) + 
    (status.steps.source ? 1 : 0) + 
    (status.steps.firstSuggestion ? 1 : 0) : 0;
  
  const progress = (completedSteps / 3) * 100;

  const steps = [
    {
      id: "welcome",
      title: "Welcome to Current",
      description: "Let's set up your AI-powered knowledge base in 3 easy steps",
      icon: Sparkles,
    },
    {
      id: "notion",
      title: "Connect Your Knowledge Base",
      description: "Link Notion so Current can suggest updates to your docs",
      icon: SiNotion,
      completed: status?.steps.notion,
    },
    {
      id: "source",
      title: "Connect a Source",
      description: "Choose where Current should monitor for new knowledge",
      icon: Zap,
      completed: status?.steps.source,
    },
    {
      id: "demo",
      title: "See It In Action",
      description: "Generate a demo suggestion to understand the workflow",
      icon: FileText,
      completed: status?.steps.firstSuggestion,
    },
  ];

  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (status?.completed) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden" data-testid="card-onboarding">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Get Started with <em>Current</em></CardTitle>
              <CardDescription>Complete these steps to start automating your knowledge base</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {completedSteps}/3 Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {currentStep === 0 ? (
          <div className="space-y-6">
            <div className="grid gap-3">
              {steps.slice(1).map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    step.completed 
                      ? "bg-status-online/5 border-status-online/20" 
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step.completed ? "bg-status-online text-white" : "bg-muted"
                  }`}>
                    {step.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? "text-status-online" : ""}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.completed && (
                    <Badge variant="outline" className="text-status-online border-status-online/30">
                      Done
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentStep(status?.steps.notion ? (status?.steps.source ? 3 : 2) : 1)}
                className="flex-1"
                data-testid="button-start-onboarding"
              >
                {completedSteps === 0 ? "Get Started" : "Continue Setup"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {onDismiss && (
                <Button variant="ghost" onClick={onDismiss} data-testid="button-dismiss-onboarding">
                  I'll do this later
                </Button>
              )}
            </div>
          </div>
        ) : currentStep === 1 ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <SiNotion className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold">Connect Notion</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                <em>Current</em> needs access to your Notion workspace to suggest updates to your knowledge base pages.
              </p>
            </div>
            
            {integrationStatus?.notion.connected ? (
              <div className="p-4 bg-status-online/10 border border-status-online/20 rounded-lg text-center">
                <Check className="h-6 w-6 text-status-online mx-auto mb-2" />
                <p className="font-medium text-status-online">Notion Connected!</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setCurrentStep(2)}
                  data-testid="button-notion-next"
                >
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Click the button below to connect Notion. You'll be redirected to authorize access.
                  </p>
                </div>
                <Link href="/settings?tab=integrations">
                  <Button className="w-full" data-testid="button-connect-notion">
                    <SiNotion className="mr-2 h-4 w-4" />
                    Connect Notion
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
            
            <Button variant="ghost" onClick={() => setCurrentStep(0)} className="w-full">
              Back to Overview
            </Button>
          </div>
        ) : currentStep === 2 ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Connect a Knowledge Source</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Choose where <em>Current</em> should monitor for new knowledge to add to your docs.
              </p>
            </div>
            
            <div className="grid gap-3">
              <SourceOption
                name="Slack"
                description="Monitor channels for decisions and announcements"
                icon={<Slack className="h-5 w-5" />}
                connected={integrationStatus?.slack.connected}
                recommended
              />
              <SourceOption
                name="Google Drive"
                description="Watch for document changes and new content"
                icon={<SiGoogledrive className="h-5 w-5" />}
                connected={integrationStatus?.google_drive.connected}
              />
              <SourceOption
                name="Zoom"
                description="Extract knowledge from meeting recordings"
                icon={<SiZoom className="h-5 w-5" />}
                connected={integrationStatus?.zoom.connected}
              />
              <SourceOption
                name="Google Meet"
                description="Process meeting transcripts automatically"
                icon={<SiGooglemeet className="h-5 w-5" />}
                connected={integrationStatus?.google_meet.connected}
              />
            </div>
            
            {(integrationStatus?.slack.connected || integrationStatus?.google_drive.connected) && (
              <Button 
                className="w-full" 
                onClick={() => setCurrentStep(3)}
                data-testid="button-source-next"
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            
            <Button variant="ghost" onClick={() => setCurrentStep(0)} className="w-full">
              Back to Overview
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">See How It Works</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate a demo suggestion to see how <em>Current</em> extracts and validates knowledge.
              </p>
            </div>
            
            {status?.steps.firstSuggestion ? (
              <div className="p-4 bg-status-online/10 border border-status-online/20 rounded-lg text-center">
                <Check className="h-6 w-6 text-status-online mx-auto mb-2" />
                <p className="font-medium text-status-online">Setup Complete!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're ready to start using <em>Current</em>
                </p>
                <Link href="/queue">
                  <Button className="mt-4" data-testid="button-go-to-queue">
                    View Approval Queue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <p className="text-sm font-medium">What happens when you click "Generate Demo":</p>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">1.</span>
                      A simulated Slack message is processed
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">2.</span>
                      AI extracts actionable knowledge from the message
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">3.</span>
                      A second AI validates the extraction
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium text-foreground">4.</span>
                      A suggestion appears in your approval queue
                    </li>
                  </ol>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => simulateMutation.mutate()}
                  disabled={simulateMutation.isPending}
                  data-testid="button-generate-demo"
                >
                  {simulateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Demo Suggestion
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <Button variant="ghost" onClick={() => setCurrentStep(0)} className="w-full">
              Back to Overview
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SourceOption({ 
  name, 
  description, 
  icon, 
  connected, 
  recommended 
}: { 
  name: string; 
  description: string; 
  icon: React.ReactNode; 
  connected?: boolean;
  recommended?: boolean;
}) {
  return (
    <Link href="/settings?tab=integrations">
      <div className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover-elevate ${
        connected 
          ? "bg-status-online/5 border-status-online/20" 
          : "bg-background border-border hover:border-primary/30"
      }`}>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          connected ? "bg-status-online/10 text-status-online" : "bg-muted"
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{name}</p>
            {recommended && !connected && (
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {connected ? (
          <Badge variant="outline" className="text-status-online border-status-online/30">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </Link>
  );
}
