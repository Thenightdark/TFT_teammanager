import type { Champion } from "../types/Champion";
import type { Comp } from "../types/Comp";

export interface BoardUnit {
  champion: Champion;
  row: number;
  column: number;
}

export interface PositioningPlan {
  id: "early" | "mid" | "late";
  label: string;
  stage: string;
  note: string;
  units: BoardUnit[];
}

export type BoardPosition = [row: number, column: number];

const positionsByRole: Record<NonNullable<Champion["role"]>, BoardPosition[]> = {
  frontline: [[0, 3], [0, 2], [0, 4], [0, 1], [0, 5], [0, 0], [0, 6], [1, 3]],
  "melee-carry": [[1, 2], [1, 4], [1, 3], [1, 1], [1, 5], [0, 2], [0, 4]],
  "backline-carry": [[3, 6], [3, 0], [3, 5], [3, 1], [3, 4], [3, 2], [3, 3]],
  support: [[2, 3], [2, 2], [2, 4], [2, 1], [2, 5], [3, 3], [3, 2], [3, 4]],
};

const fallbackPositions: BoardPosition[] = Array.from({ length: 4 }, (_, row) => Array.from({ length: 7 }, (_, column): BoardPosition => [row, column])).flat();

function roleOf(champion: Champion): NonNullable<Champion["role"]> {
  if (champion.role) return champion.role;
  return (champion.range ?? 1) >= 3 ? "backline-carry" : "frontline";
}

export function findOpenBoardPosition(champion: Champion, occupied: Set<string>): BoardPosition {
  const candidates = [...positionsByRole[roleOf(champion)], ...fallbackPositions];
  return candidates.find(([row, column]) => !occupied.has(`${row}-${column}`)) ?? [3, 3];
}

export function describeBoardPosition([row, column]: BoardPosition): string {
  const rowLabel = ["Front row", "Second row", "Third row", "Back row"][row] ?? `Row ${row + 1}`;
  const sideLabel = column <= 1 ? "left side" : column >= 5 ? "right side" : "center";
  return `${rowLabel} · ${sideLabel}`;
}

function stageRoster(comp: Comp, champions: Champion[], size: number): Champion[] {
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  return comp.units
    .map((id) => byId.get(id))
    .filter((champion): champion is Champion => Boolean(champion))
    .sort((a, b) => a.cost - b.cost || Number(comp.coreUnits.includes(b.id)) - Number(comp.coreUnits.includes(a.id)) || a.name.localeCompare(b.name))
    .slice(0, size);
}

function positionRoster(roster: Champion[], comp: Comp): BoardUnit[] {
  const used = new Set<string>();
  return [...roster]
    .sort((a, b) => Number(comp.carries.includes(b.id)) - Number(comp.carries.includes(a.id)) || b.cost - a.cost || a.name.localeCompare(b.name))
    .map((champion) => {
      const [row, column] = findOpenBoardPosition(champion, used);
      used.add(`${row}-${column}`);
      return { champion, row, column };
    });
}

export function createPositioningPlans(comp: Comp, champions: Champion[]): PositioningPlan[] {
  const definitions = [
    { id: "early" as const, label: "Plan 1", stage: "Stage 2 · Early", size: 4, note: "Use the lowest-cost core pieces and keep damage dealers protected." },
    { id: "mid" as const, label: "Plan 2", stage: "Stage 3 · Mid", size: 6, note: "Add secondary frontline and spread carries away from the main danger." },
    { id: "late" as const, label: "Plan 3", stage: "Stage 4+ · Late", size: comp.units.length, note: "Full-board default. Scout opponents and mirror the carry corner when needed." },
  ];
  return definitions.map((definition) => ({ ...definition, units: positionRoster(stageRoster(comp, champions, definition.size), comp) }));
}
