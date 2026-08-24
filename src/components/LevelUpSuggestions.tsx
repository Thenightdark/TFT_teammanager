import { Plus, Shield, TrendingUp } from "lucide-react";
import type { LevelUpSuggestion } from "../utils/strategyPlanner";

interface LevelUpSuggestionsProps { suggestions: LevelUpSuggestion[]; }

export default function LevelUpSuggestions({ suggestions }: LevelUpSuggestionsProps) {
  if (!suggestions.length) return null;
  return <section className="detail-panel level-up-panel"><div className="detail-section-title"><TrendingUp size={17} /><h2>Level 9 &amp; 10 additions</h2><span>Units + positioning</span></div><p className="augment-disclaimer">After the listed team is complete, add these units in order. Each card shows the full suggested board at that level.</p><div className="level-up-grid">{suggestions.map(({ level, champion, reason, positionLabel, boardUnits, summons }) => {
    const unitMap = new Map(boardUnits.map((unit) => [`${unit.row}-${unit.column}`, unit]));
    const summonMap = new Map(summons.map((summon) => [`${summon.position[0]}-${summon.position[1]}`, summon]));
    return <article key={level}>
      <div className="level-up-summary"><span className="level-chip">Level {level}</span><Plus size={16} /><img src={champion.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} /><div><strong>{champion.name}</strong><small>{champion.traits.join(" · ")}</small><b>{positionLabel}</b><p>{reason}</p></div></div>
      <div className="level-position-board" aria-label={`Level ${level} positioning plan`}>{Array.from({ length: 4 }, (_, row) => Array.from({ length: 7 }, (_, column) => {
        const key = `${row}-${column}`;
        const unit = unitMap.get(key);
        const isAddition = unit?.champion.id === champion.id;
        const boardSummon = summonMap.get(key);
        return <span style={{ gridColumnStart: column * 2 + (row % 2) + 1, gridRowStart: row + 1 }} className={`level-position-hex${unit ? " occupied" : ""}${isAddition ? " addition" : ""}${boardSummon ? ` summon ${boardSummon.kind}` : ""}`} title={boardSummon?.name ?? unit?.champion.name} key={key}>{unit && <img src={unit.champion.image} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/champions/placeholder.svg"; }} />}{boardSummon?.kind === "relic" && <Shield size={13} />}{boardSummon?.kind === "shepherd" && <b className="summon-initial">{boardSummon.name.slice(0, 2)}</b>}</span>;
      })).flat()}</div>
      <div className="level-position-legend"><span><i className="addition" />Add {champion.name}: {positionLabel}</span>{summons.map((summon) => <span className={`summon-note ${summon.kind}`} key={summon.name}>{summon.kind === "relic" ? <Shield size={13} /> : <b className="summon-note-initial">{summon.name.slice(0, 2)}</b>}<strong>{summon.name}: {summon.positionLabel}</strong><small>{summon.note}</small></span>)}</div>
    </article>;
  })}</div></section>;
}
