import { describe, expect, it } from "vitest";
import type { Champion } from "../types/Champion";
import type { Comp } from "../types/Comp";
import type { SelectedItem, TFTItem } from "../types/Item";
import { createItemPlan, createLevelUpSuggestions, createSubstitutions, createTransitionGuide, getThreeStarTargetIds } from "./strategyPlanner";
import { createBoardSummons } from "./boardSummons";

const champions: Champion[] = [
  { id: "carry", name: "Carry", cost: 4, traits: ["Blaster"], image: "", role: "backline-carry" },
  { id: "tank", name: "Tank", cost: 3, traits: ["Guard"], image: "", role: "frontline" },
  { id: "support", name: "Support", cost: 2, traits: ["Blaster"], image: "", role: "backline-carry" },
  { id: "sub", name: "Sub", cost: 3, traits: ["Guard"], image: "", role: "frontline" },
  { id: "tft-17-shen", name: "Shen", cost: 5, traits: ["Bulwark", "Bastion"], image: "", role: "frontline" },
];
const items: TFTItem[] = [
  { id: "sword", name: "Sword", type: "component", image: "" },
  { id: "bow", name: "Bow", type: "component", image: "" },
  { id: "slayer", name: "Slayer", type: "completed", image: "", components: ["sword", "bow"] },
];
const comp: Comp = { id: "comp", name: "Comp", units: ["carry", "tank"], coreUnits: ["carry"], carries: ["carry"], mainTank: "tank", playstyle: "Fast 8", recommendedItems: [{ champion: "carry", role: "main-carry", items: ["slayer"] }], traits: ["Blaster", "Guard"], description: "" };

describe("strategy planner", () => {
  it("marks a recommended item craftable when both components are owned", () => {
    const selected: SelectedItem[] = [{ ...items[0], quantity: 1 }, { ...items[1], quantity: 1 }];
    expect(createItemPlan(comp, selected, items, champions)[0].status).toBe("craft-now");
  });

  it("creates early, mid, and final transition steps", () => {
    expect(createTransitionGuide(comp, champions).map((step) => step.stage)).toEqual(["Stage 2", "Stage 3", "Stage 4+"]);
  });

  it("suggests role and trait compatible replacements", () => {
    const replacements = createSubstitutions(comp, champions, new Set(["carry"]));
    expect(replacements[0].missing.id).toBe("tank");
    expect(replacements[0].alternatives[0].id).toBe("sub");
  });

  it("suggests one level 9 and one level 10 addition for an eight-unit board", () => {
    const fullComp = { ...comp, units: ["carry", "tank", "u3", "u4", "u5", "u6", "u7", "u8"] };
    expect(createLevelUpSuggestions(fullComp, champions).map((entry) => entry.level)).toEqual([9, 10]);
  });

  it("marks low-cost reroll core units as three-star targets", () => {
    const reroll = { ...comp, coreUnits: ["tank"], playstyle: "Slow Roll · Level 7" };
    expect(getThreeStarTargetIds(reroll, champions)).toEqual(new Set(["tank"]));
  });

  it("gives additions an open board position and includes Shen's placeable relic", () => {
    const fullComp = { ...comp, units: ["carry", "tank", "u3", "u4", "u5", "u6", "u7", "u8"] };
    const suggestions = createLevelUpSuggestions(fullComp, champions);
    const shen = suggestions.find((entry) => entry.champion.id === "tft-17-shen");
    expect(shen?.positionLabel).toBeTruthy();
    expect(shen?.summons[0]?.name).toBe("Bulwark Relic");
    expect(shen?.summons[0]?.position).not.toEqual(shen?.position);
    expect(suggestions[suggestions.length - 1]?.summons[0]?.name).toBe("Bulwark Relic");
  });

  it("adds Bia and Bayin at the Shepherd breakpoints", () => {
    const shepherds: Champion[] = Array.from({ length: 5 }, (_, index) => ({
      id: `shepherd-${index}`,
      name: `Shepherd ${index}`,
      cost: 1,
      traits: ["Shepherd"],
      image: "",
      role: index < 2 ? "frontline" : "backline-carry",
    }));
    const board = shepherds.map((champion, index) => ({ champion, row: index < 2 ? 0 : 3, column: index }));
    expect(createBoardSummons(board.slice(0, 3)).map((summon) => summon.name)).toEqual(["Bia"]);
    expect(createBoardSummons(board).map((summon) => summon.name)).toEqual(["Bia", "Bayin"]);
  });
});
