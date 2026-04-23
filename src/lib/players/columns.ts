import type { Goalie, Skater } from "./types";

export type ColumnFormat =
  | "int"
  | "float1"
  | "float2"
  | "float3"
  | "pct1"
  | "plusMinus"
  | "mmss";

export type PlayerColumn<T> = {
  id: string;
  label: string;
  tooltip: string;
  get: (p: T) => number;
  format: ColumnFormat;
  higherIsBetter?: boolean;
};

export const SKATER_COLUMNS: PlayerColumn<Skater>[] = [
  {
    id: "gamesPlayed",
    label: "GP",
    tooltip: "Games played with this team this season.",
    get: (p) => p.gamesPlayed,
    format: "int",
  },
  {
    id: "goals",
    label: "G",
    tooltip: "Goals scored.",
    get: (p) => p.goals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "assists",
    label: "A",
    tooltip: "Assists (primary + secondary).",
    get: (p) => p.assists,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "points",
    label: "Pts",
    tooltip: "Points = goals + assists.",
    get: (p) => p.points,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "plusMinus",
    label: "+/-",
    tooltip:
      "On-ice goal differential at even strength and short-handed (excludes power-play goals for).",
    get: (p) => p.plusMinus,
    format: "plusMinus",
    higherIsBetter: true,
  },
  {
    id: "penaltyMinutes",
    label: "PIM",
    tooltip: "Penalty minutes taken.",
    get: (p) => p.penaltyMinutes,
    format: "int",
  },
  {
    id: "powerPlayGoals",
    label: "PPG",
    tooltip: "Goals scored on the power play.",
    get: (p) => p.powerPlayGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shorthandedGoals",
    label: "SHG",
    tooltip: "Short-handed goals scored.",
    get: (p) => p.shorthandedGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "gameWinningGoals",
    label: "GWG",
    tooltip: "Game-winning goals — goals that stood as the winner.",
    get: (p) => p.gameWinningGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "overtimeGoals",
    label: "OTG",
    tooltip: "Overtime goals scored.",
    get: (p) => p.overtimeGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shots",
    label: "SOG",
    tooltip: "Shots on goal.",
    get: (p) => p.shots,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shootingPct",
    label: "S%",
    tooltip: "Shooting percentage — goals divided by shots on goal.",
    get: (p) => p.shootingPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "avgTimeOnIcePerGame",
    label: "TOI/GP",
    tooltip: "Average time on ice per game (MM:SS).",
    get: (p) => p.avgTimeOnIcePerGame,
    format: "mmss",
    higherIsBetter: true,
  },
  {
    id: "avgShiftsPerGame",
    label: "Shf/GP",
    tooltip: "Average number of shifts per game.",
    get: (p) => p.avgShiftsPerGame,
    format: "float1",
    higherIsBetter: true,
  },
  {
    id: "faceoffWinPct",
    label: "FOW%",
    tooltip:
      "Faceoff win percentage. Near 0% for players who rarely take draws.",
    get: (p) => p.faceoffWinPct,
    format: "pct1",
    higherIsBetter: true,
  },
];

export const GOALIE_COLUMNS: PlayerColumn<Goalie>[] = [
  {
    id: "gamesPlayed",
    label: "GP",
    tooltip: "Games played with this team this season.",
    get: (p) => p.gamesPlayed,
    format: "int",
  },
  {
    id: "gamesStarted",
    label: "GS",
    tooltip: "Games started (the goalie was in net for the opening faceoff).",
    get: (p) => p.gamesStarted,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "wins",
    label: "W",
    tooltip: "Wins credited to the goalie.",
    get: (p) => p.wins,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "losses",
    label: "L",
    tooltip: "Regulation losses.",
    get: (p) => p.losses,
    format: "int",
  },
  {
    id: "overtimeLosses",
    label: "OTL",
    tooltip: "Overtime / shootout losses.",
    get: (p) => p.overtimeLosses,
    format: "int",
  },
  {
    id: "goalsAgainstAverage",
    label: "GAA",
    tooltip:
      "Goals-against average — goals allowed per 60 minutes of play. Lower is better.",
    get: (p) => p.goalsAgainstAverage,
    format: "float2",
  },
  {
    id: "savePercentage",
    label: "SV%",
    tooltip: "Save percentage — saves ÷ shots faced.",
    get: (p) => p.savePercentage,
    format: "float3",
    higherIsBetter: true,
  },
  {
    id: "shotsAgainst",
    label: "SA",
    tooltip: "Total shots faced.",
    get: (p) => p.shotsAgainst,
    format: "int",
  },
  {
    id: "saves",
    label: "SV",
    tooltip: "Total saves made.",
    get: (p) => p.saves,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "goalsAgainst",
    label: "GA",
    tooltip: "Total goals allowed.",
    get: (p) => p.goalsAgainst,
    format: "int",
  },
  {
    id: "shutouts",
    label: "SO",
    tooltip: "Shutouts — wins in which no goals were allowed.",
    get: (p) => p.shutouts,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "goals",
    label: "G",
    tooltip: "Goals scored by the goalie.",
    get: (p) => p.goals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "assists",
    label: "A",
    tooltip: "Assists credited to the goalie.",
    get: (p) => p.assists,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "points",
    label: "Pts",
    tooltip: "Points = goals + assists.",
    get: (p) => p.points,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "penaltyMinutes",
    label: "PIM",
    tooltip: "Penalty minutes taken.",
    get: (p) => p.penaltyMinutes,
    format: "int",
  },
  {
    id: "timeOnIce",
    label: "TOI",
    tooltip: "Total time on ice (MM:SS).",
    get: (p) => p.timeOnIce,
    format: "mmss",
    higherIsBetter: true,
  },
];

export function formatPlayerValue(
  value: number,
  format: ColumnFormat,
): string {
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "int":
      return String(Math.round(value));
    case "float1":
      return value.toFixed(1);
    case "float2":
      return value.toFixed(2);
    case "float3":
      return value.toFixed(3);
    case "pct1":
      return `${(value * 100).toFixed(1)}%`;
    case "plusMinus":
      return value > 0 ? `+${value}` : String(value);
    case "mmss": {
      const total = Math.round(value);
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }
  }
}
