import { Gem } from "lucide-react";
import type { Augment } from "../types/Augment";
import type { Comp } from "../types/Comp";

interface AugmentRecommendationsProps {
  comp: Comp;
  augments: Augment[];
  selectedIds?: string[];
}

export default function AugmentRecommendations({ comp, augments, selectedIds = [] }: AugmentRecommendationsProps) {
  const augmentById = new Map(augments.map((augment) => [augment.id, augment]));
  const suggestions = (comp.recommendedAugments ?? []).flatMap((entry) => {
    const augment = augmentById.get(entry.augmentId);
    return augment ? [{ ...entry, augment }] : [];
  });
  if (!suggestions.length) return null;
  const recommendedById = new Map(suggestions.map((entry) => [entry.augment.id, entry]));
  const assessments = selectedIds.flatMap((id) => {
    const augment = augmentById.get(id);
    if (!augment) return [];
    const fit = recommendedById.get(id);
    return [{ augment, rank: fit ? suggestions.findIndex((entry) => entry.augment.id === id) + 1 : undefined, reason: fit?.reason ?? "No direct trait or carry-role match for this comp. Take it only if its general economy or combat value helps your current board." }];
  }).sort((left, right) => (left.rank ?? 999) - (right.rank ?? 999));
  return (
    <section className="detail-panel augment-panel">
      <div className="detail-section-title"><Gem size={17} /><h2>Best augment fits</h2><span>Top {suggestions.length}</span></div>
      <p className="augment-disclaimer">Trait and role matches for this composition—not live placement-rate rankings.</p>
      <div className="augment-suggestion-grid">{suggestions.map(({ augment, reason }, index) => <article key={augment.id}><span>{index + 1}</span><div><strong>{augment.name}</strong><p>{reason}</p></div></article>)}</div>
      {!!assessments.length && <div className="augment-assessments"><h3>Your offered augments</h3>{assessments.map(({ augment, rank, reason }, index) => <article key={augment.id} className={rank ? "good" : "situational"}><div><strong>{augment.name}</strong><b>{rank ? (index === 0 ? "Best offered" : `Team pick #${rank}`) : "Situational"}</b></div>{augment.description && <p>{augment.description}</p>}<small>{reason}</small></article>)}</div>}
    </section>
  );
}
