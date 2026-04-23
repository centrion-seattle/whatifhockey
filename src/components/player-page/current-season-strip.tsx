import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { formatMmSs, formatSavePct, formatSeason } from "@/lib/player/format";
import type {
  GoalieFeatured,
  PlayerFeatured,
  SkaterFeatured,
} from "@/lib/player/types";

type StatSpec = {
  label: string;
  tooltip: string;
  get: (f: PlayerFeatured) => string;
};

const SKATER_SPECS: StatSpec[] = [
  { label: "GP", tooltip: "Games played.", get: (f) => String((f as SkaterFeatured).gamesPlayed) },
  { label: "G", tooltip: "Goals.", get: (f) => String((f as SkaterFeatured).goals) },
  { label: "A", tooltip: "Assists.", get: (f) => String((f as SkaterFeatured).assists) },
  { label: "P", tooltip: "Points.", get: (f) => String((f as SkaterFeatured).points) },
  {
    label: "+/-",
    tooltip: "Plus-minus rating.",
    get: (f) => {
      const v = (f as SkaterFeatured).plusMinus;
      return v > 0 ? `+${v}` : String(v);
    },
  },
  { label: "SOG", tooltip: "Shots on goal.", get: (f) => String((f as SkaterFeatured).shots) },
  {
    label: "S%",
    tooltip: "Shooting percentage.",
    get: (f) => `${((f as SkaterFeatured).shootingPct * 100).toFixed(1)}%`,
  },
  { label: "PIM", tooltip: "Penalty minutes.", get: (f) => String((f as SkaterFeatured).pim) },
];

const GOALIE_SPECS: StatSpec[] = [
  { label: "GP", tooltip: "Games played.", get: (f) => String((f as GoalieFeatured).gamesPlayed) },
  {
    label: "Record",
    tooltip: "Wins-losses-OT losses.",
    get: (f) => {
      const g = f as GoalieFeatured;
      return `${g.wins}-${g.losses}-${g.otLosses}`;
    },
  },
  {
    label: "GAA",
    tooltip: "Goals against average. Lower is better.",
    get: (f) => (f as GoalieFeatured).goalsAgainstAvg.toFixed(2),
  },
  {
    label: "SV%",
    tooltip: "Save percentage.",
    get: (f) => formatSavePct((f as GoalieFeatured).savePct),
  },
  {
    label: "SO",
    tooltip: "Shutouts.",
    get: (f) => String((f as GoalieFeatured).shutouts),
  },
  {
    label: "SA",
    tooltip: "Shots against.",
    get: (f) => String((f as GoalieFeatured).shotsAgainst ?? 0),
  },
  {
    label: "TOI",
    tooltip: "Total time on ice.",
    get: (f) => formatMmSs((f as GoalieFeatured).timeOnIceSeconds ?? 0),
  },
];

export function CurrentSeasonStrip({
  season,
  subSeason,
  career,
  isGoalie,
}: {
  season?: number;
  subSeason?: PlayerFeatured;
  career?: PlayerFeatured;
  isGoalie: boolean;
}) {
  if (!subSeason && !career) return null;
  const specs = isGoalie ? GOALIE_SPECS : SKATER_SPECS;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {season ? formatSeason(season) : "Current"} season
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {specs.map((spec) => (
            <StatColumn
              key={spec.label}
              label={spec.label}
              tooltip={spec.tooltip}
              current={subSeason ? spec.get(subSeason) : "—"}
              career={career ? spec.get(career) : undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatColumn({
  label,
  tooltip,
  current,
  career,
}: {
  label: string;
  tooltip: string;
  current: string;
  career?: string;
}) {
  return (
    <div className="flex flex-col">
      <Tooltip content={tooltip} className="self-start justify-start">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </Tooltip>
      <div className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
        {current}
      </div>
      {career !== undefined && (
        <div className="text-xs text-muted-foreground tabular-nums">
          Career {career}
        </div>
      )}
    </div>
  );
}
