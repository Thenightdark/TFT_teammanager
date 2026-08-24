import { ArrowRight, Crown, Shield, Star } from "lucide-react";
import type { Champion } from "../types/Champion";
import type { Comp, CompTier } from "../types/Comp";
import type { SetInfo } from "../types/Set";
import FreshnessBanner from "./FreshnessBanner";

interface TeamTierListProps {
  comps: Comp[];
  champions: Champion[];
  onViewComp: (comp: Comp) => void;
  setInfo: SetInfo;
  favoriteIds: Set<string>;
}

const tierOrder: CompTier[] = ["S", "A", "B", "C"];

export default function TeamTierList({ comps, champions, onViewComp, setInfo, favoriteIds }: TeamTierListProps) {
  const championById = new Map(champions.map((champion) => [champion.id, champion]));
  const ranked = [...comps].sort((a, b) => tierOrder.indexOf(a.tier ?? "C") - tierOrder.indexOf(b.tier ?? "C") || a.name.localeCompare(b.name));

  return (
    <section className="roster-panel tier-list-panel" aria-labelledby="tier-list-heading">
      <div className="roster-title"><div><Crown size={18} /><h2 id="tier-list-heading">Team comp tier list</h2><span>{ranked.length}</span></div></div>
      <p className="special-guide-intro">Tier order describes the general strength of each team in the current patch. Your own Compatibility score may favor a different team based on what you have.</p>
      <FreshnessBanner set={setInfo} compPatch={ranked.find((comp) => comp.sourcePatch)?.sourcePatch} />
      <div className="tier-list">
        {ranked.map((comp) => {
          const mainCarry = championById.get(comp.carries[0]);
          const mainTank = comp.mainTank ? championById.get(comp.mainTank) : undefined;
          return (
            <article className="tier-comp-card" key={comp.id}>
              <span className={`tier-badge tier-${(comp.tier ?? "C").toLowerCase()}`}>{comp.tier ?? "C"}</span>
              <div className="tier-comp-main">
                <div className="tier-comp-heading"><div><h3>{favoriteIds.has(comp.id) && <Star className="favorite-star" size={14} fill="currentColor" />}{comp.name}</h3><p>{comp.playstyle ?? "Flexible"}{comp.sourcePatch ? ` · ${comp.sourcePatch}` : ""}</p></div><button type="button" onClick={() => onViewComp(comp)}>View comp <ArrowRight size={14} /></button></div>
                <div className="tier-unit-row">{comp.units.map((id) => { const champion = championById.get(id); return <span key={id}><img src={champion?.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} /><small>{champion?.name ?? id}</small></span>; })}</div>
                <div className="tier-role-row">
                  <span><Crown size={13} /><small>Main carry</small><strong>{mainCarry?.name ?? "Flexible"}</strong></span>
                  <span><Shield size={13} /><small>Main tank</small><strong>{mainTank?.name ?? "Flexible"}</strong></span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
