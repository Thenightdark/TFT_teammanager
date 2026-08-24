import { RotateCcw, Sparkles, Trash2 } from "lucide-react";

interface InventoryActionsProps {
  championCount: number;
  itemCount: number;
  onClearChampions: () => void;
  onClearItems: () => void;
  onResetAll: () => void;
  onStartNewGame: () => void;
}

export default function InventoryActions({ championCount, itemCount, onClearChampions, onClearItems, onResetAll, onStartNewGame }: InventoryActionsProps) {
  return (
    <div className="inventory-actions" aria-label="Reset controls">
      <button type="button" onClick={onClearChampions} disabled={!championCount}><Trash2 size={14} /> Clear champions</button>
      <button type="button" onClick={onClearItems} disabled={!itemCount}><Trash2 size={14} /> Clear items</button>
      <button type="button" onClick={onResetAll} disabled={!championCount && !itemCount}><RotateCcw size={14} /> Reset all</button>
      <button type="button" className="new-game-button" onClick={onStartNewGame}><Sparkles size={14} /> Start new game</button>
    </div>
  );
}
