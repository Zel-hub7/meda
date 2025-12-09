import { ApprovalCard } from "../ApprovalCard";

export default function ApprovalCardExample() {
  const handleApprove = (id: string) => {
    console.log("Approved:", id);
  };

  const handleReject = (id: string) => {
    console.log("Rejected:", id);
  };

  const handleViewDiff = (id: string) => {
    console.log("View diff:", id);
  };

  return (
    <div className="p-8 max-w-3xl">
      <ApprovalCard
        id="1"
        source="slack"
        type="policy"
        title="Update to Remote Work Policy"
        proposedContent="Effective immediately, all team members are required to attend Monday standup meetings via Zoom at 10 AM EST. This replaces the previous async Slack update requirement. Attendance is mandatory unless you have a scheduling conflict approved by your manager."
        currentContent="Team members should post async updates in #standup every Monday by 12 PM EST."
        confidence={92}
        timestamp="2 hours ago"
        sourceLink="https://slack.com/archives/example"
        notionPage="https://notion.so/remote-policy"
        onApprove={handleApprove}
        onReject={handleReject}
        onViewDiff={handleViewDiff}
      />
    </div>
  );
}
