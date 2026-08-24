export type SpecialItemCategory = "radiant" | "artifact";
export type ItemFit = "attack" | "magic" | "tank" | "fighter" | "utility";

export interface SpecialItem {
  id: string;
  apiName: string;
  name: string;
  category: SpecialItemCategory;
  image: string;
  fit: ItemFit;
  fitReason: string;
  description: string;
  recommendedChampionIds: string[];
}
