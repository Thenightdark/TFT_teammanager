import { describe, expect, it } from "vitest";
import type { Champion } from "../types/Champion";
import type { Comp } from "../types/Comp";
import type { Trait } from "../types/Trait";
import { createPositioningPlans } from "../utils/positioning";
import { countBoardTraits } from "../utils/traitCounts";
import championsJson from "./set-18/champions.json";
import compsJson from "./set-18/comps.json";
import itemsJson from "./set-18/items.json";
import augmentsJson from "./set-18/augments.json";
import traitsJson from "./set-18/traits.json";

const champions = championsJson as Champion[];
const comps = compsJson as Comp[];
const items = itemsJson as Array<{ id: string; name: string }>;
const traits = traitsJson as Trait[];

describe("curated Set 18 data", () => {
  it("contains the current S, A, and B tier team list", () => {
    expect(comps).toHaveLength(30);
    expect(comps.filter((comp) => comp.tier === "S")).toHaveLength(11);
    expect(comps.filter((comp) => comp.tier === "A")).toHaveLength(10);
    expect(comps.filter((comp) => comp.tier === "B")).toHaveLength(9);
  });

  it("contains the full referenced champion and trait roster", () => {
    expect(champions).toHaveLength(66);
    expect(traits).toHaveLength(36);
    expect(champions.find((champion) => champion.name === "Gnar")?.range).toBeGreaterThanOrEqual(3);
  });

  it("keeps every holder, item, emblem, and augment reference valid", () => {
    const championIds = new Set(champions.map((champion) => champion.id));
    const itemIds = new Set(items.map((item) => item.id));
    const augmentIds = new Set(augmentsJson.map((augment) => augment.id));
    for (const comp of comps) {
      expect(comp.source).toBe("Curated Set 18");
      if (comp.id === "double-trouble-cass") {
        expect(comp.units.length).toBeGreaterThan(new Set(comp.units).size);
      } else {
        expect(new Set(comp.units).size).toBe(comp.units.length);
      }
      for (const unit of comp.units) expect(championIds.has(unit), `${comp.name}: ${unit}`).toBe(true);
      for (const group of comp.recommendedItems) {
        expect(comp.units).toContain(group.champion);
        expect(group.items).toHaveLength(3);
        for (const item of group.items) expect(itemIds.has(item), `${comp.name}: ${item}`).toBe(true);
      }
      for (const emblem of comp.requiredEmblems ?? []) {
        expect(comp.recommendedItems.find((group) => group.champion === emblem.holder)?.items).toContain(emblem.item);
      }
      for (const augment of comp.recommendedAugments ?? []) expect(augmentIds.has(augment.augmentId), `${comp.name}: ${augment.augmentId}`).toBe(true);
    }
  });

  it("imports the new Set 18 augments", () => {
    const names = new Set(augmentsJson.map((augment) => augment.name));
    for (const name of ["Starring Up", "Nesting Anvils", "Nesting Dolls", "Wisp Rebate", "Iron Assets", "Wisp Rebate+"]) {
      expect(names.has(name), name).toBe(true);
    }
  });

  it("counts required emblems and keeps tanks on the front two rows", () => {
    const emblemComps = comps.filter((comp) => comp.requiredEmblems?.length);
    expect(emblemComps.length).toBeGreaterThan(0);
    for (const comp of comps) {
      const late = createPositioningPlans(comp, champions).find((plan) => plan.id === "late")!;
      for (const group of comp.recommendedItems.filter((entry) => entry.role === "main-tank" || entry.role === "secondary-tank")) {
        expect(late.units.find((unit) => unit.champion.id === group.champion)?.row, `${comp.name}: tank row`).toBeLessThanOrEqual(1);
      }
      const counts = countBoardTraits(comp, late.units);
      for (const emblem of comp.requiredEmblems ?? []) {
        const natural = late.units.filter((unit) => unit.champion.traits.includes(emblem.trait)).length;
        expect(counts.get(emblem.trait), `${comp.name}: ${emblem.trait}`).toBe(natural + 1);
      }
    }
  });

  it("does not store external guide links", () => {
    const serialized = JSON.stringify(comps).toLowerCase();
    expect(serialized).not.toContain("http");
  });
});
