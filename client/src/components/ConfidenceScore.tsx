import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ConfidenceScoreProps {
  score: number;
  showDetails?: boolean;
}

export function ConfidenceScore({ score, showDetails = false }: ConfidenceScoreProps) {
  const getScoreColor = (score: number) => {
    if (score < 70) return "text-status-away";
    if (score < 85) return "text-foreground";
    return "text-status-online";
  };

  const getScoreLabel = (score: number) => {
    if (score < 70) return "Low confidence";
    if (score < 85) return "Medium confidence";
    return "High confidence";
  };

  return (
    <div className="space-y-1" data-testid="component-confidence-score">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Confidence</span>
          {showDetails && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  Score based on: source reliability, content clarity, dual-model agreement, and context relevance.
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <Progress value={score} className="h-2" />
      {showDetails && (
        <p className="text-xs text-muted-foreground">{getScoreLabel(score)}</p>
      )}
    </div>
  );
}
