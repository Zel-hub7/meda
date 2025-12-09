import { SourceBadge } from "../SourceBadge";

export default function SourceBadgeExample() {
  return (
    <div className="p-8 flex flex-wrap gap-2">
      <SourceBadge source="slack" />
      <SourceBadge source="drive" />
      <SourceBadge source="meeting" />
    </div>
  );
}
