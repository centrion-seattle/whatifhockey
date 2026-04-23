import "server-only";

import fallbackData from "./fallback-team-stats.json";
import type {
  NhlStandingsSeasonResponse,
  NhlTeamRealtimeRow,
  NhlTeamStatsApiResponse,
  NhlTeamSummaryRow,
} from "./team-stats-api-types";
import type { TeamStanding } from "@/lib/standings/types";
import type { TeamStats } from "@/lib/team-stats/types";

const SEASONS_URL = "https://api-web.nhle.com/v1/standings-season";
const REVALIDATE_SECONDS = 120;

function summaryUrl(seasonId: number): string {
  return `https://api.nhle.com/stats/rest/en/team/summary?cayenneExp=seasonId=${seasonId}%20and%20gameTypeId=2`;
}

function realtimeUrl(seasonId: number): string {
  return `https://api.nhle.com/stats/rest/en/team/realtime?cayenneExp=seasonId=${seasonId}%20and%20gameTypeId=2`;
}

export type FetchTeamStatsResult =
  | { ok: true; teams: TeamStats[]; seasonId: number; updatedAt: string; source: "live" }
  | {
      ok: false;
      error: string;
      teams: TeamStats[];
      seasonId: number;
      updatedAt: string;
      source: "fallback";
    };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/json",
      "User-Agent": "hockey-standings-app/1.0",
    },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function resolveCurrentSeasonId(): Promise<number> {
  const seasons = await fetchJson<NhlStandingsSeasonResponse>(SEASONS_URL);
  if (!seasons.seasons?.length) throw new Error("No seasons returned");
  return seasons.seasons[seasons.seasons.length - 1].id;
}

export function mergeRows(
  summary: NhlTeamSummaryRow[],
  realtime: NhlTeamRealtimeRow[],
  standings: TeamStanding[],
): TeamStats[] {
  const realtimeByTeamId = new Map<number, NhlTeamRealtimeRow>();
  for (const r of realtime) realtimeByTeamId.set(r.teamId, r);

  const standingsByName = new Map<string, TeamStanding>();
  for (const s of standings) standingsByName.set(s.name, s);

  const out: TeamStats[] = [];
  for (const s of summary) {
    const rt = realtimeByTeamId.get(s.teamId);
    const team = standingsByName.get(s.teamFullName);
    if (!team || !rt) continue;
    out.push({
      teamId: team.abbrev,
      abbrev: team.abbrev,
      name: team.name,
      logoUrl: team.logoUrl,
      conference: team.conference,
      division: team.division,
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      otLosses: s.otLosses,
      points: s.points,
      pointPct: s.pointPct,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifferential: s.goalsFor - s.goalsAgainst,
      goalsForPerGame: s.goalsForPerGame,
      goalsAgainstPerGame: s.goalsAgainstPerGame,
      shotsForPerGame: s.shotsForPerGame,
      shotsAgainstPerGame: s.shotsAgainstPerGame,
      powerPlayPct: s.powerPlayPct,
      powerPlayNetPct: s.powerPlayNetPct,
      penaltyKillPct: s.penaltyKillPct,
      penaltyKillNetPct: s.penaltyKillNetPct,
      faceoffWinPct: s.faceoffWinPct,
      satPct: rt.satPct,
      hits: rt.hits,
      hitsPer60: rt.hitsPer60,
      blockedShots: rt.blockedShots,
      blockedShotsPer60: rt.blockedShotsPer60,
      giveaways: rt.giveaways,
      giveawaysPer60: rt.giveawaysPer60,
      takeaways: rt.takeaways,
      takeawaysPer60: rt.takeawaysPer60,
      shots: rt.shots,
      missedShots: rt.missedShots,
      totalShotAttempts: rt.totalShotAttempts,
      shotAttemptsBlocked: rt.shotAttemptsBlocked,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

type FallbackShape = {
  seasonId: number;
  updatedAt: string;
  teams: TeamStats[];
};

export async function getTeamStats(
  standings: TeamStanding[],
): Promise<FetchTeamStatsResult> {
  try {
    const seasonId = await resolveCurrentSeasonId();
    const [summary, realtime] = await Promise.all([
      fetchJson<NhlTeamStatsApiResponse<NhlTeamSummaryRow>>(summaryUrl(seasonId)),
      fetchJson<NhlTeamStatsApiResponse<NhlTeamRealtimeRow>>(realtimeUrl(seasonId)),
    ]);
    const teams = mergeRows(summary.data, realtime.data, standings);
    if (teams.length === 0) throw new Error("No teams after merge");
    return {
      ok: true,
      teams,
      seasonId,
      updatedAt: new Date().toISOString(),
      source: "live",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const fb = fallbackData as FallbackShape;
    return {
      ok: false,
      error: message,
      teams: fb.teams,
      seasonId: fb.seasonId,
      updatedAt: fb.updatedAt,
      source: "fallback",
    };
  }
}
