import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { leagueRank } from "@/lib/nhl/fetch-player-splits";
import type { SkaterSplits } from "@/lib/player/types";

type RateSpec = {
  label: string;
  tooltip: string;
  pick: (s: SkaterSplits) => number | undefined;
  format: (v: number) => string;
  higherIsBetter: boolean;
};

const RATES: RateSpec[] = [
  {
    label: "Hits/60",
    tooltip: "Hits delivered per 60 minutes of ice time.",
    pick: (s) => s.realtime?.hitsPer60,
    format: (v) => v.toFixed(2),
    higherIsBetter: true,
  },
  {
    label: "Blocks/60",
    tooltip: "Shot attempts blocked per 60 minutes.",
    pick: (s) => s.realtime?.blockedShotsPer60,
    format: (v) => v.toFixed(2),
    higherIsBetter: true,
  },
  {
    label: "Takeaways/60",
    tooltip: "Takeaways per 60 minutes.",
    pick: (s) => s.realtime?.takeawaysPer60,
    format: (v) => v.toFixed(2),
    higherIsBetter: true,
  },
  {
    label: "Giveaways/60",
    tooltip: "Giveaways per 60 minutes. Lower is better.",
    pick: (s) => s.realtime?.giveawaysPer60,
    format: (v) => v.toFixed(2),
    higherIsBetter: false,
  },
];

export function Per60Card({
  playerId,
  splits,
  leagueSplits,
}: {
  playerId: number;
  splits: SkaterSplits | undefined;
  leagueSplits: Record<string, SkaterSplits>;
}) {
  if (!splits?.realtime) return null;
  const rt = splits.realtime;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Per-60 rates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {RATES.map((spec) => {
            const v = spec.pick(splits);
            const rank = leagueRank(
              leagueSplits,
              playerId,
              spec.higherIsBetter
                ? spec.pick
                : (s) => {
                    const n = spec.pick(s);
                    return typeof n === "number" ? -n : undefined;
                  },
            );
            return (
              <div key={spec.label}>
                <Tooltip
                  content={spec.tooltip}
                  className="self-start justify-start"
                >
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {spec.label}
                  </div>
                </Tooltip>
                <div className="text-xl font-semibold tabular-nums">
                  {v === undefined ? "—" : spec.format(v)}
                </div>
                {rank && (
                  <div className="text-xs text-muted-foreground">
                    #{rank.rank}/{rank.outOf}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <MissedShotBar
          crossbar={rt.missedShotCrossbar}
          goalpost={rt.missedShotGoalpost}
          over={rt.missedShotOverNet}
          wide={rt.missedShotWide}
          goalLine={rt.missedShotGoalLine}
          short={rt.missedShotShort}
        />
      </CardContent>
    </Card>
  );
}

function MissedShotBar(p: {
  crossbar: number;
  goalpost: number;
  over: number;
  wide: number;
  goalLine: number;
  short: number;
}) {
  const segments: Array<{ label: string; tip: string; v: number; color: string }> = [
    {
      label: "Wide",
      tip: "Shots that sailed wide of the net.",
      v: p.wide,
      color: "bg-sky-500",
    },
    {
      label: "Over",
      tip: "Shots that went over the net.",
      v: p.over,
      color: "bg-indigo-500",
    },
    {
      label: "Crossbar",
      tip: "Shots that hit the crossbar.",
      v: p.crossbar,
      color: "bg-amber-500",
    },
    {
      label: "Goalpost",
      tip: "Shots that hit the post.",
      v: p.goalpost,
      color: "bg-rose-500",
    },
    {
      label: "Short",
      tip: "Shots that fell short of the net.",
      v: p.short,
      color: "bg-emerald-500",
    },
    {
      label: "Goal line",
      tip: "Shots that stopped on the goal line.",
      v: p.goalLine,
      color: "bg-fuchsia-500",
    },
  ].filter((s) => s.v > 0);
  const total = segments.reduce((n, s) => n + s.v, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>Missed-shot breakdown</span>
        <span className="tabular-nums">{total} total</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
        {segments.map((s) => (
          <Tooltip
            key={s.label}
            content={`${s.label}: ${s.v} (${s.tip})`}
            className="inline-flex"
          >
            <span
              className={`block h-full ${s.color}`}
              style={{ width: `${(s.v / total) * 100}%` }}
              aria-label={`${s.label} ${s.v}`}
            />
          </Tooltip>
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {segments.map((s) => (
          <li key={s.label} className="inline-flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded-sm ${s.color}`} />
            <span>
              {s.label}{" "}
              <span className="tabular-nums text-foreground">{s.v}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

