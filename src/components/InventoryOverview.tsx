import { Check, PackageOpen, ShieldPlus, Swords, X } from "lucide-react";
import type { Champion } from "../types/Champion";
import type { SelectedItem } from "../types/Item";
import type { Trait } from "../types/Trait";

interface InventoryOverviewProps {
  champions: Champion[];
  items: SelectedItem[];
  traits: Trait[];
  onRemoveChampion: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export default function InventoryOverview({ champions, items, traits, onRemoveChampion, onRemoveItem }: InventoryOverviewProps) {
  const traitCounts = champions
    .flatMap((champion) => champion.traits)
    .reduce<Record<string, number>>((counts, trait) => ({ ...counts, [trait]: (counts[trait] ?? 0) + 1 }), {});
  const representedTraits = Object.entries(traitCounts)
    .map(([name, count]) => ({ name, count, trait: traits.find((entry) => entry.name === name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <section className="inventory-overview" aria-label="Current inventory summary">
      <div className="overview-column">
        <div className="overview-title"><Swords size={14} /><h2>Your team</h2><span>{champions.length}</span></div>
        <div className="overview-chip-list">
          {champions.length ? champions.map((champion) => (
            <button type="button" className="overview-chip champion" key={champion.id} onClick={() => onRemoveChampion(champion.id)} aria-label={`Remove ${champion.name}`}>
              <img src={champion.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} />
              <strong>{champion.name}</strong><X size={11} />
            </button>
          )) : <p className="overview-empty">Select champions below</p>}
        </div>
      </div>

      <div className="overview-column">
        <div className="overview-title"><PackageOpen size={14} /><h2>Your items</h2><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
        <div className="overview-chip-list">
          {items.length ? items.map((item) => (
            <button type="button" className="overview-chip item" key={item.id} onClick={() => onRemoveItem(item.id)} aria-label={`Remove one ${item.name}`}>
              <img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} />
              <strong>{item.name}</strong>{item.quantity > 1 && <b>×{item.quantity}</b>}<X size={11} />
            </button>
          )) : <p className="overview-empty">Add components or completed items</p>}
        </div>
      </div>

      <div className="overview-column traits-column">
        <div className="overview-title"><ShieldPlus size={14} /><h2>Current traits</h2><span>{representedTraits.length}</span></div>
        <div className="trait-count-list">
          {representedTraits.length ? representedTraits.slice(0, 10).map(({ name, count, trait }) => (
            <span key={name} className={count > 1 ? "active" : ""}>
              {trait?.image ? <img src={trait.image} alt="" loading="lazy" /> : <Check size={10} />}
              <strong>{name}</strong><b>{count}</b>
            </span>
          )) : <p className="overview-empty">Traits appear as you select units</p>}
        </div>
      </div>
    </section>
  );
}
