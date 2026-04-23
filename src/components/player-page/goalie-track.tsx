"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { fetchPlayerGameLog } from "@/lib/nhl/fetch-player-game-log";
import { formatSavePct } from "@/lib/player/format";
import type { GoalieGameLogRow, PlayerGameLog } from "@/lib/player/types";
import { cn } from "@/lib/utils";

export function GoalieTrack({
  playerId,
  initialSeasonId,
  playerStatsSeasons,
}: {
  playerId: number;
  initialSeasonId: number;
  playerStatsSeasons: Array<{ season: number; gameTypes: number[] }>;
}) {
  const seasonsForPicker =
    playerStatsSeasons.length > 0
      ? playerStatsSeasons
      : [{ season: initialSeasonId, gameTypes: [2] }];
  const seasonId = seasonsForPicker[0].season;

  const [log, setLog] = useState<PlayerGameLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPlayerGameLog(playerId, seasonId, 2, true).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setLog(res.log);
        setError(null);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [playerId, seasonId]);

  const starts = ((log?.rows ?? []) as GoalieGameLogRow[]).filter(
    (r) => r.gamesStarted > 0,
  );
  const shutouts = starts.filter((r) => r.shutouts > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <CardTitle className="text-base">Goalie performance</CardTitle>
            <CardDescription>
              Per-start save percentage heatmap from the current season game
              log.
            </CardDescription>
          </div>
          {error && <Badge variant="warning">Live fetch failed</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading starts…</p>
        )}
        {!loading && starts.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">
            No goalie starts recorded for this season.
          </p>
        )}

        {starts.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Start-by-start SV%
            </h3>
            <div className="flex flex-wrap gap-1">
              {starts.map((r) => {
                const sv = r.savePct;
                const tone =
                  sv >= 0.92
                    ? "bg-emerald-500/70"
                    : sv >= 0.9
                      ? "bg-amber-500/70"
                      : "bg-rose-500/70";
                return (
                  <Tooltip
                    key={r.gameId}
                    content={`${r.gameDate} ${
                      r.homeRoadFlag === "H" ? "vs" : "@"
                    } ${r.opponentAbbrev} — ${formatSavePct(sv)} (${
                      r.shotsAgainst - r.goalsAgainst
                    }/${r.shotsAgainst}) · ${r.decision ?? "—"}`}
                    className="inline-flex"
                  >
                    <span
                      className={cn(
                        "inline-block h-6 w-6 rounded",
                        tone,
                        r.decision === "W" &&
                          "ring-1 ring-emerald-300/80",
                      )}
                      aria-label={`${r.gameDate} ${r.opponentAbbrev} SV% ${formatSavePct(sv)}`}
                    />
                  </Tooltip>
                );
              })}
            </div>
            <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <Legend color="bg-emerald-500/70" label="≥ .920" />
              <Legend color="bg-amber-500/70" label=".900–.919" />
              <Legend color="bg-rose-500/70" label="< .900" />
            </p>
          </div>
        )}

        {shutouts.length > 0 && (
          <div>
            <h3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Shutouts
            </h3>
            <ul className="flex flex-wrap gap-2">
              {shutouts.map((r) => (
                <li
                  key={r.gameId}
                  className="rounded-md border border-border bg-muted/20 px-2 py-1 text-xs"
                >
                  {r.gameDate} · {r.homeRoadFlag === "H" ? "vs" : "@"}{" "}
                  <span className="font-medium">{r.opponentAbbrev}</span> ·{" "}
                  <span className="text-muted-foreground tabular-nums">
                    {r.shotsAgainst} SA
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-block h-2 w-3 rounded-sm", color)} />
      <span>{label}</span>
    </span>
  );
}
