import { notFound } from "next/navigation";

import { PlayerStatsView } from "@/components/player-stats-view";
import { getClubStats } from "@/lib/nhl/fetch-club-stats";
import { resolveCurrentSeasonId } from "@/lib/nhl/fetch-season";
import { getStandings } from "@/lib/nhl/fetch-standings";
import fallbackClubStats from "@/lib/nhl/fallback-club-stats.json";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const s = await getStandings();
    if (s.teams.length > 0) {
      return s.teams.map((t) => ({ abbrev: t.abbrev }));
    }
  } catch {
    // fall through to fallback snapshot
  }
  return Object.keys(
    (fallbackClubStats as { byAbbrev: Record<string, unknown> }).byAbbrev,
  ).map((abbrev) => ({ abbrev }));
}

export default async function PlayerStatsPage({
  params,
}: {
  params: Promise<{ abbrev: string }>;
}) {
  const { abbrev } = await params;
  const abbrevUpper = abbrev.toUpperCase();

  const standings = await getStandings();
  const team = standings.teams.find((t) => t.abbrev === abbrevUpper);
  if (!team) notFound();

  const fb = fallbackClubStats as { seasonId: number };
  const seasonId = await resolveCurrentSeasonId(fb.seasonId);
  const result = await getClubStats(abbrevUpper, seasonId);

  return (
    <PlayerStatsView
      teamName={team.name}
      teamAbbrev={team.abbrev}
      teamLogoUrl={team.logoUrl}
      stats={result.stats}
      seasonId={result.seasonId}
      updatedAt={result.updatedAt}
      source={result.source}
      fetchError={result.ok ? undefined : result.error}
    />
  );
}
