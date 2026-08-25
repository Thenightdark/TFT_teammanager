export interface RecommendedItemSet {
  champion: string;
  items: string[];
  role?: "main-carry" | "secondary-carry" | "main-tank" | "secondary-tank" | "emblem-holder" | "utility";
}

export type CompTier = "S" | "A" | "B" | "C";

export interface RequiredEmblem {
  trait: string;
  holder: string;
  item: string;
  note: string;
}

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
  threeStarTargets?: string[];
  boardPositions?: Record<string, [row: number, column: number]>;
  positioningNote?: string;
  requiredEmblems?: RequiredEmblem[];
  recommendedItems: RecommendedItemSet[];
  recommendedAugments?: RecommendedAugment[];
  traits: string[];
  description: string;
}
import type { RecommendedAugment } from "./Augment";
