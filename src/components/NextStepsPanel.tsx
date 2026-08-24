import { ListChecks } from "lucide-react";

interface NextStepsPanelProps { steps: string[]; }

export default function NextStepsPanel({ steps }: NextStepsPanelProps) {
  return <section className="detail-panel next-steps-panel"><div className="detail-section-title"><ListChecks size={17} /><h2>What should I do next?</h2></div><ol>{steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></section>;
}
