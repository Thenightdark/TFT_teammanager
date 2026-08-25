import type { Comp } from "../types/Comp";
import type { Trait } from "../types/Trait";
import type { BoardUnit } from "./positioning";

export type TraitVisualTier = "inactive" | "bronze" | "silver" | "gold" | "prismatic" | "unique";

export interface TraitVisualState {
  tier: TraitVisualTier;
  label: string;
  current: number;
  maximum: number;
}

export function getTraitVisualState(trait: Trait | undefined, count: number): TraitVisualState {
  const breakpoints = [...(trait?.breakpoints ?? [])].sort((a, b) => a.minimum - b.minimum);
  const maximum = breakpoints[breakpoints.length - 1]?.minimum ?? Math.max(1, count);
  const achievedBreakpoints = breakpoints.filter((breakpoint) => breakpoint.minimum <= count);
  const achieved = achievedBreakpoints[achievedBreakpoints.length - 1];
  if (!achieved) return { tier: "inactive", label: "Inactive", current: count, maximum };

  const normalized = achieved.label.toLowerCase();
  const tier: TraitVisualTier = normalized.includes("prismatic")
    ? "prismatic"
    : normalized.includes("gold")
      ? "gold"
      : normalized.includes("silver")
        ? "silver"
        : normalized.includes("unique")
          ? "unique"
          : "bronze";
  const label = tier === "unique" ? "Unique" : tier[0].toUpperCase() + tier.slice(1);
  return { tier, label, current: count, maximum };
}

export function countBoardTraits(comp: Comp, units: BoardUnit[]): Map<string, number> {
  const counts = new Map<string, number>();
  const unitsById = new Map(units.map((unit) => [unit.champion.id, unit.champion]));

  for (const unit of units) {
    for (const trait of unit.champion.traits) counts.set(trait, (counts.get(trait) ?? 0) + 1);
  }

  const countedEmblems = new Set<string>();
  for (const emblem of comp.requiredEmblems ?? []) {
    const holder = unitsById.get(emblem.holder);
    const key = `${emblem.holder}:${emblem.trait}`;
    if (!holder || holder.traits.includes(emblem.trait) || countedEmblems.has(key)) continue;
    counts.set(emblem.trait, (counts.get(emblem.trait) ?? 0) + 1);
    countedEmblems.add(key);
  }

  return counts;
}
