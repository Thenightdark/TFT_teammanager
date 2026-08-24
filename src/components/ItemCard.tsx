import { Minus, Plus } from "lucide-react";
import type { TFTItem } from "../types/Item";

interface ItemCardProps {
  item: TFTItem;
  quantity: number;
  onAdd: (item: TFTItem) => void;
  onRemove: (item: TFTItem) => void;
}

export default function ItemCard({ item, quantity, onAdd, onRemove }: ItemCardProps) {
  return (
    <div className={`item-card${quantity ? " is-selected" : ""}`}>
      <button type="button" className="item-add-button" onClick={() => onAdd(item)} aria-label={`Add ${item.name}`}>
        <span className="item-image-wrap">
          <img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} />
          <span className="item-glyph" aria-hidden="true">{item.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
          {quantity > 0 && <strong className="item-count">×{quantity}</strong>}
        </span>
        <span className="item-name">{item.name}</span>
        <small>{item.type === "component" ? "Component" : "Completed item"}</small>
        <span className="add-label"><Plus size={13} /> {item.type === "component" ? "Add one" : quantity ? "Selected" : "Select"}</span>
      </button>
      {quantity > 0 && (
        <button type="button" className="item-minus-button" onClick={() => onRemove(item)} aria-label={`Remove one ${item.name}`}>
          <Minus size={13} />
        </button>
      )}
    </div>
  );
}
