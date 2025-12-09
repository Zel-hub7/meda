import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  Users, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

interface UsageData {
  plan: string;
  suggestionsUsed: number;
  suggestionsLimit: number;
  seatsUsed: number;
  seatsLimit: number;
  sourcesConnected: number;
  sourcesLimit: number;
  trialEndsAt: string | null;
  daysRemaining: number | null;
}

interface UsageMetersProps {
  compact?: boolean;
}

export function UsageMeters({ compact = false }: UsageMetersProps) {
  const { data: usage, isLoading } = useQuery<UsageData>({
    queryKey: ["/api/subscription"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const suggestionsLimit = usage.suggestionsLimit;
  const seatsLimit = usage.seatsLimit;
  const sourcesLimit = usage.sourcesLimit;
  const suggestionsUsed = usage.suggestionsUsed ?? 0;
  const seatsUsed = usage.seatsUsed ?? 0;
  const sourcesConnected = usage.sourcesConnected ?? 0;

  const isUnlimitedSuggestions = suggestionsLimit === -1 || suggestionsLimit === null || suggestionsLimit === undefined;
  const isUnlimitedSeats = seatsLimit === -1 || seatsLimit === null || seatsLimit === undefined;
  const isUnlimitedSources = sourcesLimit === -1 || sourcesLimit === null || sourcesLimit === undefined;

  const suggestionsPercent = isUnlimitedSuggestions || (suggestionsLimit ?? 0) === 0
    ? 0 
    : Math.min(100, Math.round((suggestionsUsed / (suggestionsLimit ?? 1)) * 100));
  
  const seatsPercent = isUnlimitedSeats || (seatsLimit ?? 0) === 0
    ? 0 
    : Math.min(100, Math.round((seatsUsed / (seatsLimit ?? 1)) * 100));
  
  const sourcesPercent = isUnlimitedSources || (sourcesLimit ?? 0) === 0
    ? 0 
    : Math.min(100, Math.round((sourcesConnected / (sourcesLimit ?? 1)) * 100));

  const isApproachingLimit = suggestionsPercent >= 80;
  const isAtLimit = suggestionsPercent >= 100;

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm" data-testid="usage-meters-compact">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 ${isAtLimit ? "text-destructive" : isApproachingLimit ? "text-warning" : "text-muted-foreground"}`}>
              <FileText className="h-4 w-4" />
              <span data-testid="text-suggestions-usage">
                {suggestionsLimit === -1 
                  ? suggestionsUsed.toString() 
                  : `${suggestionsUsed}/${suggestionsLimit}`}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Suggestions used this month</p>
          </TooltipContent>
        </Tooltip>
        
        {isApproachingLimit && (
          <Link href="/pricing">
            <Button size="sm" variant="outline" className="h-7" data-testid="button-upgrade-compact">
              <TrendingUp className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <Card data-testid="card-usage-meters">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Usage</CardTitle>
          <Badge variant="outline">{formatPlanName(usage.plan)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageMeter
          icon={FileText}
          label="Suggestions"
          used={suggestionsUsed}
          limit={suggestionsLimit}
          percent={suggestionsPercent}
          description="AI-generated suggestions this month"
          warning={isApproachingLimit}
          error={isAtLimit}
          testId="meter-suggestions-usage"
        />
        
        <UsageMeter
          icon={Users}
          label="Team Seats"
          used={seatsUsed}
          limit={seatsLimit}
          percent={seatsPercent}
          description="Active team members"
          warning={seatsPercent >= 80}
          error={seatsPercent >= 100}
          testId="meter-seats-usage"
        />
        
        <UsageMeter
          icon={Zap}
          label="Sources"
          used={sourcesConnected}
          limit={sourcesLimit}
          percent={sourcesPercent}
          description="Connected integrations"
          warning={sourcesPercent >= 80}
          error={sourcesPercent >= 100}
          testId="meter-sources-usage"
        />

        {usage.daysRemaining !== null && usage.daysRemaining <= 7 && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              Trial ends in {usage.daysRemaining} day{usage.daysRemaining !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {isApproachingLimit && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg" data-testid="text-usage-warning">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              {isAtLimit 
                ? "You've reached your suggestion limit. Upgrade to continue." 
                : "You're approaching your suggestion limit."}
            </span>
          </div>
        )}

        {(isApproachingLimit || (usage.daysRemaining !== null && usage.daysRemaining <= 7)) && (
          <Link href="/pricing">
            <Button className="w-full" data-testid="button-upgrade-plan">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

interface UsageMeterProps {
  icon: typeof FileText;
  label: string;
  used: number;
  limit: number | null | undefined;
  percent: number;
  description: string;
  warning?: boolean;
  error?: boolean;
  testId?: string;
}

function UsageMeter({ 
  icon: Icon, 
  label, 
  used, 
  limit, 
  percent, 
  description, 
  warning, 
  error,
  testId
}: UsageMeterProps) {
  const isUnlimited = limit === -1 || limit === null || limit === undefined;
  
  return (
    <div className="space-y-2" data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${error ? "text-destructive" : warning ? "text-warning" : "text-muted-foreground"}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {isUnlimited ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{used}</span>
            <Badge variant="outline" className="text-xs">Unlimited</Badge>
          </div>
        ) : (
          <span className={`text-sm ${error ? "text-destructive font-medium" : warning ? "text-warning" : "text-muted-foreground"}`}>
            {used} / {limit}
          </span>
        )}
      </div>
      {!isUnlimited && (
        <Progress 
          value={percent} 
          className={`h-2 ${error ? "[&>div]:bg-destructive" : warning ? "[&>div]:bg-warning" : ""}`}
        />
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function formatPlanName(plan: string): string {
  const names: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    scale: "Scale",
    pro_scale: "Pro Scale",
    enterprise: "Enterprise",
    trial: "Trial",
  };
  return names[plan] || plan;
}
