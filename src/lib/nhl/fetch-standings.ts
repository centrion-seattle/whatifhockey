import "server-only";

import type { NhlStandingsApiResponse } from "./types";
import { mapApiRowToStanding } from "./map";
import type { TeamStanding } from "@/lib/standings/types";
import fallbackData from "./fallback.json";

const NHL_STANDINGS_URL = "https://api-web.nhle.com/v1/standings/now";
const REVALIDATE_SECONDS = 120;

export type FetchStandingsResult =
  | { ok: true; teams: TeamStanding[]; updatedAt: string; source: "live" }
  | {
      ok: false;
      error: string;
      teams: TeamStanding[];
      updatedAt: string;
      source: "fallback";
    };

async function fetchLive(): Promise<NhlStandingsApiResponse> {
  const res = await fetch(NHL_STANDINGS_URL, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/json",
      "User-Agent": "hockey-standings-app/1.0",
    },
  });
  if (!res.ok) {
    throw new Error(`NHL API ${res.status}`);
  }
  return res.json() as Promise<NhlStandingsApiResponse>;
}

function teamsFromApi(data: NhlStandingsApiResponse): TeamStanding[] {
  return data.standings.map(mapApiRowToStanding);
}

export async function getStandings(): Promise<FetchStandingsResult> {
  try {
    const data = await fetchLive();
    const teams = teamsFromApi(data);
    return {
      ok: true,
      teams,
      updatedAt: data.standingsDateTimeUtc,
      source: "live",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const data = fallbackData as NhlStandingsApiResponse;
    return {
      ok: false,
      error: message,
      teams: teamsFromApi(data),
      updatedAt: data.standingsDateTimeUtc,
      source: "fallback",
    };
  }
}
