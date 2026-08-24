import { Scale, X } from "lucide-react";
import type { Champion } from "../types/Champion";
import type { Recommendation } from "../utils/recommendationEngine";

interface CompComparisonProps { recommendations: Recommendation[]; champions: Champion[]; onRemove: (id: string) => void; }

export default function CompComparison({ recommendations, champions, onRemove }: CompComparisonProps) {
  if (!recommendations.length) return null;
  const name = (id: string) => champions.find((champion) => champion.id === id)?.name ?? id;
  return <section className="comparison-panel" aria-labelledby="comparison-title"><div className="detail-section-title"><Scale size={17} /><h2 id="comparison-title">Compare comps</h2><span>{recommendations.length}/2 selected</span></div><div className="comparison-grid">{recommendations.map((recommendation) => <article key={recommendation.comp.id}><button type="button" aria-label={`Remove ${recommendation.comp.name} from comparison`} onClick={() => onRemove(recommendation.comp.id)}><X size={14} /></button><small>{recommendation.comp.tier ?? "—"} tier</small><h3>{recommendation.comp.name}</h3><strong>{recommendation.compatibility}%</strong><dl><div><dt>Owned</dt><dd>{recommendation.ownedUnits.length}/{recommendation.comp.units.length}</dd></div><div><dt>Core matched</dt><dd>{recommendation.matchedCoreUnits.length}/{recommendation.comp.coreUnits.length}</dd></div><div><dt>Missing</dt><dd>{recommendation.missingUnits.length}</dd></div><div><dt>Item value</dt><dd>+{recommendation.scoreBreakdown.itemPoints}</dd></div><div><dt>Augment value</dt><dd>+{recommendation.scoreBreakdown.augmentPoints}</dd></div></dl><p>Carry: {recommendation.comp.carries.map(name).join(" · ")}</p></article>)}</div>{recommendations.length === 1 && <p className="compare-hint">Select Compare on one more result to see it side by side.</p>}</section>;
}
