import { describe, expect, it } from "vitest";
import type { Comp } from "../types/Comp";
import type { SelectedItem, TFTItem } from "../types/Item";
import { recommendComps } from "./recommendationEngine";

const items: TFTItem[] = [
  { id: "sword", name: "B.F. Sword", type: "component", image: "" },
  { id: "bow", name: "Recurve Bow", type: "component", image: "" },
  { id: "giant-slayer", name: "Giant Slayer", type: "completed", image: "", components: ["sword", "bow"] },
];

const coreComp: Comp = {
  id: "core-comp",
  name: "Core Carry",
  units: ["carry", "core-two", "support-one", "support-two"],
  coreUnits: ["carry", "core-two"],
  carries: ["carry"],
  recommendedItems: [{ champion: "carry", items: ["giant-slayer"] }],
  traits: [],
  description: "Test composition",
  recommendedAugments: [{ augmentId: "carry-augment", reason: "Empowers the carry." }],
};

const supportComp: Comp = {
  id: "support-comp",
  name: "Support Match",
  units: ["carry", "core-two", "support-one", "other"],
  coreUnits: ["other"],
  carries: ["other"],
  recommendedItems: [],
  traits: [],
  description: "Test composition",
};

const score = (champions: string[], selectedItems: SelectedItem[] = [], comps: Comp[] = [coreComp]) => recommendComps(champions, selectedItems, comps, items);

describe("recommendation engine", () => {
  it("gives a very high score when every champion is owned", () => {
    const [result] = score(coreComp.units, [{ ...items[2], quantity: 1 }]);
    expect(result.compatibility).toBeGreaterThanOrEqual(90);
    expect(result.missingUnits).toHaveLength(0);
  });

  it("gives a very low score when no champions are owned", () => {
    const [result] = score([]);
    expect(result.compatibility).toBe(0);
    expect(result.ownedUnits).toHaveLength(0);
  });

  it("strongly rewards owning the main carry and core units", () => {
    const results = score(["carry", "core-two", "support-one"], [], [supportComp, coreComp]);
    expect(results[0].comp.id).toBe("core-comp");
    expect(results[0].compatibility - results[1].compatibility).toBeGreaterThan(20);
  });

  it("gives supporting units some score without outranking core matches", () => {
    const [coreResult, supportResult] = score(["carry", "core-two"], [], [supportComp, coreComp]);
    expect(supportResult.compatibility).toBeGreaterThan(0);
    expect(coreResult.comp.id).toBe("core-comp");
    expect(coreResult.compatibility).toBeGreaterThan(supportResult.compatibility);
  });

  it("increases the score when recommended item components are owned", () => {
    const [withoutItems] = score(["carry"]);
    const [withComponents] = score(["carry"], [
      { ...items[0], quantity: 1 },
      { ...items[1], quantity: 1 },
    ]);
    expect(withComponents.scoreBreakdown.itemPoints).toBe(8);
    expect(withComponents.compatibility).toBeGreaterThan(withoutItems.compatibility);
  });

  it("does not throw when a composition references an unavailable item", () => {
    const invalidItemComp = { ...coreComp, recommendedItems: [{ champion: "carry", items: ["missing-item"] }] };
    expect(() => score(["carry"], [], [invalidItemComp])).not.toThrow();
  });

  it("reranks comps when an offered augment is a documented fit", () => {
    const rival = { ...coreComp, id: "rival", name: "Rival", recommendedAugments: [] };
    const results = recommendComps(["support-one"], [], [rival, coreComp], items, ["carry-augment"]);
    expect(results[0].comp.id).toBe("core-comp");
    expect(results[0].scoreBreakdown.augmentPoints).toBe(12);
  });
});
