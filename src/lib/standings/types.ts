export type TeamStanding = {
  teamId: string;
  abbrev: string;
  name: string;
  /** City + abbrev for compact mobile display */
  shortLabel: string;
  logoUrl: string;
  conference: string;
  conferenceName: string;
  division: string;
  divisionName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  regulationWins: number;
  regulationPlusOtWins: number;
  goalDifferential: number;
  pointPctg: number;
  shootoutWins: number;
  /** Pre-computed weighted points for the div/conf bonus strategy. */
  divConfBonusPoints: number;
  /** Order from NHL API (1 = first) */
  apiLeagueRank: number;
  /** Official order within conference per API (1 = first) */
  apiConferenceRank: number;
  /** Official order within division per API (1 = first) */
  apiDivisionRank: number;
  streakCode?: string;
  streakCount?: number;
  wildCardSequence?: number;
};

export type RankedTeam = TeamStanding & {
  rank: number;
  /** Change vs official API order (negative = moved up) */
  rankDelta: number;
};

/** Playoff line status under 3+3+2 per conference (from strategy order). */
export type PlayoffSpot =
  | {
      kind: "DIV";
      seed: 1 | 2 | 3;
      divisionAbbrev: string;
      divisionName: string;
    }
  | { kind: "WC"; seed: 1 | 2 }
  | { kind: "OUT" };
