import { Coins, Route } from "lucide-react";
import type { TransitionStep } from "../utils/strategyPlanner";

interface TransitionGuideProps { steps: TransitionStep[]; expert: boolean; }

export default function TransitionGuide({ steps, expert }: TransitionGuideProps) {
  return (
    <section className="detail-panel transition-panel">
      <div className="detail-section-title"><Route size={17} /><h2>Game plan</h2><span>Early → final board</span></div>
      <div className="transition-grid">{steps.map((step, index) => <article key={step.stage}><span>{index + 1}</span><div><small>{step.stage}</small><h3>{step.title}</h3><div className="transition-units">{step.units.map((unit) => <b key={unit.id}>{unit.name}</b>)}</div><p>{step.instruction}</p>{expert && <p className="economy-note"><Coins size={13} />{step.economy}</p>}</div></article>)}</div>
    </section>
  );
}
