import type { NhlStandingsApiRow } from "./types";
import type { TeamStanding } from "@/lib/standings/types";

export function mapApiRowToStanding(row: NhlStandingsApiRow): TeamStanding {
  const abbr = row.teamAbbrev.default;
  const city = row.placeName.default;
  return {
    teamId: abbr,
    abbrev: abbr,
    name: row.teamName.default,
    shortLabel: `${city} (${abbr})`,
    logoUrl: row.teamLogo,
    conference: row.conferenceAbbrev,
    conferenceName: row.conferenceName,
    division: row.divisionAbbrev,
    divisionName: row.divisionName,
    gamesPlayed: row.gamesPlayed,
    wins: row.wins,
    losses: row.losses,
    otLosses: row.otLosses,
    points: row.points,
    regulationWins: row.regulationWins,
    regulationPlusOtWins: row.regulationPlusOtWins,
    goalDifferential: row.goalDifferential,
    pointPctg: row.pointPctg,
    shootoutWins: row.wins - row.regulationPlusOtWins,
    divConfBonusPoints: 0,
    apiLeagueRank: row.leagueSequence,
    apiConferenceRank: row.conferenceSequence,
    apiDivisionRank: row.divisionSequence,
    streakCode: row.streakCode,
    streakCount: row.streakCount,
    wildCardSequence: row.wildCardSequence,
  };
}
