import { notFound } from "next/navigation";

import { PlayerPageView } from "@/components/player-page/player-page-view";
import fallbackClubStats from "@/lib/nhl/fallback-club-stats.json";
import fallbackLanding from "@/lib/nhl/fallback-player-landing.json";
import fallbackSplits from "@/lib/nhl/fallback-player-splits.json";
import { fetchPlayerGameLog } from "@/lib/nhl/fetch-player-game-log";
import { getPlayerLanding } from "@/lib/nhl/fetch-player-landing";
import { getLeagueSplits } from "@/lib/nhl/fetch-player-splits";
import { resolveCurrentSeasonId } from "@/lib/nhl/fetch-season";
import type { PlayerGameLog, PlayerLanding, SkaterSplits } from "@/lib/player/types";

export const dynamicParams = false;

type ClubFallback = {
  byAbbrev: Record<
    string,
    {
      skaters: Array<{ playerId: number }>;
      goalies: Array<{ playerId: number }>;
    }
  >;
};

type LandingFallback = {
  seasonId: number;
  byId: Record<string, PlayerLanding>;
};

type SplitsFallback = {
  seasonId: number;
  bySkaterId: Record<string, SkaterSplits>;
};

export async function generateStaticParams() {
  const club = fallbackClubStats as ClubFallback;
  const ids = new Set<string>();
  for (const team of Object.values(club.byAbbrev)) {
    for (const s of team.skaters) ids.add(String(s.playerId));
    for (const g of team.goalies) ids.add(String(g.playerId));
  }
  return Array.from(ids).map((playerId) => ({ playerId }));
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const fbLanding = fallbackLanding as unknown as LandingFallback;
  const fbSplits = fallbackSplits as unknown as SplitsFallback;

  const seasonId = await resolveCurrentSeasonId(fbLanding.seasonId);

  const [landingResult, splits] = await Promise.all([
    getPlayerLanding(playerId),
    getLeagueSplits(seasonId),
  ]);

  const landing: PlayerLanding | undefined =
    landingResult.ok
      ? landingResult.landing
      : (landingResult.landing ?? fbLanding.byId[playerId]);

  if (!landing) notFound();

  const isGoalie = landing.bio.position === "G";

  const [regularLog, playoffLog] = await Promise.all([
    fetchPlayerGameLog(playerId, seasonId, 2, isGoalie),
    fetchPlayerGameLog(playerId, seasonId, 3, isGoalie),
  ]);

  const regular: PlayerGameLog | null = regularLog.ok ? regularLog.log : null;
  const playoffs: PlayerGameLog | null =
    playoffLog.ok && playoffLog.log && playoffLog.log.rows.length > 0
      ? playoffLog.log
      : null;

  const playerSplits: SkaterSplits | undefined =
    splits.bySkaterId[playerId] ?? fbSplits.bySkaterId[playerId];

  return (
    <PlayerPageView
      landing={landing}
      seasonId={seasonId}
      splits={playerSplits}
      leagueSplits={splits.bySkaterId}
      regularLog={regular}
      playoffLog={playoffs}
      updatedAt={landingResult.updatedAt}
      source={landingResult.ok ? "live" : "fallback"}
      fetchError={landingResult.ok ? undefined : landingResult.error}
    />
  );
}
