import { CheckCircle, XCircle, RefreshCw, FileText } from "lucide-react";
import { SourceBadge, type SourceType } from "./SourceBadge";
import { Badge } from "@/components/ui/badge";

export type ActivityStatus = "approved" | "rejected" | "updated" | "detected";

interface ActivityItemProps {
  id: string;
  status: ActivityStatus;
  title: string;
  source: SourceType;
  timestamp: string;
  user?: string;
}

const statusConfig: Record<
  ActivityStatus,
  { icon: typeof CheckCircle; label: string; className: string }
> = {
  approved: {
    icon: CheckCircle,
    label: "Approved",
    className: "text-status-online",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "text-status-busy",
  },
  updated: {
    icon: RefreshCw,
    label: "Updated",
    className: "text-primary",
  },
  detected: {
    icon: FileText,
    label: "Detected",
    className: "text-muted-foreground",
  },
};

export function ActivityItem({
  id,
  status,
  title,
  source,
  timestamp,
  user,
}: ActivityItemProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className="flex gap-3 p-3 hover-elevate rounded-md border"
      data-testid={`activity-item-${id}`}
    >
      <div className="flex-shrink-0 mt-1">
        <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center border">
          <Icon className={`h-4 w-4 ${config.className}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
          <p className="text-sm font-medium">{title}</p>
          <Badge variant="outline" className="text-xs">
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={source} />
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {user && (
            <span className="text-xs text-muted-foreground">by {user}</span>
          )}
        </div>
      </div>
    </div>
  );
}
