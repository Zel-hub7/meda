import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X, ExternalLink, Eye, Clock, Lightbulb, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { KnowledgeTypeTag, type KnowledgeType } from "./KnowledgeTypeTag";
import { SourceBadge, type SourceType } from "./SourceBadge";
import { ConfidenceScore } from "./ConfidenceScore";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface ApprovalCardProps {
  id: string;
  source: SourceType;
  type: KnowledgeType;
  title: string;
  proposedContent: string;
  currentContent?: string;
  confidence: number;
  timestamp: string;
  sourceLink: string;
  notionPage: string;
  aiReasoning?: string;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewDiff?: (id: string) => void;
  onChangeNotionPage?: (id: string) => void;
}

export function ApprovalCard({
  id,
  source,
  type,
  title,
  proposedContent,
  currentContent,
  confidence,
  timestamp,
  sourceLink,
  notionPage,
  aiReasoning,
  isSelected = false,
  onSelect,
  onApprove,
  onReject,
  onViewDiff,
  onChangeNotionPage,
}: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  return (
    <Card
      className={`border-l-4 border-l-primary hover-elevate ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      data-testid={`card-approval-${id}`}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(id, checked === true)}
                data-testid={`checkbox-suggestion-${id}`}
                className="mr-1"
              />
            )}
            <SourceBadge source={source} />
            <KnowledgeTypeTag type={type} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timestamp}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <div className="bg-accent/50 p-3 rounded-md">
            <p className="text-sm text-foreground">
              {isExpanded
                ? proposedContent
                : proposedContent.length > 200
                ? proposedContent.slice(0, 200) + "..."
                : proposedContent}
            </p>
            {proposedContent.length > 200 && (
              <button
                className="text-sm text-primary hover:underline mt-2"
                onClick={() => setIsExpanded(!isExpanded)}
                data-testid={`button-expand-${id}`}
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        <ConfidenceScore score={confidence} showDetails />

        {aiReasoning && (
          <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                data-testid={`button-reasoning-toggle-${id}`}
              >
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="font-medium">AI Reasoning</span>
                {isReasoningOpen ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div 
                className="space-y-3"
                data-testid={`text-reasoning-${id}`}
              >
                {aiReasoning.includes("Extraction:") && aiReasoning.includes("Validation:") ? (
                  <>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Extraction (Claude Sonnet)</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiReasoning.split("Validation:")[0].replace("Extraction:", "").trim()}
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Validation (Claude Opus)</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiReasoning.split("Validation:")[1]?.trim() || ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiReasoning}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex items-center gap-4 flex-wrap text-xs">
          <a
            href={sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
            data-testid={`link-source-${id}`}
          >
            <ExternalLink className="h-3 w-3" />
            View source
          </a>
          <div className="flex items-center gap-2">
            <a
              href={notionPage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
              data-testid={`link-notion-${id}`}
            >
              <ExternalLink className="h-3 w-3" />
              Notion page
            </a>
            {onChangeNotionPage && (
              <button
                onClick={() => onChangeNotionPage(id)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`button-change-notion-${id}`}
              >
                <RefreshCw className="h-3 w-3" />
                Change
              </button>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        <Button
          onClick={() => onViewDiff?.(id)}
          variant="outline"
          size="sm"
          className="gap-1"
          data-testid={`button-view-diff-${id}`}
        >
          <Eye className="h-4 w-4" />
          View Diff
        </Button>
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={() => onReject?.(id)}
            variant="secondary"
            size="sm"
            className="gap-1"
            data-testid={`button-reject-${id}`}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => onApprove?.(id)}
            size="sm"
            className="gap-1"
            data-testid={`button-approve-${id}`}
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
