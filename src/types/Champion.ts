export interface Champion {
  id: string;
  apiName?: string;
  name: string;
  cost: number;
  traits: string[];
  image: string;
  range?: number;
  role?: "frontline" | "melee-carry" | "backline-carry" | "support";
}
