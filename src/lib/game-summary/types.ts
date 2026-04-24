export type SummaryTeam = {
  abbrev: string;
  name: string;
  logoUrl: string;
  score: number;
  sog: number;
};

export type ThreeStar = {
  star: 1 | 2 | 3;
  playerId: number;
  name: string;
  teamAbbrev: string;
  headshot: string;
  sweaterNo: number;
  position: string;
  goals: number;
  assists: number;
  points: number;
};

export type GoalScorer = {
  playerId: number;
  name: string;
  headshot: string;
  seasonTotal: number;
};

export type AssistPlayer = {
  playerId: number;
  name: string;
  seasonTotal: number;
};

export type ScoringGoal = {
  time: string;
  strength: "ev" | "pp" | "sh";
  scorer: GoalScorer;
  assists: AssistPlayer[];
  shotType?: string;
  goalModifier?: string;
  awayScore: number;
  homeScore: number;
  teamAbbrev: string;
};

export type ScoringPeriod = {
  periodLabel: string;
  goals: ScoringGoal[];
};

export type PenaltyEvent = {
  time: string;
  playerName: string;
  teamAbbrev: string;
  infraction: string;
  duration: number;
  drawnByName?: string;
};

export type PenaltyPeriod = {
  periodLabel: string;
  penalties: PenaltyEvent[];
};

export type TeamStatLine = {
  sog: number;
  hits: number;
  blocks: number;
  pim: number;
  faceoffPct: number;
  giveaways: number;
  takeaways: number;
  powerPlay: string;
};

export type BoxscoreSkater = {
  playerId: number;
  name: string;
  sweaterNumber: number;
  position: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  sog: number;
  hits: number;
  blockedShots: number;
  toi: string;
  faceoffWinPct: number;
  pim: number;
  shifts: number;
  giveaways: number;
  takeaways: number;
  powerPlayGoals: number;
};

export type BoxscoreGoalie = {
  playerId: number;
  name: string;
  sweaterNumber: number;
  starter: boolean;
  saves: number;
  shotsAgainst: number;
  goalsAgainst: number;
  savePct: number;
  toi: string;
  evenStrength: { saves: number; shotsAgainst: number };
  powerPlay: { saves: number; shotsAgainst: number };
  shortHanded: { saves: number; shotsAgainst: number };
};

export type GameSummary = {
  gameId: number;
  gameDateLocal: string;
  startTimeUtc: string;
  season: number;
  gameType: number;
  venue: string;
  venueLocation: string;
  lastPeriodType: "REG" | "OT" | "SO";
  homeTeam: SummaryTeam;
  awayTeam: SummaryTeam;
  threeStars: ThreeStar[];
  teamStats: { home: TeamStatLine; away: TeamStatLine };
  scoringByPeriod: ScoringPeriod[];
  penaltiesByPeriod: PenaltyPeriod[];
  skaters: { home: BoxscoreSkater[]; away: BoxscoreSkater[] };
  goalies: { home: BoxscoreGoalie[]; away: BoxscoreGoalie[] };
};
