import { mapGameLogResponse } from "./map-player-landing";
import type { NhlPlayerGameLogResponse } from "./player-landing-api-types";
import type { PlayerGameLog } from "@/lib/player/types";

export type FetchGameLogResult =
  | { ok: true; log: PlayerGameLog; source: "live" }
  | { ok: false; error: string; log: null; source: "live" };

export async function fetchPlayerGameLog(
  playerId: number | string,
  seasonId: number,
  gameTypeId: 2 | 3,
  isGoalie: boolean,
): Promise<FetchGameLogResult> {
  const url = `https://api-web.nhle.com/v1/player/${playerId}/game-log/${seasonId}/${gameTypeId}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`game-log ${res.status}`);
    const raw = (await res.json()) as NhlPlayerGameLogResponse;
    return {
      ok: true,
      log: mapGameLogResponse(raw, isGoalie),
      source: "live",
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
      log: null,
      source: "live",
    };
  }
}
