import { KnowledgeTypeTag } from "../KnowledgeTypeTag";

export default function KnowledgeTypeTagExample() {
  return (
    <div className="p-8 flex flex-wrap gap-2">
      <KnowledgeTypeTag type="policy" />
      <KnowledgeTypeTag type="sop" />
      <KnowledgeTypeTag type="decision" />
      <KnowledgeTypeTag type="fact" />
      <KnowledgeTypeTag type="process" />
      <KnowledgeTypeTag type="engineering" />
      <KnowledgeTypeTag type="product" />
    </div>
  );
}
