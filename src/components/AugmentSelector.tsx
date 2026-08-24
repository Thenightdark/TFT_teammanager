import { CheckCircle2, Gem, Search, Target } from "lucide-react";
import { useMemo, useState } from "react";
import type { Augment } from "../types/Augment";
import type { Comp } from "../types/Comp";

interface AugmentSelectorProps {
  augments: Augment[];
  selectedIds: Set<string>;
  comps: Comp[];
  targetCompId: string;
  onTargetCompChange: (compId: string) => void;
  onToggle: (augment: Augment) => void;
}

const tierOrder = { S: 0, A: 1, B: 2, C: 3 } as const;

export default function AugmentSelector({ augments, selectedIds, comps, targetCompId, onTargetCompChange, onToggle }: AugmentSelectorProps) {
  const [query, setQuery] = useState("");
  const targetComp = comps.find((comp) => comp.id === targetCompId);
  const recommendations = useMemo(() => (targetComp?.recommendedAugments ?? []).flatMap((entry, index) => {
    const augment = augments.find((candidate) => candidate.id === entry.augmentId);
    return augment ? [{ augment, reason: entry.reason, rank: index + 1 }] : [];
  }), [augments, targetComp]);
  const rankById = useMemo(() => new Map(recommendations.map((entry) => [entry.augment.id, entry])), [recommendations]);
  const visible = useMemo(() => augments.filter((augment) => augment.name.toLowerCase().includes(query.trim().toLowerCase())).sort((left, right) => (rankById.get(left.id)?.rank ?? 999) - (rankById.get(right.id)?.rank ?? 999) || left.name.localeCompare(right.name)), [augments, query, rankById]);
  const selectedAssessments = [...selectedIds].flatMap((id) => {
    const augment = augments.find((entry) => entry.id === id);
    if (!augment) return [];
    return [{ augment, recommendation: rankById.get(id) }];
  }).sort((left, right) => (left.recommendation?.rank ?? 999) - (right.recommendation?.rank ?? 999));
  const sortedComps = [...comps].sort((left, right) => (tierOrder[left.tier ?? "C"] - tierOrder[right.tier ?? "C"]) || left.name.localeCompare(right.name));
  return (
    <section className="roster-panel augment-selector" aria-labelledby="augment-selector-heading">
      <div className="roster-title"><div><Gem size={18} /><h2 id="augment-selector-heading">Offered augments</h2><span>{selectedIds.size}/3</span></div></div>
      <p className="special-guide-intro">Choose up to three augments you were offered. Find Comps will reward teams that make especially good use of them.</p>
      <div className="augment-target-picker">
        <Target size={18} />
        <label><span>Team you are going for</span><select value={targetCompId} onChange={(event) => onTargetCompChange(event.target.value)} aria-label="Team you are going for"><option value="">Choose a team composition…</option>{sortedComps.map((comp) => <option key={comp.id} value={comp.id}>{comp.tier ?? "C"} Tier · {comp.name}</option>)}</select></label>
      </div>
      {targetComp ? <div className="augment-adviser">
        <div className="augment-adviser-heading"><div><Target size={16} /><span><strong>Best augments for {targetComp.name}</strong><small>Ordered team-specific suggestions</small></span></div><b>{targetComp.tier ?? "C"} tier team</b></div>
        <div className="augment-adviser-grid">{recommendations.map(({ augment, reason, rank }) => <article key={augment.id}><span>{rank}</span><div><strong>{augment.name}</strong><p>{reason}</p></div>{selectedIds.has(augment.id) && <CheckCircle2 size={17} />}</article>)}</div>
        {!!selectedAssessments.length && <div className="offered-verdicts"><h3>Best of your offers</h3>{selectedAssessments.map(({ augment, recommendation }, index) => <article key={augment.id} className={recommendation ? "recommended" : "situational"}><span>{recommendation && index === 0 ? "BEST PICK" : recommendation ? `TEAM PICK #${recommendation.rank}` : "SITUATIONAL"}</span><div><strong>{augment.name}</strong><p>{recommendation?.reason ?? "This is not one of the comp's main synergies. Consider it only for general combat, economy, or your current board."}</p></div></article>)}</div>}
      </div> : <div className="augment-target-empty"><Target size={18} /><span><strong>Choose a team above for tailored advice</strong><small>You’ll see its top augment options and the best pick from your three offers.</small></span></div>}
      <label className="compact-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search augments…" aria-label="Search augments" /></label>
      <div className="augment-choice-grid">
        {visible.map((augment) => {
          const selected = selectedIds.has(augment.id);
          const recommendation = rankById.get(augment.id);
          return <button key={augment.id} type="button" className={`${selected ? "selected" : ""} ${recommendation ? "team-fit" : ""}`} disabled={!selected && selectedIds.size >= 3} onClick={() => onToggle(augment)}><Gem size={15} /><span><strong>{augment.name}</strong><small>{selected ? "Selected" : recommendation ? `Team pick #${recommendation.rank}` : "Add to offers"}</small></span></button>;
        })}
      </div>
      {!visible.length && <p className="empty-inline">No augments match that search.</p>}
    </section>
  );
}
