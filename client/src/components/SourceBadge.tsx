import { Badge } from "@/components/ui/badge";
import { Slack, FileText } from "lucide-react";
import { SiGoogledrive } from "react-icons/si";

export type SourceType = "slack" | "drive" | "meeting";

interface SourceBadgeProps {
  source: SourceType;
  label?: string;
}

export function SourceBadge({ source, label }: SourceBadgeProps) {
  const config = {
    slack: { icon: Slack, label: label || "Slack", className: "bg-[#4A154B]/10 text-[#4A154B] border-[#4A154B]/20" },
    drive: { icon: SiGoogledrive, label: label || "Google Drive", className: "bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20" },
    meeting: { icon: FileText, label: label || "Meeting", className: "bg-primary/10 text-primary border-primary/20" },
  };

  const { icon: Icon, label: displayLabel, className } = config[source];

  return (
    <Badge
      variant="outline"
      className={`${className} text-xs font-medium border gap-1`}
      data-testid={`badge-source-${source}`}
    >
      <Icon className="h-3 w-3" />
      {displayLabel}
    </Badge>
  );
}
