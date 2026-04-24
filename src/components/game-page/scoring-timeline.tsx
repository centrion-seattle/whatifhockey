import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ScoringPeriod } from "@/lib/game-summary/types";

export function ScoringTimeline({
  periods,
  homeAbbrev,
}: {
  periods: ScoringPeriod[];
  homeAbbrev: string;
}) {
  const nonEmpty = periods.filter((p) => p.goals.length > 0);
  if (nonEmpty.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Scoring
      </h2>
      <div className="space-y-4">
        {nonEmpty.map((p) => (
          <div key={p.periodLabel}>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {p.periodLabel}
            </h3>
            <div className="space-y-2">
              {p.goals.map((g, i) => (
                <div
                  key={`${p.periodLabel}-${i}`}
                  className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-2"
                >
                  <Link href={`/player/${g.scorer.playerId}`} className="shrink-0">
                    <Image
                      src={g.scorer.headshot}
                      alt={g.scorer.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="rounded-full"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/player/${g.scorer.playerId}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {g.scorer.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        ({g.scorer.seasonTotal})
                      </span>
                      {g.strength !== "ev" && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {g.strength.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    {g.assists.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {g.assists.map((a, j) => (
                          <span key={a.playerId}>
                            {j > 0 && ", "}
                            <Link
                              href={`/player/${a.playerId}`}
                              className="hover:underline"
                            >
                              {a.name}
                            </Link>
                            {" "}({a.seasonTotal})
                          </span>
                        ))}
                      </div>
                    )}
                    {g.assists.length === 0 && (
                      <div className="text-xs text-muted-foreground">
                        Unassisted
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">{g.time}</div>
                    <div className="text-sm font-semibold tabular-nums">
                      {g.teamAbbrev === homeAbbrev
                        ? `${g.awayScore} – ${g.homeScore}`
                        : `${g.awayScore} – ${g.homeScore}`}
                    </div>
                    {g.shotType && (
                      <div className="text-[10px] text-muted-foreground capitalize">
                        {g.shotType}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
