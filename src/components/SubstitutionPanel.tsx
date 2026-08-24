import { Replace } from "lucide-react";
import type { UnitSubstitution } from "../utils/strategyPlanner";

interface SubstitutionPanelProps { substitutions: UnitSubstitution[]; }

export default function SubstitutionPanel({ substitutions }: SubstitutionPanelProps) {
  if (!substitutions.length) return null;
  return <section className="detail-panel substitution-panel"><div className="detail-section-title"><Replace size={17} /><h2>Flexible replacements</h2><span>Until you hit</span></div><div>{substitutions.map(({ missing, alternatives }) => <article key={missing.id}><span>Missing <strong>{missing.name}</strong></span><b>→</b><span>Try {alternatives.map((unit) => unit.name).join(" or ")}</span><small>Matched by role, shared traits, and cost.</small></article>)}</div></section>;
}
