/* Wire-format types for /v1/gamecenter/{id}/landing and /boxscore */

export type NhlI18nString = { default: string; [lang: string]: string };

export type NhlPeriodDescriptor = {
  number: number;
  periodType: "REG" | "OT" | "SO";
  maxRegulationPeriods?: number;
};

/* ── Landing ─────────────────────────────────────────────── */

export type NhlLandingTeam = {
  id: number;
  abbrev: string;
  commonName: NhlI18nString;
  placeName: NhlI18nString;
  logo: string;
  darkLogo: string;
  score: number;
  sog: number;
};

export type NhlLandingAssist = {
  playerId: number;
  firstName: NhlI18nString;
  lastName: NhlI18nString;
  name: NhlI18nString;
  assistsToDate: number;
  sweaterNumber: number;
};

export type NhlLandingGoal = {
  playerId: number;
  firstName: NhlI18nString;
  lastName: NhlI18nString;
  name: NhlI18nString;
  teamAbbrev: NhlI18nString;
  headshot: string;
  strength: "ev" | "pp" | "sh";
  timeInPeriod: string;
  shotType?: string;
  goalModifier?: string;
  goalsToDate: number;
  awayScore: number;
  homeScore: number;
  assists: NhlLandingAssist[];
};

export type NhlLandingScoringPeriod = {
  periodDescriptor: NhlPeriodDescriptor;
  goals: NhlLandingGoal[];
};

export type NhlLandingPenaltyPlayer = {
  firstName: NhlI18nString;
  lastName: NhlI18nString;
  sweaterNumber: number;
};

export type NhlLandingPenalty = {
  timeInPeriod: string;
  type: string;
  duration: number;
  committedByPlayer: NhlLandingPenaltyPlayer;
  teamAbbrev: NhlI18nString;
  drawnBy?: NhlLandingPenaltyPlayer;
  descKey: string;
};

export type NhlLandingPenaltyPeriod = {
  periodDescriptor: NhlPeriodDescriptor;
  penalties: NhlLandingPenalty[];
};

export type NhlLandingThreeStar = {
  star: number;
  playerId: number;
  name: NhlI18nString;
  teamAbbrev: string;
  headshot: string;
  sweaterNo: number;
  position: string;
  goals: number;
  assists: number;
  points: number;
};

export type NhlGameLandingResponse = {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  startTimeUTC: string;
  gameState: string;
  venue: NhlI18nString;
  venueLocation: NhlI18nString;
  venueTimezone?: string;
  homeTeam: NhlLandingTeam;
  awayTeam: NhlLandingTeam;
  summary: {
    scoring: NhlLandingScoringPeriod[];
    penalties: NhlLandingPenaltyPeriod[];
    threeStars: NhlLandingThreeStar[];
  };
};

/* ── Boxscore ────────────────────────────────────────────── */

export type NhlBoxscoreSkater = {
  playerId: number;
  sweaterNumber: number;
  name: NhlI18nString;
  position: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  hits: number;
  powerPlayGoals: number;
  sog: number;
  faceoffWinningPctg: number;
  toi: string;
  blockedShots: number;
  shifts: number;
  giveaways: number;
  takeaways: number;
};

export type NhlBoxscoreGoalie = {
  playerId: number;
  sweaterNumber: number;
  name: NhlI18nString;
  position: string;
  starter: boolean;
  evenStrengthShotsAgainst: string;
  powerPlayShotsAgainst: string;
  shorthandedShotsAgainst: string;
  saveShotsAgainst: string;
  evenStrengthGoalsAgainst: number;
  powerPlayGoalsAgainst: number;
  shorthandedGoalsAgainst: number;
  pim: number;
  goalsAgainst: number;
  toi: string;
  shotsAgainst: number;
  saves: number;
};

export type NhlBoxscoreTeamPlayers = {
  forwards: NhlBoxscoreSkater[];
  defense: NhlBoxscoreSkater[];
  goalies: NhlBoxscoreGoalie[];
};

export type NhlBoxscoreTeam = {
  id: number;
  abbrev: string;
  commonName: NhlI18nString;
  placeName: NhlI18nString;
  logo: string;
  darkLogo: string;
  score: number;
  sog: number;
};

export type NhlGameBoxscoreResponse = {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  startTimeUTC: string;
  gameState: string;
  gameOutcome?: { lastPeriodType: "REG" | "OT" | "SO" };
  venue: NhlI18nString;
  venueLocation: NhlI18nString;
  homeTeam: NhlBoxscoreTeam;
  awayTeam: NhlBoxscoreTeam;
  playerByGameStats: {
    homeTeam: NhlBoxscoreTeamPlayers;
    awayTeam: NhlBoxscoreTeamPlayers;
  };
};
