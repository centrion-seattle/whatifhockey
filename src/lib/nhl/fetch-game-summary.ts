import "server-only";

import fallbackData from "./fallback-game-summaries.json";
import type { NhlGameBoxscoreResponse, NhlGameLandingResponse } from "./game-summary-api-types";
import { mapGameSummary } from "./map-game-summary";
import type { GameSummary } from "@/lib/game-summary/types";

const REVALIDATE_SECONDS = 120;
const HEADERS = { Accept: "application/json", "User-Agent": "hockey-standings-app/1.0" };

type FallbackShape = { updatedAt: string; byId: Record<string, GameSummary> };

export type FetchGameSummaryResult =
  | { ok: true; summary: GameSummary; updatedAt: string; source: "live" }
  | { ok: false; error: string; summary?: GameSummary; updatedAt: string; source: "fallback" };

export async function getGameSummary(gameId: number | string): Promise<FetchGameSummaryResult> {
  try {
    const [landing, boxscore] = await Promise.all([
      fetch(`https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`, {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: HEADERS,
      }).then((r) => {
        if (!r.ok) throw new Error(`landing ${gameId} ${r.status}`);
        return r.json() as Promise<NhlGameLandingResponse>;
      }),
      fetch(`https://api-web.nhle.com/v1/gamecenter/${gameId}/boxscore`, {
        next: { revalidate: REVALIDATE_SECONDS },
        headers: HEADERS,
      }).then((r) => {
        if (!r.ok) throw new Error(`boxscore ${gameId} ${r.status}`);
        return r.json() as Promise<NhlGameBoxscoreResponse>;
      }),
    ]);
    return {
      ok: true,
      summary: mapGameSummary(landing, boxscore),
      updatedAt: new Date().toISOString(),
      source: "live",
    };
  } catch (e) {
    const fb = fallbackData as unknown as FallbackShape;
    const entry = fb.byId[String(gameId)];
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
      summary: entry,
      updatedAt: fb.updatedAt,
      source: "fallback",
    };
  }
}
