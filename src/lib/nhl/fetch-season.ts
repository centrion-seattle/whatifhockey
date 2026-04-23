import "server-only";

import type { NhlStandingsSeasonResponse } from "./team-stats-api-types";

const SEASONS_URL = "https://api-web.nhle.com/v1/standings-season";
const REVALIDATE_SECONDS = 3600;

export async function resolveCurrentSeasonId(
  fallbackSeasonId: number,
): Promise<number> {
  try {
    const res = await fetch(SEASONS_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
        "User-Agent": "hockey-standings-app/1.0",
      },
    });
    if (!res.ok) throw new Error(`standings-season ${res.status}`);
    const data = (await res.json()) as NhlStandingsSeasonResponse;
    if (!data.seasons?.length) throw new Error("No seasons returned");
    return data.seasons[data.seasons.length - 1].id;
  } catch {
    return fallbackSeasonId;
  }
}
