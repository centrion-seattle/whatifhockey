import type { TeamStats } from "./types";

export type ColumnFormat =
  | "int"
  | "float1"
  | "float2"
  | "pct1"
  | "diff";

export type StatColumn = {
  id: string;
  label: string;
  tooltip: string;
  get: (t: TeamStats) => number;
  format: ColumnFormat;
  /** Higher values are "better" — used to set default sort direction. */
  higherIsBetter?: boolean;
};

export const STAT_COLUMNS: StatColumn[] = [
  {
    id: "gamesPlayed",
    label: "GP",
    tooltip: "Games played this season.",
    get: (t) => t.gamesPlayed,
    format: "int",
  },
  {
    id: "wins",
    label: "W",
    tooltip: "Total wins (regulation + overtime + shootout).",
    get: (t) => t.wins,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "losses",
    label: "L",
    tooltip: "Regulation losses.",
    get: (t) => t.losses,
    format: "int",
  },
  {
    id: "otLosses",
    label: "OTL",
    tooltip: "Overtime and shootout losses (worth 1 point each).",
    get: (t) => t.otLosses,
    format: "int",
  },
  {
    id: "points",
    label: "Pts",
    tooltip: "Standings points: 2 per win, 1 per OT/SO loss.",
    get: (t) => t.points,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "pointPct",
    label: "P%",
    tooltip:
      "Points percentage — points earned divided by maximum available (2 × games played). Normalizes for games-in-hand.",
    get: (t) => t.pointPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "goalsFor",
    label: "GF",
    tooltip: "Total goals scored.",
    get: (t) => t.goalsFor,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "goalsAgainst",
    label: "GA",
    tooltip: "Total goals allowed.",
    get: (t) => t.goalsAgainst,
    format: "int",
  },
  {
    id: "goalDifferential",
    label: "DIFF",
    tooltip: "Goal differential (GF − GA). Positive = more goals scored than allowed.",
    get: (t) => t.goalDifferential,
    format: "diff",
    higherIsBetter: true,
  },
  {
    id: "goalsForPerGame",
    label: "GF/GP",
    tooltip: "Goals scored per game played.",
    get: (t) => t.goalsForPerGame,
    format: "float2",
    higherIsBetter: true,
  },
  {
    id: "goalsAgainstPerGame",
    label: "GA/GP",
    tooltip: "Goals allowed per game played.",
    get: (t) => t.goalsAgainstPerGame,
    format: "float2",
  },
  {
    id: "shotsForPerGame",
    label: "SF/GP",
    tooltip: "Shots on goal taken per game.",
    get: (t) => t.shotsForPerGame,
    format: "float2",
    higherIsBetter: true,
  },
  {
    id: "shotsAgainstPerGame",
    label: "SA/GP",
    tooltip: "Shots on goal allowed per game.",
    get: (t) => t.shotsAgainstPerGame,
    format: "float2",
  },
  {
    id: "powerPlayPct",
    label: "PP%",
    tooltip:
      "Power-play conversion rate — PP goals scored divided by PP opportunities.",
    get: (t) => t.powerPlayPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "powerPlayNetPct",
    label: "PP Net%",
    tooltip:
      "Net power-play rate — (PP goals − short-handed goals allowed) ÷ PP opportunities. Penalizes teams that give up shorties.",
    get: (t) => t.powerPlayNetPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "penaltyKillPct",
    label: "PK%",
    tooltip:
      "Penalty-kill rate — share of opponent power plays that end without a PP goal against.",
    get: (t) => t.penaltyKillPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "penaltyKillNetPct",
    label: "PK Net%",
    tooltip:
      "Net penalty-kill rate — credits short-handed goals scored against the opponent's power play.",
    get: (t) => t.penaltyKillNetPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "faceoffWinPct",
    label: "FOW%",
    tooltip: "Faceoff win percentage across all situations.",
    get: (t) => t.faceoffWinPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "satPct",
    label: "CF%",
    tooltip:
      "Corsi-For % (NHL calls it SAT%). Share of all 5v5 shot attempts — shots + misses + blocks — taken by this team vs. opponents. A proxy for puck possession; > 50% means the team out-attempts opponents.",
    get: (t) => t.satPct,
    format: "pct1",
    higherIsBetter: true,
  },
  {
    id: "totalShotAttempts",
    label: "CF",
    tooltip:
      "Total 5v5 shot attempts for (shots on goal + missed + blocked). The numerator of Corsi-For%.",
    get: (t) => t.totalShotAttempts,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "shots",
    label: "SOG",
    tooltip: "Total shots on goal (all situations).",
    get: (t) => t.shots,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "missedShots",
    label: "MissS",
    tooltip: "Shots attempted that missed the net (5v5).",
    get: (t) => t.missedShots,
    format: "int",
  },
  {
    id: "shotAttemptsBlocked",
    label: "BlkAg",
    tooltip:
      "Shot attempts by this team that were blocked by an opponent (5v5).",
    get: (t) => t.shotAttemptsBlocked,
    format: "int",
  },
  {
    id: "hits",
    label: "Hits",
    tooltip: "Total hits delivered.",
    get: (t) => t.hits,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "hitsPer60",
    label: "Hits/60",
    tooltip: "Hits per 60 minutes of 5v5 ice time.",
    get: (t) => t.hitsPer60,
    format: "float2",
    higherIsBetter: true,
  },
  {
    id: "blockedShots",
    label: "Blk",
    tooltip: "Opponent shot attempts blocked by this team.",
    get: (t) => t.blockedShots,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "blockedShotsPer60",
    label: "Blk/60",
    tooltip: "Blocks per 60 minutes of 5v5 ice time.",
    get: (t) => t.blockedShotsPer60,
    format: "float2",
    higherIsBetter: true,
  },
  {
    id: "giveaways",
    label: "GvA",
    tooltip: "Giveaways — puck lost to the opponent through a bad play.",
    get: (t) => t.giveaways,
    format: "int",
  },
  {
    id: "giveawaysPer60",
    label: "GvA/60",
    tooltip: "Giveaways per 60 minutes of 5v5 ice time (lower is better).",
    get: (t) => t.giveawaysPer60,
    format: "float2",
  },
  {
    id: "takeaways",
    label: "TkA",
    tooltip: "Takeaways — pucks won off the opponent.",
    get: (t) => t.takeaways,
    format: "int",
    higherIsBetter: true,
  },
  {
    id: "takeawaysPer60",
    label: "TkA/60",
    tooltip: "Takeaways per 60 minutes of 5v5 ice time.",
    get: (t) => t.takeawaysPer60,
    format: "float2",
    higherIsBetter: true,
  },
];

export function formatStatValue(value: number, format: ColumnFormat): string {
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "int":
      return String(Math.round(value));
    case "float1":
      return value.toFixed(1);
    case "float2":
      return value.toFixed(2);
    case "pct1":
      return `${(value * 100).toFixed(1)}%`;
    case "diff":
      return value > 0 ? `+${value}` : String(value);
  }
}
