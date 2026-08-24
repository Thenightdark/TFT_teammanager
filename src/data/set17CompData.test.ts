import { describe, expect, it } from "vitest";
import type { Champion } from "../types/Champion";
import type { Comp } from "../types/Comp";
import { createBoardSummons } from "../utils/boardSummons";
import { createPositioningPlans } from "../utils/positioning";
import championsJson from "./set-17/champions.json";
import compsJson from "./set-17/comps.json";
import itemsJson from "./set-17/items.json";
import verifiedGuidesJson from "./set-17/verified-guides.json";

const champions = championsJson as Champion[];
const comps = compsJson as Comp[];
const items = itemsJson as Array<{ id: string; name: string }>;

describe("curated Set 17 comp data", () => {
  it("keeps Shepherd on AP items and identifies the required Karma emblem", () => {
    const shepherd = comps.find((comp) => comp.id === "shepherd");
    expect(shepherd).toBeDefined();
    expect(shepherd?.recommendedItems.find((group) => group.champion === "tft-17-leblanc")?.items).toEqual([
      "tft-item-hextech-gunblade",
      "tft-item-madreds-bloodrazor",
      "tft-item-guinsoos-rageblade",
    ]);
    expect(shepherd?.recommendedItems.find((group) => group.champion === "tft-17-karma")?.items).toEqual([
      "tft-17-item-summon-trait-emblem-item",
      "tft-item-statikk-shiv",
      "tft-item-morellonomicon",
    ]);
    expect(shepherd?.requiredEmblems).toEqual(expect.arrayContaining([
      expect.objectContaining({ trait: "Shepherd", holder: "tft-17-karma" }),
    ]));
  });

  it("frontlines Meepsie and represents the Shepherd bond with one companion marker", () => {
    const shepherd = comps.find((comp) => comp.id === "shepherd");
    expect(shepherd).toBeDefined();
    const late = createPositioningPlans(shepherd!, champions).find((plan) => plan.id === "late");
    const meepsie = late?.units.find((unit) => unit.champion.id === "tft-17-ivern-minion");
    expect(meepsie?.row).toBe(0);
    const summons = createBoardSummons(late?.units ?? []);
    expect(summons).toHaveLength(1);
    expect(summons[0].name).toBe("Bia & Bayin");
    expect(summons[0].position[0]).toBeLessThanOrEqual(1);
  });

  it("uses Jax—not Aatrox—as the Cards & Cartridges main tank", () => {
    const comp = comps.find((entry) => entry.id === "cards-and-cartridges");
    expect(comp?.mainTank).toBe("tft-17-jax");
    expect(comp?.recommendedItems.find((group) => group.role === "main-tank")?.champion).toBe("tft-17-jax");
  });

  it("keeps Reach For The Stars on the exact published holders", () => {
    const comp = comps.find((entry) => entry.id === "reach-for-the-stars");
    const championName = (id: string) => champions.find((champion) => champion.id === id)?.name;
    const itemNames = (championNameValue: string) => {
      const holder = champions.find((champion) => champion.name === championNameValue);
      return comp?.recommendedItems.find((group) => group.champion === holder?.id)?.items.map((id) => items.find((item) => item.id === id)?.name);
    };
    expect(championName(comp?.mainTank ?? "")).toBe("Pantheon");
    expect(comp?.carries.map(championName)).toEqual(["Lulu", "Jax"]);
    expect(itemNames("Lulu")).toEqual(["Nashor's Tooth", "Jeweled Gauntlet", "Nashor's Tooth"]);
    expect(itemNames("Pantheon")).toEqual(["Steadfast Heart", "Spirit Visage", "Sunfire Cape"]);
    expect(itemNames("Jax")).toEqual(["Bloodthirster", "Edge of Night", "Titan's Resolve"]);
    expect(itemNames("Milio")).toBeUndefined();
    expect(comp?.threeStarTargets?.map(championName)).toEqual(["Lulu", "Jax", "Pantheon", "Milio"]);
  });

  it("equips every emblem from the published builds on the shown holder", () => {
    const stayGroovy = comps.find((entry) => entry.id === "stay-groovy");
    const riven = champions.find((champion) => champion.name === "Riven");
    const grooveEmblem = items.find((item) => item.name === "Space Groove Emblem");
    expect(stayGroovy?.recommendedItems.find((group) => group.champion === riven?.id)?.items).toContain(grooveEmblem?.id);
    expect(stayGroovy?.requiredEmblems).toContainEqual(expect.objectContaining({ trait: "Space Groove", holder: riven?.id, item: grooveEmblem?.id }));
    for (const comp of comps) for (const emblem of comp.requiredEmblems ?? []) {
      expect(comp.recommendedItems.find((group) => group.champion === emblem.holder)?.items).toContain(emblem.item);
    }
  });

  it("matches all 41 stored comps to a verified guide and valid item holders", () => {
    expect(comps).toHaveLength(41);
    expect(verifiedGuidesJson).toHaveLength(41);
    const championIds = new Set(champions.map((champion) => champion.id));
    const itemIds = new Set(items.map((item) => item.id));
    for (const comp of comps) {
      expect(comp.source).toBe("Mobalytics");
      expect(comp.sourceGuideUrl).toMatch(/^https:\/\/mobalytics\.gg\/tft\//);
      expect(new Set(comp.units).size).toBe(comp.units.length);
      for (const group of comp.recommendedItems) {
        expect(comp.units).toContain(group.champion);
        expect(championIds.has(group.champion)).toBe(true);
        expect(group.items.length).toBeGreaterThan(0);
        for (const item of group.items) expect(itemIds.has(item)).toBe(true);
      }
    }
  });

  it("places published tanks in the front two rows", () => {
    for (const comp of comps) {
      const late = createPositioningPlans(comp, champions).find((plan) => plan.id === "late");
      for (const group of comp.recommendedItems.filter((entry) => entry.role === "main-tank" || entry.role === "secondary-tank")) {
        expect(late?.units.find((unit) => unit.champion.id === group.champion)?.row, `${comp.name}: tank row`).toBeLessThanOrEqual(1);
      }
    }
  });
});
