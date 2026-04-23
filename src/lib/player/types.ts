export type PlayerDraft = {
  year: number;
  teamAbbrev: string;
  round: number;
  pickInRound: number;
  overallPick: number;
};

export type PlayerBio = {
  playerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  sweaterNumber?: number;
  headshot: string;
  heroImage?: string;
  heightInInches: number;
  heightInCentimeters: number;
  weightInPounds: number;
  weightInKilograms: number;
  birthDate: string;
  birthCity?: string;
  birthStateProvince?: string;
  birthCountry: string;
  nationality?: string;
  shootsCatches: string;
  draft?: PlayerDraft;
  isActive: boolean;
  inHHOF: boolean;
  inTop100AllTime: boolean;
  currentTeamAbbrev?: string;
  currentTeamLogo?: string;
  currentTeamName?: string;
  twitterLink?: string;
  watchLink?: string;
  shopLink?: string;
};

export type SkaterSeasonTotal = {
  kind: "skater";
  season: number;
  sequence: number;
  gameTypeId: number;
  leagueAbbrev: string;
  teamName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shorthandedGoals: number;
  shorthandedPoints: number;
  gameWinningGoals: number;
  otGoals: number;
  shots: number;
  shootingPct: number;
  avgToiSeconds: number;
  faceoffWinPct: number;
};

export type GoalieSeasonTotal = {
  kind: "goalie";
  season: number;
  sequence: number;
  gameTypeId: number;
  leagueAbbrev: string;
  teamName: string;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  goalsAgainstAvg: number;
  savePct: number;
  shotsAgainst: number;
  goalsAgainst: number;
  shutouts: number;
  goals: number;
  assists: number;
  pim: number;
  timeOnIceSeconds: number;
};

export type PlayerSeasonTotal = SkaterSeasonTotal | GoalieSeasonTotal;

export type SkaterLast5 = {
  kind: "skater";
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
  toi: string;
  pim: number;
};

export type GoalieLast5 = {
  kind: "goalie";
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
  savePct: number;
  toi: string;
};

export type PlayerLast5 = SkaterLast5 | GoalieLast5;

export type SkaterFeatured = {
  kind: "skater";
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  shots: number;
  shootingPct: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shorthandedGoals: number;
  gameWinningGoals: number;
  avgToiSeconds?: number;
};

export type GoalieFeatured = {
  kind: "goalie";
  gamesPlayed: number;
  gamesStarted?: number;
  wins: number;
  losses: number;
  otLosses: number;
  savePct: number;
  goalsAgainstAvg: number;
  shutouts: number;
  shotsAgainst?: number;
  goalsAgainst?: number;
  timeOnIceSeconds?: number;
};

export type PlayerFeatured = SkaterFeatured | GoalieFeatured;

export type PlayerAward = {
  trophy: string;
  seasons: Array<{
    seasonId: number;
    gameTypeId?: number;
    goals?: number;
    assists?: number;
    points?: number;
    plusMinus?: number;
    wins?: number;
    savePct?: number;
    goalsAgainstAvg?: number;
  }>;
};

export type PlayerLanding = {
  bio: PlayerBio;
  seasonTotals: PlayerSeasonTotal[];
  last5Games: PlayerLast5[];
  featuredSeason?: number;
  featuredRegular?: PlayerFeatured;
  featuredCareer?: PlayerFeatured;
  featuredPlayoffs?: PlayerFeatured;
  awards: PlayerAward[];
  badges: string[];
};

export type SkaterSplits = {
  seasonId: number;
  summary?: {
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    plusMinus: number;
    shots: number;
    shootingPct: number;
    timeOnIcePerGameSeconds: number;
    evGoals: number;
    evPoints: number;
    ppGoals: number;
    ppPoints: number;
    shGoals: number;
    shPoints: number;
    pointsPerGame: number;
  };
  realtime?: {
    hits: number;
    hitsPer60: number;
    blockedShots: number;
    blockedShotsPer60: number;
    giveaways: number;
    giveawaysPer60: number;
    takeaways: number;
    takeawaysPer60: number;
    missedShots: number;
    missedShotWide: number;
    missedShotOverNet: number;
    missedShotCrossbar: number;
    missedShotGoalpost: number;
    missedShotShort: number;
    missedShotGoalLine: number;
    firstGoals: number;
    emptyNetGoals: number;
    otGoals: number;
  };
  powerPlay?: {
    ppGoals: number;
    ppAssists: number;
    ppPoints: number;
    ppShots: number;
    ppTimeOnIceSeconds: number;
    ppTimeOnIcePct: number;
    ppGoalsPer60: number;
    ppPointsPer60: number;
    ppShotsPer60: number;
    ppShootingPct: number;
    ppIndividualSatFor: number;
  };
  penaltyKill?: {
    shGoals: number;
    shAssists: number;
    shPoints: number;
    shShots: number;
    shTimeOnIceSeconds: number;
    shTimeOnIcePct: number;
    shGoalsPer60: number;
    shPointsPer60: number;
    shShotsPer60: number;
    ppGoalsAgainstPer60: number;
  };
  faceoffs?: {
    totalFaceoffs: number;
    faceoffWinPct: number;
    offensiveZoneFaceoffs: number;
    offensiveZoneFaceoffPct: number;
    defensiveZoneFaceoffs: number;
    defensiveZoneFaceoffPct: number;
    neutralZoneFaceoffs: number;
    neutralZoneFaceoffPct: number;
    evFaceoffPct: number;
    evFaceoffs: number;
    ppFaceoffs: number;
    ppFaceoffPct: number;
    shFaceoffs: number;
    shFaceoffPct: number;
  };
  shootout?: {
    shots: number;
    goals: number;
    shootingPct: number;
    gameDecidingGoals: number;
    gamesPlayed: number;
    careerShots: number;
    careerGoals: number;
    careerShootingPct: number;
    careerGameDecidingGoals: number;
  };
};

export type SkaterGameLogRow = {
  kind: "skater";
  gameId: number;
  gameDate: string;
  teamAbbrev: string;
  homeRoadFlag: "H" | "R";
  opponentAbbrev: string;
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

export type GoalieGameLogRow = {
  kind: "goalie";
  gameId: number;
  gameDate: string;
  teamAbbrev: string;
  homeRoadFlag: "H" | "R";
  opponentAbbrev: string;
  gamesStarted: number;
  decision?: "W" | "L" | "O";
  shotsAgainst: number;
  goalsAgainst: number;
  savePct: number;
  shutouts: number;
  pim: number;
  toi: string;
};

export type PlayerGameLogRow = SkaterGameLogRow | GoalieGameLogRow;

export type PlayerGameLog = {
  seasonId: number;
  gameTypeId: number;
  rows: PlayerGameLogRow[];
  seasonsAvailable: Array<{ season: number; gameTypes: number[] }>;
};
