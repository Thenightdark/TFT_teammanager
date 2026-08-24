import { RotateCcw, Settings, X } from "lucide-react";
import type { SetInfo } from "../types/Set";
import type { ChampionGridSize, DisplayMode } from "../types/UiState";

interface SettingsMenuProps {
  open: boolean;
  sets: SetInfo[];
  activeSetId: string;
  gridSize: ChampionGridSize;
  showChampionNames: boolean;
  displayMode: DisplayMode;
  onClose: () => void;
  onSetChange: (setId: string) => void;
  onGridSizeChange: (size: ChampionGridSize) => void;
  onShowChampionNamesChange: (show: boolean) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onResetSavedData: () => void;
}

export default function SettingsMenu({ open, sets, activeSetId, gridSize, showChampionNames, displayMode, onClose, onSetChange, onGridSizeChange, onShowChampionNamesChange, onDisplayModeChange, onResetSavedData }: SettingsMenuProps) {
  if (!open) return null;
  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="settings-menu" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header><div><Settings size={18} /><h2 id="settings-title">Settings</h2></div><button type="button" onClick={onClose} aria-label="Close settings"><X size={18} /></button></header>
        <label><span>Current TFT set</span><select value={activeSetId} onChange={(event) => onSetChange(event.target.value)}>{sets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}</select></label>
        <label><span>Champion grid size</span><select value={gridSize} onChange={(event) => onGridSizeChange(event.target.value as ChampionGridSize)}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label>
        <label><span>Guide detail</span><select value={displayMode} onChange={(event) => onDisplayModeChange(event.target.value as DisplayMode)}><option value="beginner">Beginner · explanations</option><option value="expert">Expert · economy details</option></select></label>
        <label className="toggle-setting"><span><strong>Show champion names</strong><small>Display names and traits below portraits</small></span><input type="checkbox" checked={showChampionNames} onChange={(event) => onShowChampionNamesChange(event.target.checked)} /></label>
        <button type="button" className="reset-saved-button" onClick={onResetSavedData}><RotateCcw size={15} /> Reset saved data</button>
      </section>
    </div>
  );
}
