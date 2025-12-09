import { StatsCard } from "../StatsCard";
import { FileText, CheckCircle, TrendingUp } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-8 grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Pending Suggestions"
        value={8}
        icon={FileText}
        description="+3 from yesterday"
      />
      <StatsCard
        title="Approved Today"
        value={12}
        icon={CheckCircle}
        description="92% accuracy rate"
      />
      <StatsCard
        title="Accuracy Rate"
        value="94%"
        icon={TrendingUp}
        description="Last 30 days"
      />
    </div>
  );
}
