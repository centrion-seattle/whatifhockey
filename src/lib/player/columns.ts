import type {
  GoalieGameLogRow,
  PlayerSeasonTotal,
  SkaterGameLogRow,
  SkaterSeasonTotal,
} from "./types";

export type ColumnFormat =
  | "int"
  | "float1"
  | "float2"
  | "float3"
  | "pct1"
  | "plusMinus"
  | "mmss"
  | "string"
  | "savePct";

export type PlayerTableColumn<T> = {
  id: string;
  label: string;
  tooltip: string;
  get: (row: T) => number | string;
  format: ColumnFormat;
  higherIsBetter?: boolean;
  /** align right unless explicitly left */
  align?: "left" | "right";
};

export const SKATER_SEASON_COLUMNS: PlayerTableColumn<SkaterSeasonTotal>[] = [
  {
    id: "teamName",
    label: "Team",
    tooltip: "Club the player was on that season.",
    get: (r) => r.teamName,
    format: "string",
    align: "left",
  },
  {
    id: "leagueAbbrev",
    label: "League",
    tooltip: "League the player competed in (NHL, AHL, etc.).",
    get: (r) => r.leagueAbbrev,
    format: "string",
    align: "left",
  },
  {
    id: "gamesPlayed",
    label: "GP",
    tooltip: "Games played that season.",
    get: (r) => r.gamesPlayed,
    format: "int",
  },
  {
    id: "goals",
    label: "G",
    tooltip: "Goals scored.",
    get: (r) => r.goals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "assists",
    label: "A",
    tooltip: "Assists (primary + secondary).",
    get: (r) => r.assists,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "points",
    label: "Pts",
    tooltip: "Points = goals + assists.",
    get: (r) => r.points,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "plusMinus",
    label: "+/-",
    tooltip: "On-ice even-strength and short-handed goal differential.",
    get: (r) => r.plusMinus,
    format: "plusMinus",
    higherIsBetter: true,
  },
  {
    id: "pim",
    label: "PIM",
    tooltip: "Penalty minutes.",
    get: (r) => r.pim,
    format: "int",
  },
  {
    id: "powerPlayGoals",
    label: "PPG",
    tooltip: "Power-play goals.",
    get: (r) => r.powerPlayGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "powerPlayPoints",
    label: "PPP",
    tooltip: "Power-play points.",
    get: (r) => r.powerPlayPoints,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shorthandedGoals",
    label: "SHG",
    tooltip: "Short-handed goals.",
    get: (r) => r.shorthandedGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "gameWinningGoals",
    label: "GWG",
    tooltip: "Game-winning goals.",
    get: (r) => r.gameWinningGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "otGoals",
    label: "OTG",
    tooltip: "Overtime goals.",
    get: (r) => r.otGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shots",
    label: "SOG",
    tooltip: "Shots on goal.",
    get: (r) => r.shots,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shootingPct",
    label: "S%",
    tooltip: "Shooting percentage — goals divided by shots on goal.",
    get: (r) => r.shootingPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "avgToiSeconds",
    label: "TOI/GP",
    tooltip: "Average time on ice per game (MM:SS).",
    get: (r) => r.avgToiSeconds,
    format: "mmss",
    higherIsBetter: true,
  },
];

export const GOALIE_SEASON_COLUMNS: PlayerTableColumn<PlayerSeasonTotal>[] = [
  {
    id: "teamName",
    label: "Team",
    tooltip: "Club the player was on that season.",
    get: (r) => r.teamName,
    format: "string",
    align: "left",
  },
  {
    id: "leagueAbbrev",
    label: "League",
    tooltip: "League the player competed in.",
    get: (r) => r.leagueAbbrev,
    format: "string",
    align: "left",
  },
  {
    id: "gamesPlayed",
    label: "GP",
    tooltip: "Games played.",
    get: (r) => r.gamesPlayed,
    format: "int",
  },
  {
    id: "gamesStarted",
    label: "GS",
    tooltip: "Games started (in net for opening faceoff).",
    get: (r) => (r.kind === "goalie" ? r.gamesStarted : 0),
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "wins",
    label: "W",
    tooltip: "Wins credited.",
    get: (r) => (r.kind === "goalie" ? r.wins : 0),
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "losses",
    label: "L",
    tooltip: "Regulation losses.",
    get: (r) => (r.kind === "goalie" ? r.losses : 0),
    format: "int",
  },
  {
    id: "otLosses",
    label: "OTL",
    tooltip: "Overtime/shootout losses.",
    get: (r) => (r.kind === "goalie" ? r.otLosses : 0),
    format: "int",
  },
  {
    id: "gaa",
    label: "GAA",
    tooltip: "Goals against average. Lower is better.",
    get: (r) => (r.kind === "goalie" ? r.goalsAgainstAvg : 0),
    format: "float2",
  },
  {
    id: "svPct",
    label: "SV%",
    tooltip: "Save percentage — saves ÷ shots faced.",
    get: (r) => (r.kind === "goalie" ? r.savePct : 0),
    format: "savePct",
    higherIsBetter: true,
  },
  {
    id: "shutouts",
    label: "SO",
    tooltip: "Shutouts.",
    get: (r) => (r.kind === "goalie" ? r.shutouts : 0),
    format: "int",
    higherIsBetter: true,
  },
];

export const SKATER_GAME_LOG_COLUMNS: PlayerTableColumn<SkaterGameLogRow>[] = [
  {
    id: "goals",
    label: "G",
    tooltip: "Goals scored in the game.",
    get: (r) => r.goals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "assists",
    label: "A",
    tooltip: "Assists.",
    get: (r) => r.assists,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "points",
    label: "P",
    tooltip: "Points.",
    get: (r) => r.points,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "plusMinus",
    label: "+/-",
    tooltip: "On-ice goal differential.",
    get: (r) => r.plusMinus,
    format: "plusMinus",
    higherIsBetter: true,
  },
  {
    id: "shots",
    label: "SOG",
    tooltip: "Shots on goal.",
    get: (r) => r.shots,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "powerPlayGoals",
    label: "PPG",
    tooltip: "Power-play goals.",
    get: (r) => r.powerPlayGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shorthandedGoals",
    label: "SHG",
    tooltip: "Short-handed goals.",
    get: (r) => r.shorthandedGoals,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "pim",
    label: "PIM",
    tooltip: "Penalty minutes.",
    get: (r) => r.pim,
    format: "int",
  },
  {
    id: "toi",
    label: "TOI",
    tooltip: "Time on ice (MM:SS).",
    get: (r) => r.toi,
    format: "string",
  },
];

export const GOALIE_GAME_LOG_COLUMNS: PlayerTableColumn<GoalieGameLogRow>[] = [
  {
    id: "decision",
    label: "Dec",
    tooltip: "Goalie decision: W (win), L (loss), O (OT loss). Blank = relief.",
    get: (r) => r.decision ?? "",
    format: "string",
  },
  {
    id: "shotsAgainst",
    label: "SA",
    tooltip: "Shots faced.",
    get: (r) => r.shotsAgainst,
    format: "int",
  },
  {
    id: "goalsAgainst",
    label: "GA",
    tooltip: "Goals allowed.",
    get: (r) => r.goalsAgainst,
    format: "int",
  },
  {
    id: "savePct",
    label: "SV%",
    tooltip: "Save percentage in the game.",
    get: (r) => r.savePct,
    format: "savePct",
    higherIsBetter: true,
  },
  {
    id: "shutouts",
    label: "SO",
    tooltip: "Shutout recorded.",
    get: (r) => r.shutouts,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "toi",
    label: "TOI",
    tooltip: "Time on ice.",
    get: (r) => r.toi,
    format: "string",
  },
];

export function formatValue(
  value: number | string,
  format: ColumnFormat,
): string {
  if (format === "string") return String(value ?? "");
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  switch (format) {
    case "int":
      return String(Math.round(n));
    case "float1":
      return n.toFixed(1);
    case "float2":
      return n.toFixed(2);
    case "float3":
      return n.toFixed(3);
    case "pct1":
      return `${(n * 100).toFixed(1)}%`;
    case "plusMinus":
      return n > 0 ? `+${n}` : String(n);
    case "mmss": {
      if (n <= 0) return "—";
      const total = Math.round(n);
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    case "savePct":
      if (n === 0) return "—";
      return n.toFixed(3).replace(/^0/, "");
  }
}
