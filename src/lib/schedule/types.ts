export type GameStatus =
  | "scheduled"
  | "live"
  | "final"
  | "postponed"
  | "cancelled";

export type GameType = "preseason" | "regular" | "playoffs";

export type GameResultKind = "regulation" | "ot" | "so";

export type GameTeam = {
  abbrev: string;
  name: string;
  logoUrl: string;
  score?: number;
};

export type Game = {
  id: number;
  /** ISO UTC instant — format for viewer-local time. */
  startTimeUtc: string;
  /**
   * Venue-local calendar date (YYYY-MM-DD). Use this to answer "which night"
   * the game is on; it stays pinned to the venue's date regardless of viewer TZ.
   */
  gameDateLocal: string;
  venueTimezone?: string;
  /** e.g. 20252026 */
  season: number;
  gameType: GameType;
  status: GameStatus;
  /** Present when status === "final". */
  resultKind?: GameResultKind;
  home: GameTeam;
  away: GameTeam;
  /** Convenience field populated on final games. */
  winnerAbbrev?: string;
};

export type TeamRef = {
  abbrev: string;
  name: string;
  logoUrl: string;
};
