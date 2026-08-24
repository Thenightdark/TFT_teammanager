export interface RecommendedItemSet {
  champion: string;
  items: string[];
  role?: "main-carry" | "secondary-carry" | "main-tank";
}

export type CompTier = "S" | "A" | "B" | "C";

export interface Comp {
  id: string;
  name: string;
  units: string[];
  coreUnits: string[];
  carries: string[];
  mainTank?: string;
  tier?: CompTier;
  playstyle?: string;
  source?: string;
  sourcePatch?: string;
  recommendedItems: RecommendedItemSet[];
  recommendedAugments?: RecommendedAugment[];
  traits: string[];
  description: string;
}
import type { RecommendedAugment } from "./Augment";
