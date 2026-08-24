import { Boxes, Sparkles } from "lucide-react";
import type { TFTItem } from "../types/Item";
import type { ItemFilter } from "../types/UiState";
import ItemGrid from "./ItemGrid";

const itemFilters: { label: string; value: ItemFilter }[] = [
  { label: "All items", value: "all" },
  { label: "Components", value: "component" },
  { label: "Completed", value: "completed" },
];

interface ItemSelectorProps {
  items: TFTItem[];
  filter: ItemFilter;
  quantities: Record<string, number>;
  onFilterChange: (filter: ItemFilter) => void;
  onAdd: (item: TFTItem) => void;
  onRemove: (item: TFTItem) => void;
}

export default function ItemSelector({ items, filter, quantities, onFilterChange, onAdd, onRemove }: ItemSelectorProps) {
  const components = items.filter((item) => item.type === "component");
  const completed = items.filter((item) => item.type === "completed");
  return (
    <section className="roster-panel item-selector-panel" aria-labelledby="item-selector-heading">
      <div className="roster-title"><div><Boxes size={18} /><h2 id="item-selector-heading">Item selector</h2><span>{items.length}</span></div></div>
      <div className="item-filter-row" aria-label="Filter by item type">
        {itemFilters.map((entry) => <button type="button" key={entry.value} className={filter === entry.value ? "active" : ""} onClick={() => onFilterChange(entry.value)}>{entry.label}</button>)}
      </div>
      {(filter === "all" || filter === "component") && <section className="item-section" aria-labelledby="components-heading"><div className="item-section-title"><div><span className="component-dot" /><h3 id="components-heading">Item components</h3></div><p>Click repeatedly to add duplicates</p></div><ItemGrid items={components} quantities={quantities} onAdd={onAdd} onRemove={onRemove} /></section>}
      {(filter === "all" || filter === "completed") && <section className="item-section" aria-labelledby="completed-heading"><div className="item-section-title"><div><Sparkles size={14} /><h3 id="completed-heading">Completed items</h3></div><p>Click to select or deselect</p></div><ItemGrid items={completed} quantities={quantities} onAdd={onAdd} onRemove={onRemove} /></section>}
    </section>
  );
}
