import type { Comp } from "../types/Comp";
import type { SelectedItem, TFTItem } from "../types/Item";

const NORMAL_UNIT_POINTS = 10;
const CORE_UNIT_BONUS = 25;
const PRIMARY_CARRY_BONUS = 30;
const SECONDARY_CARRY_BONUS = 15;
const COMPLETED_ITEM_POINTS = 10;
const COMPONENT_PAIR_POINTS = 8;
const SINGLE_COMPONENT_POINTS = 4;
const MAX_COVERAGE_BONUS = 30;
const MISSING_UNIT_PENALTY = 2;
const AUGMENT_MATCH_POINTS = 12;

export interface MatchedItem {
  selectedItemId: string;
  recommendedItemId: string;
  matchedAs: "completed" | "component-pair" | "component";
  points: number;
}

export interface ScoreBreakdown {
  unitPoints: number;
  coreBonus: number;
  carryBonus: number;
  itemPoints: number;
  coverageBonus: number;
  missingPenalty: number;
  augmentPoints: number;
  earnedPoints: number;
  maximumPoints: number;
}

export interface Recommendation {
  comp: Comp;
  compatibility: number;
  ownedUnits: string[];
  missingUnits: string[];
  matchedCoreUnits: string[];
  matchedCarries: string[];
  matchedItems: MatchedItem[];
  usefulItemIds: string[];
  scoreBreakdown: ScoreBreakdown;
}

export function recommendComps(
  selectedChampionIds: string[],
  selectedItems: SelectedItem[],
  availableComps: Comp[],
  availableItems: TFTItem[],
  selectedAugmentIds: string[] = [],
): Recommendation[] {
  const champions = new Set(selectedChampionIds);
  const itemCatalog = new Map(availableItems.map((item) => [item.id, item]));

  return availableComps
    .map((comp) => {
      const ownedUnits = comp.units.filter((id) => champions.has(id));
      const missingUnits = comp.units.filter((id) => !champions.has(id));
      const matchedCoreUnits = comp.coreUnits.filter((id) => champions.has(id));
      const matchedCarries = comp.carries.filter((id) => champions.has(id));
      const recommendedItemIds = comp.recommendedItems.flatMap((entry) => entry.items);
      const recommendedAugmentIds = new Set((comp.recommendedAugments ?? []).map((entry) => entry.augmentId));
      const remainingItems = Object.fromEntries(selectedItems.map((item) => [item.id, item.quantity]));
      const matchedItems: MatchedItem[] = [];

      // Treat the inventory as consumable while matching recipes so one component
      // cannot increase the score for several different recommended items.
      for (const recommendedItemId of recommendedItemIds) {
        if ((remainingItems[recommendedItemId] ?? 0) > 0) {
          remainingItems[recommendedItemId] -= 1;
          matchedItems.push({ selectedItemId: recommendedItemId, recommendedItemId, matchedAs: "completed", points: COMPLETED_ITEM_POINTS });
          continue;
        }

        const recipe = itemCatalog.get(recommendedItemId)?.components ?? [];
        if (recipe.length === 2) {
          const required = [...recipe];
          const canBuild = required.every((componentId, index) => {
            const earlierCopies = required.slice(0, index).filter((id) => id === componentId).length;
            return (remainingItems[componentId] ?? 0) > earlierCopies;
          });
          if (canBuild) {
            for (const componentId of required) remainingItems[componentId] -= 1;
            matchedItems.push({ selectedItemId: required.join("+"), recommendedItemId, matchedAs: "component-pair", points: COMPONENT_PAIR_POINTS });
            continue;
          }
        }

        const componentId = recipe.find((id) => (remainingItems[id] ?? 0) > 0);
        if (componentId) {
          remainingItems[componentId] -= 1;
          matchedItems.push({ selectedItemId: componentId, recommendedItemId, matchedAs: "component", points: SINGLE_COMPONENT_POINTS });
        }
      }

      const unitPoints = ownedUnits.length * NORMAL_UNIT_POINTS;
      const coreBonus = matchedCoreUnits.length * CORE_UNIT_BONUS;
      const primaryCarry = comp.carries[0];
      const carryBonus = matchedCarries.reduce((points, id) => points + (id === primaryCarry ? PRIMARY_CARRY_BONUS : SECONDARY_CARRY_BONUS), 0);
      const itemPoints = matchedItems.reduce((points, item) => points + item.points, 0);
      const coverageBonus = comp.units.length ? Math.round((ownedUnits.length / comp.units.length) * MAX_COVERAGE_BONUS) : 0;
      const missingPenalty = missingUnits.length * MISSING_UNIT_PENALTY;
      const augmentPoints = selectedAugmentIds.filter((id) => recommendedAugmentIds.has(id)).length * AUGMENT_MATCH_POINTS;
      const earnedPoints = Math.max(0, unitPoints + coreBonus + carryBonus + itemPoints + coverageBonus + augmentPoints - missingPenalty);
      const maximumCarryBonus = comp.carries.reduce((points, _, index) => points + (index === 0 ? PRIMARY_CARRY_BONUS : SECONDARY_CARRY_BONUS), 0);
      const maximumPoints =
        comp.units.length * NORMAL_UNIT_POINTS +
        comp.coreUnits.length * CORE_UNIT_BONUS +
        maximumCarryBonus +
        recommendedItemIds.length * COMPLETED_ITEM_POINTS +
        MAX_COVERAGE_BONUS +
        selectedAugmentIds.length * AUGMENT_MATCH_POINTS;
      const compatibility = maximumPoints === 0 ? 0 : Math.min(100, Math.round((earnedPoints / maximumPoints) * 100));

      return {
        comp,
        compatibility,
        ownedUnits,
        missingUnits,
        matchedCoreUnits,
        matchedCarries,
        matchedItems,
        usefulItemIds: [...new Set(recommendedItemIds)],
        scoreBreakdown: { unitPoints, coreBonus, carryBonus, itemPoints, coverageBonus, missingPenalty, augmentPoints, earnedPoints, maximumPoints },
      };
    })
    .sort((a, b) =>
      b.compatibility - a.compatibility ||
      b.scoreBreakdown.earnedPoints - a.scoreBreakdown.earnedPoints ||
      a.comp.name.localeCompare(b.comp.name),
    );
}
