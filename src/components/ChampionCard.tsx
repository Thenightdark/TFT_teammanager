import { Check } from "lucide-react";
import type { Champion } from "../types/Champion";

interface ChampionCardProps {
  champion: Champion;
  selected: boolean;
  onToggle: (champion: Champion) => void;
  showName: boolean;
}

const costNames = ["", "One", "Two", "Three", "Four", "Five"];

export default function ChampionCard({ champion, selected, onToggle, showName }: ChampionCardProps) {
  return (
    <button
      type="button"
      className={`champion-card cost-${champion.cost}${selected ? " is-selected" : ""}`}
      onClick={() => onToggle(champion)}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Select"} ${champion.name}, ${costNames[champion.cost]} cost`}
    >
      <span className="portrait-wrap">
        <img src={champion.image} alt="" draggable="false" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} />
        <span className="champion-initials" aria-hidden="true">
          {champion.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </span>
        <span className="cost-badge" aria-label={`${champion.cost} gold`}>
          <span className="gold-gem" /> {champion.cost}
        </span>
        <span className="selected-check"><Check size={14} strokeWidth={3} /></span>
      </span>
      {showName && <span className="card-copy"><strong>{champion.name}</strong><span>{champion.traits.join(" · ")}</span></span>}
    </button>
  );
}
