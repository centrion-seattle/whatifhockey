import type { TeamStatLine } from "@/lib/game-summary/types";

type Row = { label: string; away: string; home: string; awayN: number; homeN: number };

function buildRows(away: TeamStatLine, home: TeamStatLine): Row[] {
  return [
    { label: "Shots", away: String(away.sog), home: String(home.sog), awayN: away.sog, homeN: home.sog },
    { label: "Hits", away: String(away.hits), home: String(home.hits), awayN: away.hits, homeN: home.hits },
    { label: "Blocks", away: String(away.blocks), home: String(home.blocks), awayN: away.blocks, homeN: home.blocks },
    { label: "PIM", away: String(away.pim), home: String(home.pim), awayN: away.pim, homeN: home.pim },
    { label: "FO%", away: `${(away.faceoffPct * 100).toFixed(1)}%`, home: `${(home.faceoffPct * 100).toFixed(1)}%`, awayN: away.faceoffPct, homeN: home.faceoffPct },
    { label: "Giveaways", away: String(away.giveaways), home: String(home.giveaways), awayN: away.giveaways, homeN: home.giveaways },
    { label: "Takeaways", away: String(away.takeaways), home: String(home.takeaways), awayN: away.takeaways, homeN: home.takeaways },
    { label: "Power Play", away: away.powerPlay, home: home.powerPlay, awayN: parseFloat(away.powerPlay) || 0, homeN: parseFloat(home.powerPlay) || 0 },
  ];
}

export function TeamComparison({
  away,
  home,
  awayAbbrev,
  homeAbbrev,
}: {
  away: TeamStatLine;
  home: TeamStatLine;
  awayAbbrev: string;
  homeAbbrev: string;
}) {
  const rows = buildRows(away, home);
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Team Stats
      </h2>
      <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
        <span>{awayAbbrev}</span>
        <span>{homeAbbrev}</span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <StatBar key={r.label} row={r} />
        ))}
      </div>
    </div>
  );
}

function StatBar({ row }: { row: Row }) {
  const total = row.awayN + row.homeN;
  const awayPct = total > 0 ? (row.awayN / total) * 100 : 50;
  const homePct = 100 - awayPct;
  return (
    <div>
      <div className="flex items-center justify-between text-xs tabular-nums">
        <span className="w-12 font-medium">{row.away}</span>
        <span className="text-muted-foreground">{row.label}</span>
        <span className="w-12 text-right font-medium">{row.home}</span>
      </div>
      <div className="mt-0.5 flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="bg-blue-500/70 transition-all"
          style={{ width: `${awayPct}%` }}
        />
        <div
          className="bg-red-500/70 transition-all"
          style={{ width: `${homePct}%` }}
        />
      </div>
    </div>
  );
}
