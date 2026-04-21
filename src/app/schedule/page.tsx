import { ScheduleView } from "@/components/schedule-view";
import { getSchedule } from "@/lib/nhl/fetch-schedule";
import { getStandings } from "@/lib/nhl/fetch-standings";
import type { TeamRef } from "@/lib/schedule/types";

export default async function SchedulePage() {
  const standings = await getStandings();
  const teams: TeamRef[] = standings.teams
    .map((t) => ({ abbrev: t.abbrev, name: t.name, logoUrl: t.logoUrl }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const abbrevs = teams.map((t) => t.abbrev);
  const result = await getSchedule(abbrevs);

  return (
    <ScheduleView
      games={result.games}
      teams={teams}
      updatedAt={result.updatedAt}
      source={result.source}
      fetchError={result.ok ? undefined : result.error}
    />
  );
}
