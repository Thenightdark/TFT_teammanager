export type ItemType = "component" | "completed";

export interface TFTItem {
  id: string;
  apiName?: string;
  name: string;
  type: ItemType;
  image: string;
  components?: string[];
}

export interface SelectedItem extends TFTItem {
  quantity: number;
}
