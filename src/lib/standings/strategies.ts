import type { TeamStanding } from "./types";

export type RankingStrategyId =
  | "api"
  | "nhl_tiebreak"
  | "points_pct"
  | "wins_only"
  | "no_otl_point";

export type RankingStrategy = {
  id: RankingStrategyId;
  label: string;
  description: string;
  compare: (a: TeamStanding, b: TeamStanding) => number;
  /** Points column label for this scenario */
  pointsLabel: string;
  /** Optional: override displayed points for a team */
  displayPoints?: (t: TeamStanding) => number;
};

function cmpNum(a: number, b: number): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

/** NHL-style: points, fewer GP, RW, ROW-like, goal diff, team id */
function compareNhlTiebreak(a: TeamStanding, b: TeamStanding): number {
  const p = cmpNum(b.points, a.points);
  if (p !== 0) return p;
  const gp = cmpNum(a.gamesPlayed, b.gamesPlayed);
  if (gp !== 0) return gp;
  const rw = cmpNum(b.regulationWins, a.regulationWins);
  if (rw !== 0) return rw;
  const row = cmpNum(b.regulationPlusOtWins, a.regulationPlusOtWins);
  if (row !== 0) return row;
  const gd = cmpNum(b.goalDifferential, a.goalDifferential);
  if (gd !== 0) return gd;
  return a.abbrev.localeCompare(b.abbrev);
}

function comparePointsPct(a: TeamStanding, b: TeamStanding): number {
  const p = cmpNum(b.pointPctg, a.pointPctg);
  if (p !== 0) return p;
  return compareNhlTiebreak(a, b);
}

/** Hypothetical: 2 points per win, OTL gives 0 (counted as loss for ordering only) */
function pointsNoOtlBonus(t: TeamStanding): number {
  return t.wins * 2;
}

function compareNoOtlPoint(a: TeamStanding, b: TeamStanding): number {
  const pa = pointsNoOtlBonus(a);
  const pb = pointsNoOtlBonus(b);
  const p = cmpNum(pb, pa);
  if (p !== 0) return p;
  return compareNhlTiebreak(a, b);
}

/** Sort by wins only (then GP, GD) */
function compareWinsOnly(a: TeamStanding, b: TeamStanding): number {
  const w = cmpNum(b.wins, a.wins);
  if (w !== 0) return w;
  const gp = cmpNum(a.gamesPlayed, b.gamesPlayed);
  if (gp !== 0) return gp;
  return compareNhlTiebreak(a, b);
}

/** Preserve API league order */
function compareApiOrder(a: TeamStanding, b: TeamStanding): number {
  return cmpNum(a.apiLeagueRank, b.apiLeagueRank);
}

export const RANKING_STRATEGIES: RankingStrategy[] = [
  {
    id: "api",
    label: "Official (NHL)",
    description:
      "Order returned by the NHL stats API (reflects current tiebreakers and schedule quirks).",
    compare: compareApiOrder,
    pointsLabel: "PTS",
    displayPoints: (t) => t.points,
  },
  {
    id: "nhl_tiebreak",
    label: "Points + NHL tiebreaks",
    description:
      "Sort by points, then fewer games played, regulation wins, RW+OT wins, goal differential.",
    compare: compareNhlTiebreak,
    pointsLabel: "PTS",
    displayPoints: (t) => t.points,
  },
  {
    id: "points_pct",
    label: "Points %",
    description: "Highest points percentage first, then NHL-style tiebreaks.",
    compare: comparePointsPct,
    pointsLabel: "PTS%",
  },
  {
    id: "wins_only",
    label: "Most wins",
    description: "Ignore points; rank by wins, then fewer GP, then tiebreaks.",
    compare: compareWinsOnly,
    pointsLabel: "W",
    displayPoints: (t) => t.wins,
  },
  {
    id: "no_otl_point",
    label: 'No OTL point (2 pts per win only)',
    description:
      "Hypothetical points = 2 × wins (overtime losses earn 0). Useful to see pace without the OTL point.",
    compare: compareNoOtlPoint,
    pointsLabel: "PTS*",
    displayPoints: pointsNoOtlBonus,
  },
];

export function getStrategy(id: RankingStrategyId): RankingStrategy {
  const s = RANKING_STRATEGIES.find((x) => x.id === id);
  if (!s) return RANKING_STRATEGIES[0];
  return s;
}
