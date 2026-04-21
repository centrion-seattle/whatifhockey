import "server-only";

import fallbackData from "./fallback-schedule.json";
import { mapApiGameToDomain } from "./map-game";
import type { NhlClubScheduleApiResponse } from "./schedule-api-types";
import { sortByStart } from "@/lib/schedule/helpers";
import type { Game } from "@/lib/schedule/types";

const REVALIDATE_SECONDS = 120;

function clubScheduleUrl(abbrev: string): string {
  return `https://api-web.nhle.com/v1/club-schedule-season/${abbrev}/now`;
}

export type FetchScheduleResult =
  | { ok: true; games: Game[]; updatedAt: string; source: "live" }
  | {
      ok: false;
      error: string;
      games: Game[];
      updatedAt: string;
      source: "fallback";
    };

async function fetchTeamSeason(
  abbrev: string,
): Promise<NhlClubScheduleApiResponse> {
  const res = await fetch(clubScheduleUrl(abbrev), {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/json",
      "User-Agent": "hockey-standings-app/1.0",
    },
  });
  if (!res.ok) {
    throw new Error(`NHL schedule ${abbrev} ${res.status}`);
  }
  return res.json() as Promise<NhlClubScheduleApiResponse>;
}

function gamesFromResponses(
  responses: NhlClubScheduleApiResponse[],
): Game[] {
  const byId = new Map<number, Game>();
  for (const r of responses) {
    for (const raw of r.games) {
      if (byId.has(raw.id)) continue;
      byId.set(raw.id, mapApiGameToDomain(raw));
    }
  }
  return sortByStart(Array.from(byId.values()));
}

type FallbackShape = { updatedAt: string; games: Game[] };

export async function getSchedule(
  abbrevs: string[],
): Promise<FetchScheduleResult> {
  try {
    if (abbrevs.length === 0) throw new Error("No team abbrevs supplied");
    const responses = await Promise.all(abbrevs.map(fetchTeamSeason));
    const games = gamesFromResponses(responses);
    return {
      ok: true,
      games,
      updatedAt: new Date().toISOString(),
      source: "live",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const fb = fallbackData as FallbackShape;
    return {
      ok: false,
      error: message,
      games: fb.games,
      updatedAt: fb.updatedAt,
      source: "fallback",
    };
  }
}
