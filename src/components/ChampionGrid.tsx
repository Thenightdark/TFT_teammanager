import type { Champion } from "../types/Champion";
import ChampionCard from "./ChampionCard";

interface ChampionGridProps {
  champions: Champion[];
  selectedIds: Set<string>;
  onToggle: (champion: Champion) => void;
  size: "small" | "medium" | "large";
  showNames: boolean;
}

export default function ChampionGrid({ champions, selectedIds, onToggle, size, showNames }: ChampionGridProps) {
  if (!champions.length) {
    return (
      <div className="empty-results">
        <span>?</span>
        <strong>No champions found</strong>
        <p>Try another name, trait, or cost.</p>
      </div>
    );
  }

  return (
    <div className={`champion-grid grid-${size}${showNames ? "" : " hide-names"}`}>
      {champions.map((champion) => (
        <ChampionCard
          key={champion.id}
          champion={champion}
          selected={selectedIds.has(champion.id)}
          onToggle={onToggle}
          showName={showNames}
        />
      ))}
    </div>
  );
}
