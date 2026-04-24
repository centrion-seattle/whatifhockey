import type { PenaltyPeriod } from "@/lib/game-summary/types";

export function PenaltySummary({ periods }: { periods: PenaltyPeriod[] }) {
  const nonEmpty = periods.filter((p) => p.penalties.length > 0);
  if (nonEmpty.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Penalties
      </h2>
      <div className="space-y-4">
        {nonEmpty.map((p) => (
          <div key={p.periodLabel}>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {p.periodLabel}
            </h3>
            <div className="space-y-1">
              {p.penalties.map((pen, i) => (
                <div
                  key={`${p.periodLabel}-${i}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-1.5 text-sm"
                >
                  <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {pen.time}
                  </span>
                  <span className="w-10 shrink-0 text-xs font-medium">
                    {pen.teamAbbrev}
                  </span>
                  <span className="font-medium">{pen.playerName}</span>
                  <span className="text-muted-foreground">
                    {pen.infraction} ({pen.duration} min)
                  </span>
                  {pen.drawnByName && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Drawn by {pen.drawnByName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
