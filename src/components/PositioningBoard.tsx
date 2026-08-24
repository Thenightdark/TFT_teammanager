import { Grid3X3, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import type { Champion } from "../types/Champion";
import type { Comp } from "../types/Comp";
import type { TFTItem } from "../types/Item";
import type { Trait } from "../types/Trait";
import { createPositioningPlans } from "../utils/positioning";
import { createBoardSummons } from "../utils/boardSummons";
import { getThreeStarTargetIds } from "../utils/strategyPlanner";

interface PositioningBoardProps {
  comp: Comp;
  champions: Champion[];
  traits: Trait[];
  items: TFTItem[];
}

export default function PositioningBoard({ comp, champions, traits, items }: PositioningBoardProps) {
  const plans = useMemo(() => createPositioningPlans(comp, champions), [champions, comp]);
  const [activePlanId, setActivePlanId] = useState(plans[0]?.id ?? "early");
  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? plans[0];
  const positionMap = new Map(activePlan?.units.map((unit) => [`${unit.row}-${unit.column}`, unit]));
  const summonMap = new Map(createBoardSummons(activePlan?.units ?? []).map((summon) => [`${summon.position[0]}-${summon.position[1]}`, summon]));
  const traitByName = useMemo(() => new Map(traits.map((trait) => [trait.name, trait])), [traits]);
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const threeStarTargetIds = useMemo(() => getThreeStarTargetIds(comp, champions), [comp, champions]);
  const itemsByChampion = useMemo(() => new Map(comp.recommendedItems.map((group) => [group.champion, group.items.flatMap((id) => itemById.get(id) ?? []).slice(0, 3)])), [comp.recommendedItems, itemById]);
  const activeTraits = useMemo(() => {
    const counts = new Map<string, number>();
    for (const unit of activePlan?.units ?? []) {
      for (const trait of unit.champion.traits) counts.set(trait, (counts.get(trait) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || Number(comp.traits.includes(b[0])) - Number(comp.traits.includes(a[0])) || a[0].localeCompare(b[0]));
  }, [activePlan, comp.traits]);

  return (
    <section className="detail-panel positioning-panel">
      <div className="detail-section-title"><Grid3X3 size={17} /><h2>Positioning plans</h2><span>Default setup</span></div>
      <div className="position-plan-tabs" role="tablist" aria-label="Positioning stage">
        {plans.map((plan) => <button type="button" role="tab" aria-selected={plan.id === activePlan?.id} className={plan.id === activePlan?.id ? "active" : ""} key={plan.id} onClick={() => setActivePlanId(plan.id)}><strong>{plan.label}</strong><small>{plan.stage}</small></button>)}
      </div>
      {activePlan && <>
        <p className="position-note">{activePlan.note}</p>
        <div className="position-board-layout">
          <div className="position-board-column">
            <div className="board-label enemy">Enemy side</div>
            <div className="position-board" aria-label={`${activePlan.stage} board`}>
              {Array.from({ length: 4 }, (_, row) => Array.from({ length: 7 }, (_, column) => {
                const unit = positionMap.get(`${row}-${column}`);
                const summon = summonMap.get(`${row}-${column}`);
                const assignedItems = unit ? itemsByChampion.get(unit.champion.id) ?? [] : [];
                return <div style={{ gridColumnStart: column * 2 + (row % 2) + 1, gridRowStart: row + 1 }} className={`hex-cell row-${row}${unit ? " occupied" : ""}${summon ? ` summoned ${summon.kind}` : ""}`} key={`${row}-${column}`}>{unit && <span title={unit.champion.name}>{assignedItems.length > 0 && <span className="board-item-row" aria-label={`${unit.champion.name} recommended items`}>{assignedItems.map((item, index) => <img key={`${item.id}-${index}`} src={item.image} title={item.name} alt={item.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} />)}</span>}<img className="board-champion-image" src={unit.champion.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} /><b>{unit.champion.name}</b>{threeStarTargetIds.has(unit.champion.id) && <em className="three-star-board-marker" title="Three-star target">3★</em>}{comp.carries.includes(unit.champion.id) && <small>Carry</small>}</span>}{summon && <span className="board-summon-token" title={summon.note}>{summon.kind === "relic" ? <Shield size={18} /> : <b>{summon.name.slice(0, 2)}</b>}<strong>{summon.name}</strong></span>}</div>;
              })).flat()}
            </div>
            <div className="board-label yours">Your side</div>
          </div>
          <aside className="position-traits" aria-label={`${activePlan.stage} active traits`}>
            <div><strong>Active traits</strong><small>{activePlan.units.length} units</small></div>
            <div className="position-trait-list">{activeTraits.map(([trait, count]) => { const traitData = traitByName.get(trait); return <span className={comp.traits.includes(trait) ? "primary" : ""} key={trait}>{traitData?.image ? <img src={traitData.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <i aria-hidden="true" />}<b>{trait}</b><strong>{count}</strong></span>; })}</div>
          </aside>
        </div>
      </>}
    </section>
  );
}
