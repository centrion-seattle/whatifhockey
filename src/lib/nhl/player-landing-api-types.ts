export type MultilingualText = { default: string } & Record<string, string>;

export type NhlPlayerDraftDetails = {
  year: number;
  teamAbbrev: string;
  round: number;
  pickInRound: number;
  overallPick: number;
};

export type NhlPlayerAward = {
  trophy: MultilingualText;
  seasons: Array<{
    seasonId: number;
    gamesPlayed?: number;
    gameTypeId?: number;
    goals?: number;
    assists?: number;
    points?: number;
    plusMinus?: number;
    wins?: number;
    savePctg?: number;
    goalsAgainstAvg?: number;
  }>;
};

export type NhlPlayerSeasonTotalSkater = {
  gameTypeId: number;
  season: number;
  sequence: number;
  leagueAbbrev: string;
  teamName?: MultilingualText;
  teamCommonName?: MultilingualText;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus?: number;
  pim?: number;
  powerPlayGoals?: number;
  powerPlayPoints?: number;
  shorthandedGoals?: number;
  shorthandedPoints?: number;
  gameWinningGoals?: number;
  otGoals?: number;
  shots?: number;
  shootingPctg?: number;
  avgToi?: string;
  faceoffWinningPctg?: number;
};

export type NhlPlayerSeasonTotalGoalie = {
  gameTypeId: number;
  season: number;
  sequence: number;
  leagueAbbrev: string;
  teamName?: MultilingualText;
  gamesPlayed: number;
  gamesStarted?: number;
  wins?: number;
  losses?: number;
  otLosses?: number;
  goalsAgainstAvg?: number;
  savePctg?: number;
  shotsAgainst?: number;
  goalsAgainst?: number;
  shutouts?: number;
  goals?: number;
  assists?: number;
  pim?: number;
  timeOnIce?: string;
};

export type NhlPlayerLast5Skater = {
  gameId: number;
  gameDate: string;
  gameTypeId: number;
  opponentAbbrev: string;
  homeRoadFlag: "H" | "R";
  teamAbbrev: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  shifts: number;
  toi: string;
  pim: number;
  powerPlayGoals?: number;
  shorthandedGoals?: number;
};

export type NhlPlayerLast5Goalie = {
  gameId: number;
  gameDate: string;
  gameTypeId: number;
  opponentAbbrev: string;
  homeRoadFlag: "H" | "R";
  teamAbbrev: string;
  gamesStarted: number;
  decision?: "W" | "L" | "O";
  shotsAgainst: number;
  goalsAgainst: number;
  savePctg: number;
  toi: string;
  penaltyMins?: number;
};

export type NhlFeaturedStatsSkater = {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  shots: number;
  shootingPctg: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shorthandedGoals: number;
  shorthandedPoints: number;
  gameWinningGoals: number;
  otGoals: number;
};

export type NhlFeaturedStatsGoalie = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  savePctg: number;
  goalsAgainstAvg: number;
  shutouts: number;
};

export type NhlCareerTotalsSkater = NhlFeaturedStatsSkater & {
  avgToi?: string;
  faceoffWinningPctg?: number;
};

export type NhlCareerTotalsGoalie = NhlFeaturedStatsGoalie & {
  gamesStarted?: number;
  goalsAgainst?: number;
  shotsAgainst?: number;
  timeOnIce?: string;
  goals?: number;
  assists?: number;
  pim?: number;
};

export type NhlPlayerLandingResponse = {
  playerId: number;
  isActive: boolean;
  currentTeamId?: number;
  currentTeamAbbrev?: string;
  fullTeamName?: MultilingualText;
  teamCommonName?: MultilingualText;
  teamLogo?: string;
  sweaterNumber?: number;
  position: string;
  firstName: MultilingualText;
  lastName: MultilingualText;
  headshot: string;
  heroImage?: string;
  heightInInches: number;
  heightInCentimeters: number;
  weightInPounds: number;
  weightInKilograms: number;
  birthDate: string;
  birthCity?: MultilingualText;
  birthStateProvince?: MultilingualText;
  birthCountry: string;
  shootsCatches: string;
  draftDetails?: NhlPlayerDraftDetails;
  playerSlug?: string;
  inTop100AllTime?: 0 | 1;
  inHHOF?: 0 | 1;
  badges?: Array<{ title?: MultilingualText; logoUrl?: MultilingualText }>;
  featuredStats?: {
    season: number;
    regularSeason?: {
      subSeason?: NhlFeaturedStatsSkater | NhlFeaturedStatsGoalie;
      career?: NhlFeaturedStatsSkater | NhlFeaturedStatsGoalie;
    };
    playoffs?: {
      subSeason?: NhlFeaturedStatsSkater | NhlFeaturedStatsGoalie;
      career?: NhlFeaturedStatsSkater | NhlFeaturedStatsGoalie;
    };
  };
  careerTotals?: {
    regularSeason?: NhlCareerTotalsSkater | NhlCareerTotalsGoalie;
    playoffs?: NhlCareerTotalsSkater | NhlCareerTotalsGoalie;
  };
  shopLink?: string;
  twitterLink?: string;
  watchLink?: string;
  last5Games?: Array<NhlPlayerLast5Skater | NhlPlayerLast5Goalie>;
  seasonTotals?: Array<NhlPlayerSeasonTotalSkater | NhlPlayerSeasonTotalGoalie>;
  awards?: NhlPlayerAward[];
};

export type NhlPlayerGameLogSkaterRow = {
  gameId: number;
  gameDate: string;
  teamAbbrev: string;
  homeRoadFlag: "H" | "R";
  opponentAbbrev: string;
  commonName?: MultilingualText;
  opponentCommonName?: MultilingualText;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  shifts: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shorthandedGoals: number;
  shorthandedPoints: number;
  gameWinningGoals: number;
  otGoals: number;
  pim: number;
  toi: string;
};

export type NhlPlayerGameLogGoalieRow = {
  gameId: number;
  gameDate: string;
  teamAbbrev: string;
  homeRoadFlag: "H" | "R";
  opponentAbbrev: string;
  commonName?: MultilingualText;
  opponentCommonName?: MultilingualText;
  gamesStarted: number;
  decision?: "W" | "L" | "O";
  shotsAgainst: number;
  goalsAgainst: number;
  savePctg: number;
  shutouts: number;
  pim: number;
  toi: string;
  goals?: number;
  assists?: number;
};

export type NhlPlayerGameLogResponse = {
  seasonId: number;
  gameTypeId: number;
  playerStatsSeasons: Array<{ season: number; gameTypes: number[] }>;
  gameLog: Array<NhlPlayerGameLogSkaterRow | NhlPlayerGameLogGoalieRow>;
};
