/** Minimal shape of https://api-web.nhle.com/v1/club-schedule-season/{TEAM}/now */

export type NhlApiTeam = {
  abbrev: string;
  commonName: { default: string };
  placeName?: { default: string };
  logo: string;
  score?: number;
};

export type NhlApiGame = {
  id: number;
  season: number;
  /** 1 = preseason, 2 = regular, 3 = playoffs */
  gameType: 1 | 2 | 3;
  /** Venue-local calendar day, YYYY-MM-DD */
  gameDate: string;
  startTimeUTC: string;
  venueTimezone?: string;
  /** FUT | PRE | LIVE | CRIT | FINAL | OFF */
  gameState: string;
  /** OK | TBD | PPD | CNCL */
  gameScheduleState: string;
  gameOutcome?: { lastPeriodType: "REG" | "OT" | "SO" };
  homeTeam: NhlApiTeam;
  awayTeam: NhlApiTeam;
};

export type NhlClubScheduleApiResponse = {
  previousSeason: number;
  currentSeason: number;
  clubTimezone?: string;
  games: NhlApiGame[];
};
