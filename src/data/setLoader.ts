import setsJson from "./sets.json";
import type { Augment } from "../types/Augment";
import type { Champion } from "../types/Champion";
import type { Comp } from "../types/Comp";
import type { TFTItem } from "../types/Item";
import type { SetInfo, TFTSetData } from "../types/Set";
import type { SpecialItem } from "../types/SpecialItem";
import type { Trait } from "../types/Trait";

const championModules = import.meta.glob<{ default: Champion[] }>("./set-*/champions.json", { eager: true });
const itemModules = import.meta.glob<{ default: TFTItem[] }>("./set-*/items.json", { eager: true });
const traitModules = import.meta.glob<{ default: Trait[] }>("./set-*/traits.json", { eager: true });
const compModules = import.meta.glob<{ default: Comp[] }>("./set-*/comps.json", { eager: true });
const specialItemModules = import.meta.glob<{ default: SpecialItem[] }>("./set-*/special-items.json", { eager: true });
const augmentModules = import.meta.glob<{ default: Augment[] }>("./set-*/augments.json", { eager: true });

export const availableSets = setsJson as SetInfo[];

function readModule<T>(modules: Record<string, { default: T[] }>, setId: string, filename: string, issues: string[]): T[] {
  const key = `./${setId}/${filename}.json`;
  const module = modules[key];
  if (!module || !Array.isArray(module.default)) {
    issues.push(`${filename} data could not be loaded.`);
    return [];
  }
  return module.default;
}

export function loadSetData(setId: string): TFTSetData {
  const info = availableSets.find((set) => set.id === setId) ?? availableSets[0];
  const issues: string[] = [];
  if (!info) {
    return { info: { id: "unavailable", name: "TFT data unavailable", number: 0, patch: "", source: "" }, champions: [], augments: [], items: [], specialItems: [], traits: [], comps: [], issues: ["No TFT sets are registered."] };
  }

  const champions = readModule<Champion>(championModules, info.id, "champions", issues).filter((entry) => entry && typeof entry.id === "string" && typeof entry.name === "string");
  const augments = readModule<Augment>(augmentModules, info.id, "augments", issues).filter((entry) => entry && typeof entry.id === "string" && typeof entry.name === "string");
  const items = readModule<TFTItem>(itemModules, info.id, "items", issues).filter((entry) => entry && typeof entry.id === "string" && typeof entry.name === "string");
  const specialItems = readModule<SpecialItem>(specialItemModules, info.id, "special-items", issues).filter((entry) => entry && typeof entry.id === "string" && typeof entry.name === "string" && (entry.category === "radiant" || entry.category === "artifact"));
  const traits = readModule<Trait>(traitModules, info.id, "traits", issues).filter((entry) => entry && typeof entry.id === "string" && typeof entry.name === "string");
  const rawComps = readModule<Comp>(compModules, info.id, "comps", issues);
  const championIds = new Set(champions.map((champion) => champion.id));
  const itemIds = new Set(items.map((item) => item.id));
  const augmentIds = new Set(augments.map((augment) => augment.id));
  const comps = rawComps.flatMap((comp) => {
    if (!comp || typeof comp.id !== "string" || !Array.isArray(comp.units)) {
      issues.push("An invalid composition was skipped.");
      return [];
    }
    const units = comp.units.filter((id) => championIds.has(id));
    if (units.length !== comp.units.length) issues.push(`${comp.name ?? comp.id} references unavailable champions.`);
    if (!units.length) return [];
    return [{
      ...comp,
      units,
      coreUnits: (comp.coreUnits ?? []).filter((id) => championIds.has(id) && units.includes(id)),
      carries: (comp.carries ?? []).filter((id) => championIds.has(id) && units.includes(id)),
      traits: Array.isArray(comp.traits) ? comp.traits : [],
      recommendedItems: (comp.recommendedItems ?? []).flatMap((group) => {
        if (!championIds.has(group.champion)) return [];
        const validItems = (group.items ?? []).filter((id) => itemIds.has(id));
        if (validItems.length !== (group.items ?? []).length) issues.push(`${comp.name ?? comp.id} references unavailable items.`);
        return [{ ...group, items: validItems }];
      }),
      recommendedAugments: (comp.recommendedAugments ?? []).filter((entry) => augmentIds.has(entry.augmentId)),
    }];
  });

  return {
    info,
    champions,
    augments,
    items,
    specialItems,
    traits,
    comps,
    issues: [...new Set(issues)],
  };
}
