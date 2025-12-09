import { ActivityItem } from "../ActivityItem";

export default function ActivityItemExample() {
  return (
    <div className="p-8 max-w-2xl space-y-2">
      <ActivityItem
        id="1"
        status="approved"
        title="Remote Work Policy updated"
        source="slack"
        timestamp="2 hours ago"
        user="John Doe"
      />
      <ActivityItem
        id="2"
        status="rejected"
        title="Billing process change"
        source="drive"
        timestamp="5 hours ago"
        user="Jane Smith"
      />
      <ActivityItem
        id="3"
        status="updated"
        title="API endpoint documentation"
        source="meeting"
        timestamp="1 day ago"
        user="System"
      />
    </div>
  );
}
