/** Raw row from api-web.nhle.com/v1/standings/now */
export type NhlStandingsApiRow = {
  leagueSequence: number;
  /** Official order within conference (1 = first) */
  conferenceSequence: number;
  conferenceAbbrev: string;
  conferenceName: string;
  /** Official order within division (1 = first) */
  divisionSequence: number;
  divisionAbbrev: string;
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
  teamAbbrev: { default: string };
  teamName: { default: string };
  placeName: { default: string };
  teamLogo: string;
  streakCode?: string;
  streakCount?: number;
  wildCardSequence?: number;
};

export type NhlStandingsApiResponse = {
  wildCardIndicator: boolean;
  standingsDateTimeUtc: string;
  standings: NhlStandingsApiRow[];
};
