import type { TFTItem } from "../types/Item";
import ItemCard from "./ItemCard";

interface ItemGridProps {
  items: TFTItem[];
  quantities: Record<string, number>;
  onAdd: (item: TFTItem) => void;
  onRemove: (item: TFTItem) => void;
}

export default function ItemGrid({ items, quantities, onAdd, onRemove }: ItemGridProps) {
  return (
    <div className="item-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} quantity={quantities[item.id] ?? 0} onAdd={onAdd} onRemove={onRemove} />
      ))}
    </div>
  );
}
