export type Skater = {
  playerId: number;
  firstName: string;
  lastName: string;
  headshot: string;
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  powerPlayGoals: number;
  shorthandedGoals: number;
  gameWinningGoals: number;
  overtimeGoals: number;
  shots: number;
  shootingPct: number;
  /** Seconds of ice time per game. */
  avgTimeOnIcePerGame: number;
  avgShiftsPerGame: number;
  faceoffWinPct: number;
};

export type Goalie = {
  playerId: number;
  firstName: string;
  lastName: string;
  headshot: string;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  goalsAgainstAverage: number;
  savePercentage: number;
  shotsAgainst: number;
  saves: number;
  goalsAgainst: number;
  shutouts: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  /** Total time on ice in seconds. */
  timeOnIce: number;
};

export type ClubStats = {
  abbrev: string;
  skaters: Skater[];
  goalies: Goalie[];
};
