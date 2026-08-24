import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Champion } from "../types/Champion";
import type { TFTItem } from "../types/Item";
import type { Recommendation } from "../utils/recommendationEngine";
import RecommendationCard from "./RecommendationCard";
import CompComparison from "./CompComparison";

interface ResultsViewProps {
  recommendations: Recommendation[];
  champions: Champion[];
  items: TFTItem[];
  selectedChampionCount: number;
  selectedItemCount: number;
  onEditInventory: () => void;
  onViewComp: (recommendation: Recommendation) => void;
}

export default function ResultsView({ recommendations, champions, items, selectedChampionCount, selectedItemCount, onEditInventory, onViewComp }: ResultsViewProps) {
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const toggleComparison = (recommendation: Recommendation) => setComparisonIds((current) => current.includes(recommendation.comp.id) ? current.filter((id) => id !== recommendation.comp.id) : current.length < 2 ? [...current, recommendation.comp.id] : [current[1], recommendation.comp.id]);
  const compared = comparisonIds.flatMap((id) => recommendations.find((entry) => entry.comp.id === id) ?? []);
  return (
    <section className="results-view" aria-labelledby="results-title">
      <button type="button" className="back-results-button" onClick={onEditInventory}><ArrowLeft size={16} /> Edit inventory</button>
      <div className="results-hero"><p className="eyebrow">TOP 5 MATCHES</p><h1 id="results-title">Recommended compositions</h1><p>Ranked from your selected champions and items. Compatibility describes data overlap, not expected placement.</p></div>
      <div className="results-summary"><span><strong>{selectedChampionCount}</strong> Champions</span><i /><span><strong>{selectedItemCount}</strong> Items</span><i /><span><strong>{recommendations.length}</strong> Comps ranked</span></div>
      <CompComparison recommendations={compared} champions={champions} onRemove={(id) => setComparisonIds((current) => current.filter((value) => value !== id))} />
      <div className="recommendation-list">
        {recommendations.map((recommendation) => <RecommendationCard key={recommendation.comp.id} recommendation={recommendation} champions={champions} items={items} onView={onViewComp} comparing={comparisonIds.includes(recommendation.comp.id)} onCompare={toggleComparison} />)}
        {!recommendations.length && <div className="empty-recommendations"><strong>No valid compositions are available.</strong><p>Try another TFT set or update its data.</p></div>}
      </div>
    </section>
  );
}
