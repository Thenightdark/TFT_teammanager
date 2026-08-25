import type { Champion } from "../types/Champion";
import type { Comp, RecommendedItemSet } from "../types/Comp";
import type { SelectedItem, TFTItem } from "../types/Item";
import { createBoardSummons, type BoardSummon } from "./boardSummons";
import { createPositioningPlans, describeBoardPosition, findOpenBoardPosition, type BoardPosition, type BoardUnit } from "./positioning";

export interface ItemPlanEntry {
  item: TFTItem;
  holder: Champion;
  role: RecommendedItemSet["role"];
  status: "owned" | "craft-now" | "missing-one" | "unavailable";
  components: TFTItem[];
  missingComponents: TFTItem[];
  usedComponents: TFTItem[];
  alternatives: TFTItem[];
  temporaryHolder?: Champion;
}

export interface TransitionStep {
  stage: string;
  title: string;
  units: Champion[];
  instruction: string;
  economy: string;
}

export interface UnitSubstitution {
  missing: Champion;
  alternatives: Champion[];
}

export interface LevelUpSuggestion {
  level: 9 | 10;
  champion: Champion;
  reason: string;
  position: BoardPosition;
  positionLabel: string;
  boardUnits: BoardUnit[];
  summons: BoardSummon[];
}

export function getThreeStarTargetIds(comp: Comp, champions: Champion[]): Set<string> {
  if (comp.threeStarTargets?.length) return new Set(comp.threeStarTargets);
  if (!/slow roll|reroll/i.test(`${comp.playstyle ?? ""} ${comp.description}`)) return new Set();
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  return new Set(comp.coreUnits.filter((id) => (byId.get(id)?.cost ?? 6) <= 3));
}

export function createLevelUpSuggestions(comp: Comp, champions: Champion[]): LevelUpSuggestion[] {
  const representedTraits = new Map<string, number>();
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  for (const id of comp.units) for (const trait of byId.get(id)?.traits ?? []) representedTraits.set(trait, (representedTraits.get(trait) ?? 0) + 1);
  const chosen = new Set(comp.units);
  const suggestions: LevelUpSuggestion[] = [];
  const latePlan = createPositioningPlans(comp, champions).find((plan) => plan.id === "late");
  const boardUnits = [...(latePlan?.units ?? [])];
  let boardSummons = createBoardSummons(boardUnits);
  let occupied = new Set([
    ...boardUnits.map((unit) => `${unit.row}-${unit.column}`),
    ...boardSummons.map((summon) => `${summon.position[0]}-${summon.position[1]}`),
  ]);
  const firstLevel = Math.max(9, comp.units.length + 1);
  for (let level = firstLevel; level <= 10; level += 1) {
    const ranked = champions
      .filter((champion) => !chosen.has(champion.id) && champion.cost >= 4)
      .map((champion) => {
        const sharedTraits = champion.traits.filter((trait) => representedTraits.has(trait));
        const synergy = sharedTraits.reduce((score, trait) => score + Math.min(3, representedTraits.get(trait) ?? 0) * 5, 0);
        const frontlineNeed = champion.role === "frontline" && comp.units.filter((id) => byId.get(id)?.role === "frontline").length < 3 ? 7 : 0;
        return { champion, sharedTraits, score: synergy + champion.cost * 6 + frontlineNeed };
      })
      .sort((a, b) => b.score - a.score || b.champion.cost - a.champion.cost || a.champion.name.localeCompare(b.champion.name));
    const best = ranked[0];
    if (!best) break;
    chosen.add(best.champion.id);
    const position = findOpenBoardPosition(best.champion, occupied);
    occupied.add(`${position[0]}-${position[1]}`);
    boardUnits.push({ champion: best.champion, row: position[0], column: position[1] });
    boardSummons = createBoardSummons(boardUnits);
    occupied = new Set([
      ...boardUnits.map((unit) => `${unit.row}-${unit.column}`),
      ...boardSummons.map((summon) => `${summon.position[0]}-${summon.position[1]}`),
    ]);
    for (const trait of best.champion.traits) representedTraits.set(trait, (representedTraits.get(trait) ?? 0) + 1);
    const reason = best.sharedTraits.length
      ? `Adds ${best.sharedTraits.slice(0, 2).join(" + ")} while increasing the board’s late-game value.`
      : best.champion.cost === 5
        ? "A powerful five-cost addition that raises the board’s late-game ceiling."
        : "A strong four-cost addition for the remaining late-game board slot.";
    suggestions.push({
      level: level as 9 | 10,
      champion: best.champion,
      reason,
      position,
      positionLabel: describeBoardPosition(position),
      boardUnits: [...boardUnits],
      summons: [...boardSummons],
    });
  }
  return suggestions;
}

function consumeRecipe(recipe: string[], inventory: Record<string, number>) {
  const missing: string[] = [];
  const used: string[] = [];
  for (const component of recipe) {
    if ((inventory[component] ?? 0) > 0) {
      inventory[component] -= 1;
      used.push(component);
    } else missing.push(component);
  }
  return { missing, used };
}

export function createItemPlan(comp: Comp, selectedItems: SelectedItem[], items: TFTItem[], champions: Champion[], selectedChampionIds: string[] = []): ItemPlanEntry[] {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const championById = new Map(champions.map((champion) => [champion.id, champion]));
  const inventory = Object.fromEntries(selectedItems.map((item) => [item.id, item.quantity]));

  return comp.recommendedItems.flatMap((group) => {
    const holder = championById.get(group.champion);
    if (!holder) return [];
    return group.items.flatMap((itemId) => {
      const item = itemById.get(itemId);
      if (!item) return [];
      const recipe = item.components ?? [];
      let status: ItemPlanEntry["status"] = "unavailable";
      let missingIds: string[] = recipe;
      let usedIds: string[] = [];
      if ((inventory[itemId] ?? 0) > 0) {
        inventory[itemId] -= 1;
        status = "owned";
        missingIds = [];
      } else if (recipe.length === 2) {
        const result = consumeRecipe(recipe, inventory);
        missingIds = result.missing;
        usedIds = result.used;
        status = result.missing.length === 0 ? "craft-now" : result.missing.length === 1 ? "missing-one" : "unavailable";
      }
      const temporaryHolder = champions
        .filter((candidate) => selectedChampionIds.includes(candidate.id) && candidate.id !== holder.id && !comp.units.includes(candidate.id))
        .sort((a, b) => Number(b.role === holder.role) - Number(a.role === holder.role) || a.cost - b.cost || a.name.localeCompare(b.name))[0];
      return [{
        item,
        holder,
        role: group.role,
        status,
        components: recipe.flatMap((id) => itemById.get(id) ?? []),
        missingComponents: missingIds.flatMap((id) => itemById.get(id) ?? []),
        usedComponents: usedIds.flatMap((id) => itemById.get(id) ?? []),
        alternatives: items.filter((candidate) => candidate.type === "completed" && candidate.id !== item.id && (candidate.components ?? []).some((id) => recipe.includes(id))).slice(0, 2),
        temporaryHolder,
      }];
    });
  });
}

function stageUnits(comp: Comp, champions: Champion[], count: number) {
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  return comp.units
    .flatMap((id) => byId.get(id) ?? [])
    .sort((a, b) => a.cost - b.cost || Number(comp.coreUnits.includes(b.id)) - Number(comp.coreUnits.includes(a.id)) || a.name.localeCompare(b.name))
    .slice(0, count);
}

export function createTransitionGuide(comp: Comp, champions: Champion[]): TransitionStep[] {
  const slowRoll = /slow roll|reroll/i.test(comp.playstyle ?? comp.name);
  const fastNine = /fast 9/i.test(comp.playstyle ?? comp.name);
  return [
    {
      stage: "Stage 2",
      title: "Build a stable opener",
      units: stageUnits(comp, champions, 4),
      instruction: "Play the cheapest matching frontline and backline. Put carry items on a low-cost unit with the same role as the final carry.",
      economy: "Buy useful pairs, but avoid rerolling. Aim to build an economy after the first carousel.",
    },
    {
      stage: "Stage 3",
      title: slowRoll ? "Prepare the reroll board" : "Add core pieces",
      units: stageUnits(comp, champions, 6),
      instruction: "Keep core champions and replace temporary holders only when the final unit is strong enough to stabilize the board.",
      economy: slowRoll ? "Reach the comp’s reroll level and stay above 50 gold while upgrading core units." : "Level steadily and spend only enough gold to avoid losing too much health.",
    },
    {
      stage: "Stage 4+",
      title: "Complete the final board",
      units: stageUnits(comp, champions, comp.units.length),
      instruction: "Move completed carry and tank items to their final holders, then use positioning plans to react to opposing boards.",
      economy: fastNine ? "Stabilize at level 8, then preserve gold for level 9 and the final legendary units." : slowRoll ? "Finish the key three-stars before levelling for the remaining units." : "Roll at level 8 until the core board is upgraded, then consider level 9.",
    },
  ];
}

export function createSubstitutions(comp: Comp, champions: Champion[], ownedIds: Set<string>): UnitSubstitution[] {
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  return comp.units.flatMap((id) => {
    if (ownedIds.has(id)) return [];
    const missing = byId.get(id);
    if (!missing) return [];
    const alternatives = champions
      .filter((candidate) => !comp.units.includes(candidate.id) && candidate.id !== id)
      .map((candidate) => ({
        champion: candidate,
        score: candidate.traits.filter((trait) => missing.traits.includes(trait)).length * 6 + Number(candidate.role === missing.role) * 4 - Math.abs(candidate.cost - missing.cost),
      }))
      .filter((entry) => entry.score > 2)
      .sort((a, b) => b.score - a.score || a.champion.cost - b.champion.cost || a.champion.name.localeCompare(b.champion.name))
      .slice(0, 2)
      .map((entry) => entry.champion);
    return alternatives.length ? [{ missing, alternatives }] : [];
  });
}

export function createNextSteps(comp: Comp, selectedChampionIds: string[], itemPlan: ItemPlanEntry[], selectedAugmentCount: number, champions: Champion[]) {
  const owned = new Set(selectedChampionIds);
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  const missingCore = comp.coreUnits.filter((id) => !owned.has(id)).flatMap((id) => byId.get(id) ?? []).slice(0, 3);
  const craftable = itemPlan.find((entry) => entry.status === "craft-now");
  const missingOne = itemPlan.find((entry) => entry.status === "missing-one");
  const steps: string[] = [];
  const ownedCore = comp.coreUnits.filter((id) => owned.has(id)).flatMap((id) => byId.get(id) ?? []);
  if (ownedCore.length) steps.push(`Keep ${ownedCore.map((unit) => unit.name).join(", ")}; ${ownedCore.length === 1 ? "it is" : "they are"} part of the core board.`);
  if (missingCore.length) steps.push(`Look for ${missingCore.map((unit) => unit.name).join(", ")} next.`);
  if (craftable) steps.push(`Craft ${craftable.item.name} now for ${craftable.holder.name}.`);
  else if (missingOne) steps.push(`Save for ${missingOne.missingComponents[0]?.name ?? "one component"} to complete ${missingOne.item.name}.`);
  if (selectedAugmentCount === 0) steps.push("Add your offered augments to check whether this remains your best path.");
  steps.push(/slow roll|reroll/i.test(comp.playstyle ?? "") ? "Hold 50 gold and reroll at the comp’s listed level." : /fast 9/i.test(comp.playstyle ?? "") ? "Preserve health at level 8, then push level 9." : "Plan to stabilize at level 8 before adding optional units.");
  return steps.slice(0, 5);
}
