import { useState } from "react";
import { DiffViewer } from "../DiffViewer";
import { Button } from "@/components/ui/button";

export default function DiffViewerExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)} data-testid="button-open-diff">
        Open Diff Viewer
      </Button>
      <DiffViewer
        open={open}
        onOpenChange={setOpen}
        title="Remote Work Policy"
        currentContent={`Our remote work policy allows team members to work from home on Tuesdays and Thursdays.

Please coordinate with your manager before working remotely.

All remote workers must be available on Slack during core hours (10 AM - 3 PM EST).`}
        proposedContent={`Our remote work policy has been updated to allow full-time remote work for all team members.

Team members should attend Monday standup meetings via Zoom at 10 AM EST.

All remote workers must be available on Slack during core hours (9 AM - 5 PM EST).

Please update your calendar to reflect your working location.`}
      />
    </div>
  );
}
