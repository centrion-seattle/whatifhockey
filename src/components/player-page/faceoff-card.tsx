import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { SkaterSplits } from "@/lib/player/types";

export function FaceoffCard({
  splits,
  position,
}: {
  splits: SkaterSplits | undefined;
  position: string;
}) {
  if (position !== "C") return null;
  if (!splits?.faceoffs) return null;
  const f = splits.faceoffs;
  if (f.totalFaceoffs === 0) return null;

  const zones: Array<{
    label: string;
    tip: string;
    pct: number;
    total: number;
  }> = [
    {
      label: "Offensive",
      tip: "Faceoffs in the offensive zone.",
      pct: f.offensiveZoneFaceoffPct,
      total: f.offensiveZoneFaceoffs,
    },
    {
      label: "Neutral",
      tip: "Faceoffs in the neutral zone.",
      pct: f.neutralZoneFaceoffPct,
      total: f.neutralZoneFaceoffs,
    },
    {
      label: "Defensive",
      tip: "Faceoffs in the defensive zone.",
      pct: f.defensiveZoneFaceoffPct,
      total: f.defensiveZoneFaceoffs,
    },
  ];

  const situations: Array<{
    label: string;
    tip: string;
    pct: number;
    total: number;
  }> = [
    {
      label: "Even",
      tip: "Even-strength faceoffs (all zones).",
      pct: f.evFaceoffPct,
      total: f.evFaceoffs,
    },
    {
      label: "Power play",
      tip: "Faceoffs taken while on the power play.",
      pct: f.ppFaceoffPct,
      total: f.ppFaceoffs,
    },
    {
      label: "Short-handed",
      tip: "Faceoffs taken while short-handed.",
      pct: f.shFaceoffPct,
      total: f.shFaceoffs,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-base">Faceoffs</CardTitle>
          <span className="text-xs text-muted-foreground">
            {f.totalFaceoffs} total · {(f.faceoffWinPct * 100).toFixed(1)}%
            overall
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section title="By zone" items={zones} />
        <Section title="By situation" items={situations} />
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; tip: string; pct: number; total: number }>;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((z) => (
          <div key={z.label}>
            <Tooltip content={z.tip} className="self-start justify-start">
              <div className="text-xs font-medium">{z.label}</div>
            </Tooltip>
            <div className="text-lg font-semibold tabular-nums">
              {z.total > 0 ? `${(z.pct * 100).toFixed(1)}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {z.total} draws
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <span
                className="block h-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(1, z.pct)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
