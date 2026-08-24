import { Grid2X2 } from "lucide-react";
import type { Champion } from "../types/Champion";
import type { ChampionGridSize, CostFilter } from "../types/UiState";
import ChampionGrid from "./ChampionGrid";
import SearchBar from "./SearchBar";

const costFilters: { label: string; value: CostFilter }[] = [
  { label: "All", value: "all" },
  { label: "1 Cost", value: 1 },
  { label: "2 Cost", value: 2 },
  { label: "3 Cost", value: 3 },
  { label: "4 Cost", value: 4 },
  { label: "5 Cost", value: 5 },
];

interface ChampionSelectorProps {
  champions: Champion[];
  selectedIds: Set<string>;
  search: string;
  costFilter: CostFilter;
  gridSize: ChampionGridSize;
  showNames: boolean;
  onSearchChange: (value: string) => void;
  onCostFilterChange: (filter: CostFilter) => void;
  onToggle: (champion: Champion) => void;
}

export default function ChampionSelector({ champions, selectedIds, search, costFilter, gridSize, showNames, onSearchChange, onCostFilterChange, onToggle }: ChampionSelectorProps) {
  return (
    <section className="roster-panel" aria-labelledby="roster-heading">
      <div className="roster-title"><div><Grid2X2 size={18} /><h2 id="roster-heading">Champion roster</h2><span>{champions.length}</span></div></div>
      <SearchBar value={search} onChange={onSearchChange} />
      <div className="filter-row" aria-label="Filter by champion cost">
        {costFilters.map((filter) => <button key={filter.label} type="button" className={costFilter === filter.value ? "active" : ""} onClick={() => onCostFilterChange(filter.value)}>{filter.label}</button>)}
      </div>
      <ChampionGrid champions={champions} selectedIds={selectedIds} onToggle={onToggle} size={gridSize} showNames={showNames} />
    </section>
  );
}
