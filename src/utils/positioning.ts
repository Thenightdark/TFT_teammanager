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
  if ((champion.range ?? 1) >= 3) return "backline-carry";
  if (champion.role === "support" && (champion.range ?? 1) <= 1) return "frontline";
  if (champion.role) return champion.role;
  return (champion.range ?? 1) >= 3 ? "backline-carry" : "frontline";
}

export function findOpenBoardPosition(champion: Champion, occupied: Set<string>, role = roleOf(champion)): BoardPosition {
  const candidates = [...positionsByRole[role], ...fallbackPositions];
  return candidates.find(([row, column]) => !occupied.has(`${row}-${column}`)) ?? [3, 3];
}

export function describeBoardPosition([row, column]: BoardPosition): string {
  const rowLabel = ["Front row", "Second row", "Third row", "Back row"][row] ?? `Row ${row + 1}`;
  const sideLabel = column <= 1 ? "left side" : column >= 5 ? "right side" : "center";
  return `${rowLabel} · ${sideLabel}`;
}

function stageRoster(comp: Comp, champions: Champion[], size: number, maxCost: number): Champion[] {
  const byId = new Map(champions.map((champion) => [champion.id, champion]));
  const finalUnits = comp.units
    .map((id) => byId.get(id))
    .filter((champion): champion is Champion => Boolean(champion))
    .filter((champion) => champion.cost <= maxCost)
    .sort((a, b) => a.cost - b.cost || Number(comp.coreUnits.includes(b.id)) - Number(comp.coreUnits.includes(a.id)) || a.name.localeCompare(b.name));
  const selected = finalUnits.slice(0, size);
  if (selected.length >= size) return selected;

  const targetTraits = new Set([...comp.traits, ...selected.flatMap((champion) => champion.traits)]);
  const needsFrontline = selected.filter((champion) => roleOf(champion) === "frontline").length < 2;
  const substitutes = champions
    .filter((champion) => champion.cost <= maxCost && !selected.some((unit) => unit.id === champion.id) && !comp.units.includes(champion.id))
    .map((champion) => ({
      champion,
      score: champion.traits.filter((trait) => targetTraits.has(trait)).length * 10
        + (needsFrontline && roleOf(champion) === "frontline" ? 7 : 0)
        - champion.cost,
    }))
    .sort((a, b) => b.score - a.score || a.champion.cost - b.champion.cost || a.champion.name.localeCompare(b.champion.name));
  selected.push(...substitutes.slice(0, size - selected.length).map((entry) => entry.champion));
  return selected;
}

function positionRoster(roster: Champion[], comp: Comp): BoardUnit[] {
  const used = new Set<string>();
  const itemRole = new Map(comp.recommendedItems.map((group) => [group.champion, group.role]));
  const boardRole = (champion: Champion): NonNullable<Champion["role"]> => {
    const role = itemRole.get(champion.id);
    if (champion.id === comp.mainTank || role === "main-tank" || role === "secondary-tank") return "frontline";
    return roleOf(champion);
  };
  const priority = (champion: Champion) => champion.id === comp.mainTank
    ? 4
    : itemRole.get(champion.id) === "secondary-tank"
      ? 3
      : comp.carries.includes(champion.id)
        ? 2
        : boardRole(champion) === "frontline"
          ? 1
          : 0;
  return [...roster]
    .sort((a, b) => priority(b) - priority(a) || b.cost - a.cost || a.name.localeCompare(b.name))
    .map((champion) => {
      const requested = comp.boardPositions?.[champion.id];
      const [row, column] = requested && !used.has(`${requested[0]}-${requested[1]}`)
        ? requested
        : findOpenBoardPosition(champion, used, boardRole(champion));
      used.add(`${row}-${column}`);
      return { champion, row, column };
    });
}

export function createPositioningPlans(comp: Comp, champions: Champion[]): PositioningPlan[] {
  const definitions = [
    { id: "early" as const, label: "Plan 1", stage: "Stage 2 · Early", size: 4, maxCost: 3, note: "Realistic low-cost opener only: use 1–3 cost units and keep damage dealers protected." },
    { id: "mid" as const, label: "Plan 2", stage: "Stage 3 · Mid", size: 6, maxCost: 4, note: "Add secondary frontline and transition toward the final board without relying on 5-cost units." },
    { id: "late" as const, label: "Plan 3", stage: "Stage 4+ · Late", size: comp.units.length, maxCost: 5, note: comp.positioningNote ?? "Full-board default. Scout opponents and mirror the carry corner when needed." },
  ];
  return definitions.map(({ maxCost, ...definition }) => ({ ...definition, units: positionRoster(stageRoster(comp, champions, definition.size, maxCost), comp) }));
}
