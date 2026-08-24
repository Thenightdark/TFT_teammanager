import { Crown, LayoutGrid, ListOrdered, Maximize2, Search, Shield, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Champion } from "../types/Champion";
import type { SpecialItem, SpecialItemCategory } from "../types/SpecialItem";
import { getSpecialItemTier, specialItemTierLabels, specialItemTierSource, type SpecialItemTier } from "../utils/specialItemTiers";

type SpecialFilter = "all" | SpecialItemCategory;

interface SpecialItemGuideProps {
  items: SpecialItem[];
  champions: Champion[];
  selectedChampionIds: Set<string>;
}

const filters: { value: SpecialFilter; label: string }[] = [
  { value: "all", label: "All special items" },
  { value: "radiant", label: "Radiant" },
  { value: "artifact", label: "Artifacts" },
];

export default function SpecialItemGuide({ items, champions, selectedChampionIds }: SpecialItemGuideProps) {
  const [filter, setFilter] = useState<SpecialFilter>("all");
  const [search, setSearch] = useState("");
  const [cardSize, setCardSize] = useState<"comfortable" | "large">("large");
  const [view, setView] = useState<"guide" | "tiers">("guide");
  const championById = useMemo(() => new Map(champions.map((champion) => [champion.id, champion])), [champions]);
  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => (filter === "all" || item.category === filter) && (!query || item.name.toLowerCase().includes(query) || item.fitReason.toLowerCase().includes(query) || (item.description ?? "").toLowerCase().includes(query)));
  }, [filter, items, search]);
  const tierOrder: SpecialItemTier[] = ["S", "A", "B", "C", "D", "F", "U"];

  return (
    <section className="roster-panel special-guide" aria-labelledby="special-items-heading">
      <div className="roster-title"><div><Crown size={18} /><h2 id="special-items-heading">Radiant &amp; Artifact guide</h2><span>{visibleItems.length}</span></div></div>
      <p className="special-guide-intro">Suggested holders are based on each item’s effect and champion role. Switch to Stats tier list for current performance rankings.</p>
      <div className="special-view-toggle" aria-label="Special item view">
        <button type="button" className={view === "guide" ? "active" : ""} onClick={() => setView("guide")}><LayoutGrid size={15} /> Holder guide</button>
        <button type="button" className={view === "tiers" ? "active" : ""} onClick={() => setView("tiers")}><ListOrdered size={15} /> Stats tier list</button>
      </div>
      <div className="special-guide-tools">
        <label className="special-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search special items..." aria-label="Search Radiant and Artifact items" /></label>
        <div className="item-filter-row" aria-label="Filter special item type">{filters.map((entry) => <button type="button" key={entry.value} className={filter === entry.value ? "active" : ""} onClick={() => setFilter(entry.value)}>{entry.label}</button>)}</div>
        {view === "guide" && <div className="special-size-toggle" aria-label="Special item card size"><Maximize2 size={14} /><button type="button" className={cardSize === "comfortable" ? "active" : ""} onClick={() => setCardSize("comfortable")}>Comfortable</button><button type="button" className={cardSize === "large" ? "active" : ""} onClick={() => setCardSize("large")}>Large</button></div>}
      </div>
      {view === "tiers" && <div className="special-tier-source"><strong>Set 17 stats snapshot</strong><span>Updated {specialItemTierSource.updated} · tiers are based on overall ranked results, not a promise that every item fits every holder.</span></div>}
      {visibleItems.length && view === "guide" ? <div className={`special-item-grid ${cardSize}`}>
        {visibleItems.map((item) => {
          const selectedHolder = item.recommendedChampionIds.find((id) => selectedChampionIds.has(id));
          const selectedChampion = selectedHolder ? championById.get(selectedHolder) : undefined;
          return (
          <article className={`special-item-card ${item.category}`} key={item.id}>
            <header>
              <img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} />
              <div><span>{item.category === "radiant" ? <Sparkles size={11} /> : <Shield size={11} />}{item.category}</span><h3>{item.name}</h3><p>{item.fitReason}</p></div>
            </header>
            <p className="special-item-description">{item.description || "No effect description is available for this item."}</p>
            {selectedChampion ? <div className="selected-holder-callout"><img src={selectedChampion.image} alt="" /><span><small>Best holder from your champions</small><strong>{selectedChampion.name}</strong></span></div> : <div className="selected-holder-empty">Select champions in the Champions tab to get a personal holder.</div>}
            <div className="holder-heading"><strong>Suggested holders</strong><small>Best fit first</small></div>
            <div className="holder-list">
              {item.recommendedChampionIds.slice(0, 5).map((id, index) => {
                const champion = championById.get(id);
                if (!champion) return null;
                return <span className={index === 0 ? "best" : ""} key={id}><img src={champion.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} /><b>{champion.name}</b>{index === 0 && <small>Best</small>}</span>;
              })}
            </div>
          </article>
        );})}
      </div> : null}
      {visibleItems.length && view === "tiers" ? <div className="special-tier-list">
        {tierOrder.map((tier) => {
          const tierItems = visibleItems.filter((item) => getSpecialItemTier(item) === tier);
          if (!tierItems.length) return null;
          return <section className={`special-tier-row tier-${tier.toLowerCase()}`} key={tier} aria-label={`${tier} tier special items`}>
            <header><strong>{tier}</strong><span>{specialItemTierLabels[tier]}</span><small>{tierItems.length}</small></header>
            <div>{tierItems.map((item) => {
              const selectedHolderId = item.recommendedChampionIds.find((id) => selectedChampionIds.has(id));
              const holder = championById.get(selectedHolderId ?? item.recommendedChampionIds[0]);
              return <article key={item.id} className={item.category}><img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/items/placeholder.svg"; }} /><span><strong>{item.name}</strong><small>{selectedHolderId ? `Your holder: ${holder?.name ?? "Unknown"}` : `Best holder: ${holder?.name ?? "No holder data"}`}</small></span><b>{item.category === "radiant" ? "Radiant" : "Artifact"}</b></article>;
            })}</div>
          </section>;
        })}
      </div> : null}
      {!visibleItems.length && <div className="empty-results"><span>?</span><strong>No special items found</strong><p>Try another name or category.</p></div>}
    </section>
  );
}
