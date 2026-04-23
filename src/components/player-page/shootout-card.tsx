import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { SkaterSplits } from "@/lib/player/types";

export function ShootoutCard({ splits }: { splits: SkaterSplits | undefined }) {
  if (!splits?.shootout) return null;
  const s = splits.shootout;
  if (s.careerShots === 0 && s.shots === 0) return null;

  const items: Array<{
    label: string;
    tip: string;
    season: string;
    career: string;
  }> = [
    {
      label: "Attempts",
      tip: "Shootout shots taken.",
      season: String(s.shots),
      career: String(s.careerShots),
    },
    {
      label: "Goals",
      tip: "Shootout goals.",
      season: String(s.goals),
      career: String(s.careerGoals),
    },
    {
      label: "S%",
      tip: "Shootout shooting percentage.",
      season: s.shots > 0 ? `${(s.shootingPct * 100).toFixed(1)}%` : "—",
      career:
        s.careerShots > 0
          ? `${(s.careerShootingPct * 100).toFixed(1)}%`
          : "—",
    },
    {
      label: "Deciders",
      tip: "Game-deciding shootout goals.",
      season: String(s.gameDecidingGoals),
      career: String(s.careerGameDecidingGoals),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Shootout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((it) => (
            <div key={it.label}>
              <Tooltip content={it.tip} className="self-start justify-start">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {it.label}
                </div>
              </Tooltip>
              <div className="text-lg font-semibold tabular-nums">
                {it.season}
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">
                Career {it.career}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
