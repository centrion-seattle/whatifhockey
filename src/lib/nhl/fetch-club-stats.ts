import "server-only";

import fallbackData from "./fallback-club-stats.json";
import type {
  NhlClubGoalieRow,
  NhlClubSkaterRow,
  NhlClubStatsResponse,
} from "./club-stats-api-types";
import type { ClubStats, Goalie, Skater } from "@/lib/players/types";

const REVALIDATE_SECONDS = 120;

function url(abbrev: string, seasonId: number): string {
  return `https://api-web.nhle.com/v1/club-stats/${abbrev}/${seasonId}/2`;
}

export type FetchClubStatsResult =
  | { ok: true; stats: ClubStats; seasonId: number; updatedAt: string; source: "live" }
  | {
      ok: false;
      error: string;
      stats: ClubStats;
      seasonId: number;
      updatedAt: string;
      source: "fallback";
    };

export function mapSkater(r: NhlClubSkaterRow): Skater {
  return {
    playerId: r.playerId,
    firstName: r.firstName.default,
    lastName: r.lastName.default,
    headshot: r.headshot,
    position: r.positionCode,
    gamesPlayed: r.gamesPlayed,
    goals: r.goals,
    assists: r.assists,
    points: r.points,
    plusMinus: r.plusMinus,
    penaltyMinutes: r.penaltyMinutes,
    powerPlayGoals: r.powerPlayGoals,
    shorthandedGoals: r.shorthandedGoals,
    gameWinningGoals: r.gameWinningGoals,
    overtimeGoals: r.overtimeGoals,
    shots: r.shots,
    shootingPct: r.shootingPctg,
    avgTimeOnIcePerGame: r.avgTimeOnIcePerGame,
    avgShiftsPerGame: r.avgShiftsPerGame,
    faceoffWinPct: r.faceoffWinPctg,
  };
}

export function mapGoalie(r: NhlClubGoalieRow): Goalie {
  return {
    playerId: r.playerId,
    firstName: r.firstName.default,
    lastName: r.lastName.default,
    headshot: r.headshot,
    gamesPlayed: r.gamesPlayed,
    gamesStarted: r.gamesStarted,
    wins: r.wins,
    losses: r.losses,
    overtimeLosses: r.overtimeLosses,
    goalsAgainstAverage: r.goalsAgainstAverage,
    savePercentage: r.savePercentage,
    shotsAgainst: r.shotsAgainst,
    saves: r.saves,
    goalsAgainst: r.goalsAgainst,
    shutouts: r.shutouts,
    goals: r.goals,
    assists: r.assists,
    points: r.points,
    penaltyMinutes: r.penaltyMinutes,
    timeOnIce: r.timeOnIce,
  };
}

type FallbackShape = {
  seasonId: number;
  updatedAt: string;
  byAbbrev: Record<
    string,
    { skaters: Skater[]; goalies: Goalie[] }
  >;
};

export async function getClubStats(
  abbrev: string,
  seasonId: number,
): Promise<FetchClubStatsResult> {
  try {
    const res = await fetch(url(abbrev, seasonId), {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
        "User-Agent": "hockey-standings-app/1.0",
      },
    });
    if (!res.ok) throw new Error(`NHL club-stats ${abbrev} ${res.status}`);
    const data = (await res.json()) as NhlClubStatsResponse;
    return {
      ok: true,
      stats: {
        abbrev,
        skaters: data.skaters.map(mapSkater),
        goalies: data.goalies.map(mapGoalie),
      },
      seasonId,
      updatedAt: new Date().toISOString(),
      source: "live",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const fb = fallbackData as FallbackShape;
    const entry = fb.byAbbrev[abbrev] ?? { skaters: [], goalies: [] };
    return {
      ok: false,
      error: message,
      stats: { abbrev, skaters: entry.skaters, goalies: entry.goalies },
      seasonId: fb.seasonId,
      updatedAt: fb.updatedAt,
      source: "fallback",
    };
  }
}
