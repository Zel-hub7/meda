import { ConfidenceScore } from "../ConfidenceScore";

export default function ConfidenceScoreExample() {
  return (
    <div className="p-8 space-y-6 max-w-md">
      <ConfidenceScore score={92} showDetails />
      <ConfidenceScore score={78} showDetails />
      <ConfidenceScore score={65} showDetails />
    </div>
  );
}
