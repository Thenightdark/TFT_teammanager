import { ArrowLeft, BarChart3, Check, Circle, Crown, Layers3, PackageOpen, ScrollText, Shield } from "lucide-react";
import { useMemo } from "react";
import type { Augment } from "../types/Augment";
import type { Champion } from "../types/Champion";
import type { SelectedItem, TFTItem } from "../types/Item";
import type { Trait } from "../types/Trait";
import type { Recommendation } from "../utils/recommendationEngine";
import AugmentRecommendations from "./AugmentRecommendations";
import FavoriteNotes from "./FavoriteNotes";
import ItemCraftingPlanner from "./ItemCraftingPlanner";
import LevelUpSuggestions from "./LevelUpSuggestions";
import NextStepsPanel from "./NextStepsPanel";
import PositioningBoard from "./PositioningBoard";
import SubstitutionPanel from "./SubstitutionPanel";
import TransitionGuide from "./TransitionGuide";
import { createItemPlan, createLevelUpSuggestions, createNextSteps, createSubstitutions, createTransitionGuide, getThreeStarTargetIds } from "../utils/strategyPlanner";

interface CompositionDetailProps {
  recommendation: Recommendation;
  champions: Champion[];
  items: TFTItem[];
  augments: Augment[];
  traits: Trait[];
  selectedChampionIds: string[];
  selectedItems: SelectedItem[];
  selectedAugmentCount: number;
  selectedAugmentIds: string[];
  displayMode: "beginner" | "expert";
  favorite: boolean;
  note: string;
  onFavoriteChange: (favorite: boolean) => void;
  onNoteChange: (note: string) => void;
  onBack: () => void;
  backLabel?: string;
}

export default function CompositionDetail({ recommendation, champions, items, augments, traits, selectedChampionIds, selectedItems, selectedAugmentCount, selectedAugmentIds, displayMode, favorite, note, onFavoriteChange, onNoteChange, onBack, backLabel = "Back to results" }: CompositionDetailProps) {
  const champion = (id: string) => champions.find((entry) => entry.id === id);
  const itemName = (id: string) => items.find((item) => item.id === id)?.name ?? id;
  const owned = new Set(recommendation.ownedUnits);
  const itemPlan = useMemo(() => createItemPlan(recommendation.comp, selectedItems, items, champions, selectedChampionIds), [recommendation.comp, selectedItems, items, champions, selectedChampionIds]);
  const transitions = useMemo(() => createTransitionGuide(recommendation.comp, champions), [recommendation.comp, champions]);
  const substitutions = useMemo(() => createSubstitutions(recommendation.comp, champions, new Set(selectedChampionIds)), [recommendation.comp, champions, selectedChampionIds]);
  const nextSteps = useMemo(() => createNextSteps(recommendation.comp, selectedChampionIds, itemPlan, selectedAugmentCount, champions), [recommendation.comp, selectedChampionIds, itemPlan, selectedAugmentCount, champions]);
  const levelUpSuggestions = useMemo(() => createLevelUpSuggestions(recommendation.comp, champions), [recommendation.comp, champions]);
  const threeStarTargetIds = useMemo(() => getThreeStarTargetIds(recommendation.comp, champions), [recommendation.comp, champions]);

  return (
    <section className="composition-detail" aria-labelledby="composition-title">
      <button type="button" className="back-results-button" onClick={onBack}><ArrowLeft size={16} /> {backLabel}</button>
      <div className="detail-hero">
        <div><p className="eyebrow">{recommendation.comp.tier ? `${recommendation.comp.tier} TIER · ${recommendation.comp.playstyle ?? "FLEXIBLE"}` : "COMPOSITION DETAIL"}</p><h1 id="composition-title">{recommendation.comp.name}</h1><p>{recommendation.comp.description}</p></div>
        <div className="detail-score"><strong>{recommendation.compatibility}%</strong><span>Compatibility</span></div>
      </div>

      <div className="detail-grid">
        <NextStepsPanel steps={nextSteps} />

        <section className="detail-panel team-detail-panel">
          <div className="detail-section-title"><Layers3 size={17} /><h2>Team</h2><span>{recommendation.comp.units.length} units</span></div>
          <div className="detail-team-grid">
            {recommendation.comp.units.map((id) => {
              const entry = champion(id);
              const isOwned = owned.has(id);
              return (
                <div key={id} className={`detail-unit ${isOwned ? "owned" : "missing"}`}>
                  <span className="detail-unit-image"><img src={entry?.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} /><b>{entry?.name[0] ?? "?"}</b></span>
                  <span><strong>{entry?.name ?? id}</strong><small>{entry?.traits.join(" · ") ?? "Temporary unit"}</small>{threeStarTargetIds.has(id) && <em className="three-star-list-marker">◆ 3★ target</em>}</span>
                  {isOwned ? <Check size={15} /> : <Circle size={11} />}
                </div>
              );
            })}
          </div>
        </section>

        <PositioningBoard comp={recommendation.comp} champions={champions} traits={traits} items={items} />

        <LevelUpSuggestions suggestions={levelUpSuggestions} />

        <TransitionGuide steps={transitions} expert={displayMode === "expert"} />

        <SubstitutionPanel substitutions={substitutions} />

        <AugmentRecommendations comp={recommendation.comp} augments={augments} selectedIds={selectedAugmentIds} />

        <section className="detail-panel">
          <div className="detail-section-title"><Layers3 size={17} /><h2>Traits</h2></div>
          <div className="detail-tag-list">{recommendation.comp.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
        </section>

        <section className="detail-panel">
          <div className="detail-section-title"><Crown size={17} /><h2>Carries &amp; tank</h2></div>
          <div className="detail-carries">{recommendation.comp.carries.map((id, index) => <span key={id}><small>{index ? "Secondary carry" : "Main carry"}</small><strong>{champion(id)?.name ?? id}</strong>{owned.has(id) && <small><Check size={11} /> Owned</small>}</span>)}{recommendation.comp.mainTank && <span><small><Shield size={11} /> Main tank</small><strong>{champion(recommendation.comp.mainTank)?.name ?? recommendation.comp.mainTank}</strong>{owned.has(recommendation.comp.mainTank) && <small><Check size={11} /> Owned</small>}</span>}</div>
        </section>

        <section className="detail-panel recommended-items-panel">
          <div className="detail-section-title"><PackageOpen size={17} /><h2>Recommended items</h2></div>
          <div className="detail-item-groups">
            {recommendation.comp.recommendedItems.map((group) => (
              <div key={group.champion}>
                <strong>{group.role === "main-tank" ? "MAIN TANK" : group.role === "secondary-carry" ? "SECONDARY CARRY" : "MAIN CARRY"} · {champion(group.champion)?.name ?? group.champion}</strong>
                <div>{group.items.map((id) => <span key={id}><img src={items.find((item) => item.id === id)?.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} />{itemName(id)}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        <ItemCraftingPlanner plan={itemPlan} selectedItems={selectedItems} />

        <section className="detail-panel score-explanation-panel">
          <div className="detail-section-title"><BarChart3 size={17} /><h2>Why this matched</h2></div>
          <div className="score-explanation">
            <span><small>Owned units</small><strong>+{recommendation.scoreBreakdown.unitPoints}</strong></span>
            <span><small>Core-unit bonus</small><strong>+{recommendation.scoreBreakdown.coreBonus}</strong></span>
            <span><small>Carry bonus</small><strong>+{recommendation.scoreBreakdown.carryBonus}</strong></span>
            <span><small>Item matches</small><strong>+{recommendation.scoreBreakdown.itemPoints}</strong></span>
            <span><small>Augment matches</small><strong>+{recommendation.scoreBreakdown.augmentPoints}</strong></span>
            <span><small>Board coverage</small><strong>+{recommendation.scoreBreakdown.coverageBonus}</strong></span>
            <span className="penalty"><small>Missing units</small><strong>−{recommendation.scoreBreakdown.missingPenalty}</strong></span>
          </div>
        </section>

        <section className="detail-panel description-panel">
          <div className="detail-section-title"><ScrollText size={17} /><h2>Description</h2></div>
          <p>{recommendation.comp.description}</p>
        </section>

        <FavoriteNotes favorite={favorite} note={note} onFavoriteChange={onFavoriteChange} onNoteChange={onNoteChange} />
      </div>

      <button type="button" className="back-results-button bottom" onClick={onBack}><ArrowLeft size={16} /> {backLabel}</button>
    </section>
  );
}
