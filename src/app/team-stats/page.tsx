import { TeamStatsView } from "@/components/team-stats-view";
import { getStandings } from "@/lib/nhl/fetch-standings";
import { getTeamStats } from "@/lib/nhl/fetch-team-stats";

export default async function TeamStatsPage() {
  const standings = await getStandings();
  const result = await getTeamStats(standings.teams);

  return (
    <TeamStatsView
      teams={result.teams}
      seasonId={result.seasonId}
      updatedAt={result.updatedAt}
      source={result.source}
      fetchError={result.ok ? undefined : result.error}
    />
  );
}
