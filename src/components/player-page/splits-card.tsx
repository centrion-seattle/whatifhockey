import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { deriveEvSplit, derivePkSplit, derivePpSplit, type SplitTotals } from "@/lib/player/derive";
import { formatMmSs } from "@/lib/player/format";
import type { SkaterSplits } from "@/lib/player/types";

type Column = {
  label: string;
  color: string;
  tooltip: string;
  totals: SplitTotals | undefined;
};

export function SplitsCard({ splits }: { splits: SkaterSplits | undefined }) {
  if (!splits?.summary) return null;
  const ev = deriveEvSplit(splits);
  const pp = derivePpSplit(splits);
  const pk = derivePkSplit(splits);

  const cols: Column[] = [
    {
      label: "Even strength",
      color: "text-sky-400",
      tooltip:
        "5-on-5 and other even-strength play. Derived from season totals minus PP and PK.",
      totals: ev,
    },
    {
      label: "Power play",
      color: "text-emerald-400",
      tooltip: "Stats while the team had a man advantage.",
      totals: pp,
    },
    {
      label: "Penalty kill",
      color: "text-rose-400",
      tooltip: "Stats while the team was short-handed.",
      totals: pk,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Situational splits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cols.map((c) => (
            <SplitColumn key={c.label} col={c} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SplitColumn({ col }: { col: Column }) {
  const t = col.totals;
  const rows: Array<{ label: string; tip: string; value: string }> = t
    ? [
        { label: "G", tip: "Goals in this situation.", value: String(t.goals) },
        {
          label: "A",
          tip: "Assists in this situation.",
          value: String(t.assists),
        },
        { label: "P", tip: "Points in this situation.", value: String(t.points) },
        { label: "SOG", tip: "Shots on goal.", value: String(t.shots) },
        {
          label: "TOI",
          tip: "Total time on ice in this situation (MM:SS).",
          value: formatMmSs(t.toiSeconds),
        },
        {
          label: "TOI%",
          tip: "Share of ice time spent in this situation.",
          value: `${t.toiPct.toFixed(1)}%`,
        },
        {
          label: "G/60",
          tip: "Goals per 60 minutes of ice time in this situation.",
          value: t.goalsPer60.toFixed(2),
        },
        {
          label: "P/60",
          tip: "Points per 60 minutes in this situation.",
          value: t.pointsPer60.toFixed(2),
        },
        {
          label: "SOG/60",
          tip: "Shots on goal per 60 minutes in this situation.",
          value: t.shotsPer60.toFixed(2),
        },
      ]
    : [];

  return (
    <div className="rounded-md border border-border bg-muted/10 p-3">
      <Tooltip content={col.tooltip} className="self-start justify-start">
        <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
      </Tooltip>
      {!t ? (
        <p className="mt-2 text-xs text-muted-foreground">No data.</p>
      ) : (
        <dl className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 text-sm">
          {rows.map((r) => (
            <div key={r.label}>
              <Tooltip content={r.tip} className="self-start justify-start">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {r.label}
                </dt>
              </Tooltip>
              <dd className="font-medium tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
