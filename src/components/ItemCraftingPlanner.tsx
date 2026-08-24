import { Check, Hammer, Hourglass, PackageX } from "lucide-react";
import type { ItemPlanEntry } from "../utils/strategyPlanner";
import type { SelectedItem } from "../types/Item";

interface ItemCraftingPlannerProps { plan: ItemPlanEntry[]; selectedItems: SelectedItem[]; }

const statusCopy: Record<ItemPlanEntry["status"], string> = {
  owned: "Already owned",
  "craft-now": "Craft now",
  "missing-one": "Save one component",
  unavailable: "Future target",
};

export default function ItemCraftingPlanner({ plan, selectedItems }: ItemCraftingPlannerProps) {
  const used = plan.flatMap((entry) => entry.usedComponents.map((item) => item.id));
  const leftovers = selectedItems.filter((item) => item.type === "component").flatMap((item) => Array.from({ length: Math.max(0, item.quantity - used.filter((id) => id === item.id).length) }, () => item));
  return (
    <section className="detail-panel crafting-panel">
      <div className="detail-section-title"><Hammer size={17} /><h2>Item crafting plan</h2><span>{plan.filter((entry) => entry.status === "craft-now").length} ready</span></div>
      <p className="augment-disclaimer">Your components are consumed once in this plan, so the same Sword or Bow is never promised twice.</p>
      <div className="crafting-grid">
        {plan.map((entry) => (
          <article key={`${entry.holder.id}-${entry.item.id}`} className={`craft-${entry.status}`}>
            <img src={entry.item.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} />
            <div><strong>{entry.item.name}</strong><span>Final holder: {entry.holder.name}</span><small>{entry.status === "missing-one" ? `Need ${entry.missingComponents.map((item) => item.name).join(" + ")}` : entry.components.length ? entry.components.map((item) => item.name).join(" + ") : "Completed item"}</small>{entry.temporaryHolder && <small>Temporary holder: {entry.temporaryHolder.name}</small>}{entry.alternatives.length > 0 && <small>Alternatives: {entry.alternatives.map((item) => item.name).join(" or ")}</small>}</div>
            <b>{entry.status === "owned" ? <Check size={14} /> : entry.status === "craft-now" ? <Hammer size={14} /> : entry.status === "missing-one" ? <Hourglass size={14} /> : <PackageX size={14} />}{statusCopy[entry.status]}</b>
          </article>
        ))}
      </div>
      {!!leftovers.length && <div className="component-leftovers"><strong>Components left after this plan</strong><span>{leftovers.map((item, index) => <b key={`${item.id}-${index}`}>{item.name}</b>)}</span></div>}
    </section>
  );
}
