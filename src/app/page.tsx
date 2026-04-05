import { StandingsView } from "@/components/standings-view";
import { getStandings } from "@/lib/nhl/fetch-standings";

export default async function HomePage() {
  const result = await getStandings();

  return (
    <StandingsView
      teams={result.teams}
      updatedAt={result.updatedAt ?? new Date().toISOString()}
      source={result.source}
      fetchError={result.ok ? undefined : result.error}
    />
  );
}
