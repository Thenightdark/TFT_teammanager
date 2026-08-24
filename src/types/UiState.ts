import type { ItemType } from "./Item";

export type CostFilter = "all" | 1 | 2 | 3 | 4 | 5;
export type InventoryView = "champions" | "items" | "augments" | "special" | "tiers";
export type ItemFilter = "all" | ItemType;
export type AppScreen = "inventory" | "results" | "detail";
export type ChampionGridSize = "small" | "medium" | "large";
export type DisplayMode = "beginner" | "expert";
