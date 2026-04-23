import { StandingsView } from "@/components/standings-view";
import { getSchedule } from "@/lib/nhl/fetch-schedule";
import { getStandings } from "@/lib/nhl/fetch-standings";
import { applyDivConfBonus } from "@/lib/standings/div-conf-bonus";

export default async function HomePage() {
  const result = await getStandings();
  const abbrevs = result.teams.map((t) => t.abbrev);
  const schedule = await getSchedule(abbrevs);
  applyDivConfBonus(result.teams, schedule.games);

  return (
    <StandingsView
      teams={result.teams}
      updatedAt={result.updatedAt ?? new Date().toISOString()}
      source={result.source}
      fetchError={result.ok ? undefined : result.error}
    />
  );
}
