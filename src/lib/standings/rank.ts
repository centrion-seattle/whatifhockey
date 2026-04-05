import type { RankedTeam, TeamStanding } from "./types";
import type { RankingStrategy } from "./strategies";
import { getStrategy } from "./strategies";

function baselineApiRanks(teams: TeamStanding[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of teams) {
    map.set(t.teamId, t.apiLeagueRank);
  }
  return map;
}

export function rankTeams(
  teams: TeamStanding[],
  strategyId: RankingStrategy["id"],
): RankedTeam[] {
  const strategy = getStrategy(strategyId);
  const baseline = baselineApiRanks(teams);
  const sorted = [...teams].sort(strategy.compare);
  return sorted.map((t, i) => {
    const rank = i + 1;
    const apiRank = baseline.get(t.teamId) ?? rank;
    return {
      ...t,
      rank,
      rankDelta: apiRank - rank,
    };
  });
}

function baselineApiConferenceRanks(
  teams: TeamStanding[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of teams) {
    map.set(t.teamId, t.apiConferenceRank);
  }
  return map;
}

/** Rank teams within one conference (E or W); ranks 1–16. */
export function rankTeamsInConference(
  teams: TeamStanding[],
  strategyId: RankingStrategy["id"],
  conferenceAbbrev: string,
): RankedTeam[] {
  const strategy = getStrategy(strategyId);
  const filtered = teams.filter((t) => t.conference === conferenceAbbrev);
  const baseline = baselineApiConferenceRanks(filtered);
  const sorted = [...filtered].sort(strategy.compare);
  return sorted.map((t, i) => {
    const rank = i + 1;
    const apiRank = baseline.get(t.teamId) ?? rank;
    return {
      ...t,
      rank,
      rankDelta: apiRank - rank,
    };
  });
}
