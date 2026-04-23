import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSavePct } from "@/lib/player/format";
import type { PlayerLast5 } from "@/lib/player/types";

export function LastFiveCard({ games }: { games: PlayerLast5[] }) {
  if (games.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Last {games.length} games</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {games.map((g) => (
            <li
              key={g.gameId}
              className="rounded-md border border-border bg-muted/20 p-3 text-sm"
            >
              <div className="text-xs text-muted-foreground">
                {g.gameDate} · {g.homeRoadFlag === "H" ? "vs" : "@"}{" "}
                {g.opponentAbbrev}
                {g.gameTypeId === 3 && (
                  <span className="ml-1 text-amber-400">(PO)</span>
                )}
              </div>
              {g.kind === "skater" ? (
                <div className="mt-1 tabular-nums">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold">{g.goals}G</span>
                    <span className="text-lg font-semibold">{g.assists}A</span>
                    <span className="text-lg font-semibold">{g.points}P</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.shots} SOG · {g.toi}
                  </div>
                </div>
              ) : (
                <div className="mt-1 tabular-nums">
                  <div className="text-lg font-semibold">
                    {g.decision ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatSavePct(g.savePct)} · {g.shotsAgainst - g.goalsAgainst}/
                    {g.shotsAgainst} · {g.toi}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
