import type { Champion } from "./Champion";
import type { Comp } from "./Comp";
import type { TFTItem } from "./Item";
import type { SpecialItem } from "./SpecialItem";
import type { Trait } from "./Trait";

export interface SetInfo {
  id: string;
  name: string;
  number: number;
  patch: string;
  source: string;
  metaUpdatedAt?: string;
}

export interface TFTSetData {
  info: SetInfo;
  champions: Champion[];
  augments: Augment[];
  items: TFTItem[];
  specialItems: SpecialItem[];
  traits: Trait[];
  comps: Comp[];
  issues: string[];
}
import type { Augment } from "./Augment";
