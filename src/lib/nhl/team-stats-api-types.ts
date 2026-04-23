/** Row from api.nhle.com/stats/rest/en/team/summary */
export type NhlTeamSummaryRow = {
  teamId: number;
  teamFullName: string;
  seasonId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPct: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsForPerGame: number;
  goalsAgainstPerGame: number;
  shotsForPerGame: number;
  shotsAgainstPerGame: number;
  powerPlayPct: number;
  powerPlayNetPct: number;
  penaltyKillPct: number;
  penaltyKillNetPct: number;
  faceoffWinPct: number;
  regulationAndOtWins: number;
  winsInRegulation: number;
  winsInShootout: number;
  teamShutouts: number;
};

/** Row from api.nhle.com/stats/rest/en/team/realtime */
export type NhlTeamRealtimeRow = {
  teamId: number;
  teamFullName: string;
  seasonId: number;
  gamesPlayed: number;
  satPct: number;
  hits: number;
  hitsPer60: number;
  blockedShots: number;
  blockedShotsPer60: number;
  giveaways: number;
  giveawaysPer60: number;
  takeaways: number;
  takeawaysPer60: number;
  shots: number;
  missedShots: number;
  totalShotAttempts: number;
  shotAttemptsBlocked: number;
  timeOnIcePerGame5v5: number;
  emptyNetGoals: number;
};

export type NhlTeamStatsApiResponse<T> = {
  data: T[];
  total?: number;
};

export type NhlStandingsSeason = {
  id: number;
  standingsStart: string;
  standingsEnd: string;
};

export type NhlStandingsSeasonResponse = {
  currentDate: string;
  seasons: NhlStandingsSeason[];
};
