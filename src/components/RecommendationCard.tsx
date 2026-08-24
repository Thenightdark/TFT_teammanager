import { ArrowRight, Check, Circle, Crown, PackageOpen, Scale, Shield } from "lucide-react";
import type { Champion } from "../types/Champion";
import type { TFTItem } from "../types/Item";
import type { Recommendation } from "../utils/recommendationEngine";

interface RecommendationCardProps {
  recommendation: Recommendation;
  champions: Champion[];
  items: TFTItem[];
  onView: (recommendation: Recommendation) => void;
  comparing: boolean;
  onCompare: (recommendation: Recommendation) => void;
}

export default function RecommendationCard({ recommendation, champions, items, onView, comparing, onCompare }: RecommendationCardProps) {
  const championName = (id: string) => champions.find((champion) => champion.id === id)?.name ?? id;
  const itemName = (id: string) => items.find((item) => item.id === id)?.name ?? id;

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-header">
        <div>
          <p className="eyebrow">{recommendation.comp.tier ? <span className={`mini-tier tier-${recommendation.comp.tier.toLowerCase()}`}>{recommendation.comp.tier} TIER</span> : "COMP MATCH"}</p>
          <h2>{recommendation.comp.name}</h2>
        </div>
        <div className="compatibility-badge" aria-label={`${recommendation.compatibility}% compatibility`}>
          <strong>{recommendation.compatibility}%</strong><span>Compatibility</span>
        </div>
      </div>

      <div className="recommendation-columns">
        <section>
          <h3>You own <span>{recommendation.ownedUnits.length}</span></h3>
          <div className="unit-status-list owned">
            {recommendation.ownedUnits.length ? recommendation.ownedUnits.map((id) => <span key={id}><Check size={12} />{championName(id)}</span>) : <small>No matching champions yet</small>}
          </div>
        </section>
        <section>
          <h3>Missing <span>{recommendation.missingUnits.length}</span></h3>
          <div className="unit-status-list missing">
            {recommendation.missingUnits.map((id) => <span key={id}><Circle size={9} />{championName(id)}</span>)}
          </div>
        </section>
      </div>

      <div className="recommendation-meta">
        <div><Crown size={15} /><span><small>Main carries</small><strong>{recommendation.comp.carries.map(championName).join(" · ")}</strong></span></div>
        {recommendation.comp.mainTank && <div><Shield size={15} /><span><small>Main tank</small><strong>{championName(recommendation.comp.mainTank)}</strong></span></div>}
        <div><PackageOpen size={15} /><span><small>Useful items</small><strong>{recommendation.usefulItemIds.slice(0, 3).map(itemName).join(" · ")}</strong></span></div>
      </div>

      <div className="recommendation-actions"><button type="button" className={comparing ? "compare-button active" : "compare-button"} onClick={() => onCompare(recommendation)}><Scale size={14} /> {comparing ? "Comparing" : "Compare"}</button><button type="button" className="view-comp-button" onClick={() => onView(recommendation)}>View comp <ArrowRight size={15} /></button></div>
    </article>
  );
}
