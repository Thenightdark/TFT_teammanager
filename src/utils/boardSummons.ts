import type { BoardPosition, BoardUnit } from "./positioning";
import { describeBoardPosition } from "./positioning";

export interface BoardSummon {
  name: "Bulwark Relic" | "Bia" | "Bayin";
  kind: "relic" | "shepherd";
  position: BoardPosition;
  positionLabel: string;
  note: string;
}

const allPositions: BoardPosition[] = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 7 }, (_, column): BoardPosition => [row, column]),
).flat();

function findOpenPosition(occupied: Set<string>, preferred: BoardPosition[]): BoardPosition {
  return [...preferred, ...allPositions].find(([row, column]) => !occupied.has(`${row}-${column}`)) ?? [3, 3];
}

function reserveSummon(
  summons: BoardSummon[],
  occupied: Set<string>,
  name: BoardSummon["name"],
  kind: BoardSummon["kind"],
  preferred: BoardPosition[],
  note: string,
) {
  const position = findOpenPosition(occupied, preferred.filter(([row, column]) => row >= 0 && row < 4 && column >= 0 && column < 7));
  occupied.add(`${position[0]}-${position[1]}`);
  summons.push({ name, kind, position, positionLabel: describeBoardPosition(position), note });
}

export function createBoardSummons(boardUnits: BoardUnit[]): BoardSummon[] {
  const occupied = new Set(boardUnits.map((unit) => `${unit.row}-${unit.column}`));
  const summons: BoardSummon[] = [];
  const shen = boardUnits.find((unit) => unit.champion.id === "tft-17-shen");

  if (shen) {
    reserveSummon(
      summons,
      occupied,
      "Bulwark Relic",
      "relic",
      [
        [shen.row + 1, shen.column],
        [shen.row + 1, shen.column - 1],
        [shen.row, shen.column + 1],
        [shen.row, shen.column - 1],
        [shen.row - 1, shen.column],
        [shen.row - 1, shen.column - 1],
      ],
      "Shen summons this placeable relic. Keep it next to Shen and adjacent to allies so its opening shield and Attack Speed reach them.",
    );
  }

  const shepherdCount = boardUnits.filter((unit) => unit.champion.traits.includes("Shepherd")).length;
  if (shepherdCount >= 3) {
    reserveSummon(
      summons,
      occupied,
      "Bia",
      "shepherd",
      [[1, 3], [1, 2], [1, 4], [2, 3], [2, 2], [2, 4]],
      `Unlocked by ${shepherdCount} Shepherds. Bia is an additional summoned unit and does not replace a champion in the lineup.`,
    );
  }
  if (shepherdCount >= 5) {
    reserveSummon(
      summons,
      occupied,
      "Bayin",
      "shepherd",
      [[2, 3], [2, 4], [2, 2], [3, 3], [3, 4], [3, 2]],
      `Unlocked by ${shepherdCount} Shepherds. Bayin joins Bia as an additional summoned unit; at 7 Shepherds their bond becomes stronger.`,
    );
  }

  return summons;
}
