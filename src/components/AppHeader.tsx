import { Hexagon, Settings, Sparkles } from "lucide-react";
import type { SetInfo } from "../types/Set";

interface AppHeaderProps {
  sets: SetInfo[];
  activeSetId: string;
  onSetChange: (setId: string) => void;
  onOpenSettings: () => void;
}

export default function AppHeader({ sets, activeSetId, onSetChange, onOpenSettings }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark"><Hexagon size={28} /><Sparkles size={13} /></span>
        <div><strong>TACTICIAN</strong><span>TEAM HELPER</span></div>
      </div>
      <label className="set-pill">
        <span>SET</span>
        <select value={activeSetId} onChange={(event) => onSetChange(event.target.value)} aria-label="Active TFT set">
          {sets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
        </select>
        <i />
      </label>
      <button type="button" className="icon-button" aria-label="Open settings" onClick={onOpenSettings}><Settings size={19} /></button>
    </header>
  );
}
