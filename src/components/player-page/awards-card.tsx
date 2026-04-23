import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSeason } from "@/lib/player/format";
import type { PlayerAward } from "@/lib/player/types";

export function AwardsCard({
  awards,
  badges,
}: {
  awards: PlayerAward[];
  badges: string[];
}) {
  if (awards.length === 0 && badges.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Awards & milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {awards.length > 0 && (
          <ul className="space-y-2">
            {awards.map((a) => (
              <li key={a.trophy} className="text-sm">
                <div className="font-medium">{a.trophy}</div>
                <div className="text-xs text-muted-foreground">
                  {a.seasons
                    .map((s) => {
                      const statLine = formatAwardStatLine(s);
                      const base = formatSeason(s.seasonId);
                      return statLine ? `${base} · ${statLine}` : base;
                    })
                    .join(" · ")}
                </div>
              </li>
            ))}
          </ul>
        )}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b} variant="secondary">
                {b}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatAwardStatLine(
  s: PlayerAward["seasons"][number],
): string | null {
  const bits: string[] = [];
  if (typeof s.goals === "number" && typeof s.assists === "number") {
    bits.push(`${s.goals}G ${s.assists}A`);
  } else if (typeof s.points === "number") {
    bits.push(`${s.points} pts`);
  }
  if (typeof s.plusMinus === "number") {
    bits.push(s.plusMinus > 0 ? `+${s.plusMinus}` : String(s.plusMinus));
  }
  if (typeof s.wins === "number") bits.push(`${s.wins} W`);
  if (typeof s.savePct === "number") {
    bits.push(`.${Math.round(s.savePct * 1000)} SV%`);
  }
  if (typeof s.goalsAgainstAvg === "number") {
    bits.push(`${s.goalsAgainstAvg.toFixed(2)} GAA`);
  }
  return bits.length > 0 ? bits.join(" · ") : null;
}
