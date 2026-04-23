import "server-only";

import fallbackData from "./fallback-player-landing.json";
import { mapLandingResponse } from "./map-player-landing";
import type { NhlPlayerLandingResponse } from "./player-landing-api-types";
import type { PlayerLanding } from "@/lib/player/types";

const REVALIDATE_SECONDS = 120;

function url(playerId: number | string): string {
  return `https://api-web.nhle.com/v1/player/${playerId}/landing`;
}

export type FetchPlayerLandingResult =
  | { ok: true; landing: PlayerLanding; updatedAt: string; source: "live" }
  | {
      ok: false;
      error: string;
      landing?: PlayerLanding;
      updatedAt: string;
      source: "fallback";
    };

type FallbackShape = {
  seasonId: number;
  updatedAt: string;
  byId: Record<string, PlayerLanding>;
};

export async function getPlayerLanding(
  playerId: number | string,
): Promise<FetchPlayerLandingResult> {
  try {
    const res = await fetch(url(playerId), {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
        "User-Agent": "hockey-standings-app/1.0",
      },
    });
    if (!res.ok) throw new Error(`player landing ${playerId} ${res.status}`);
    const raw = (await res.json()) as NhlPlayerLandingResponse;
    return {
      ok: true,
      landing: mapLandingResponse(raw),
      updatedAt: new Date().toISOString(),
      source: "live",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const fb = fallbackData as unknown as FallbackShape;
    const landing = fb.byId[String(playerId)];
    return {
      ok: false,
      error: message,
      landing,
      updatedAt: fb.updatedAt,
      source: "fallback",
    };
  }
}
