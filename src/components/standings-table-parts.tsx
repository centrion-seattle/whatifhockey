import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankingStrategy, RankingStrategyId } from "@/lib/standings/strategies";
import type { PlayoffSpot, RankedTeam } from "@/lib/standings/types";
import { cn } from "@/lib/utils";

export function formatPointsCell(
  strategyId: RankingStrategyId,
  t: RankedTeam,
  displayPoints: (x: RankedTeam) => number,
): string {
  if (strategyId === "points_pct") {
    return `${(t.pointPctg * 100).toFixed(1)}%`;
  }
  return String(displayPoints(t));
}

export function streakLabel(
  code: string | undefined,
  count: number | undefined,
): string | null {
  if (!code || count == null || count === 0) return null;
  return `${code}${count}`;
}

export function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex min-w-[2.5rem] justify-end text-muted-foreground tabular-nums">
        —
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex min-w-[2.5rem] justify-end tabular-nums font-medium",
        up ? "text-emerald-400" : "text-rose-400",
      )}
      title={up ? `Up ${delta} vs official` : `Down ${Math.abs(delta)} vs official`}
    >
      {up ? "▲" : "▼"}
      {Math.abs(delta)}
    </span>
  );
}

export function PlayoffSpotBadge({ spot }: { spot: PlayoffSpot }) {
  if (spot.kind === "DIV") {
    return (
      <Badge variant="success" title={spot.divisionName}>
        {spot.divisionAbbrev} #{spot.seed}
      </Badge>
    );
  }
  if (spot.kind === "WC") {
    return (
      <Badge variant="default" title="Wild card">
        WC{spot.seed}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" title="Not in playoff position">
      Out
    </Badge>
  );
}

type TablePartProps = {
  rows: RankedTeam[];
  showDelta: boolean;
  deltaHeader: string;
  strategyId: RankingStrategyId;
  strategy: RankingStrategy;
  playoffSpots?: Map<string, PlayoffSpot>;
};

export function StandingsDesktopTable({
  rows,
  showDelta,
  deltaHeader,
  strategyId,
  strategy,
  playoffSpots,
}: TablePartProps) {
  const showPlayoffCol = Boolean(playoffSpots);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          {showDelta && (
            <TableHead className="w-20 text-right">{deltaHeader}</TableHead>
          )}
          {showPlayoffCol && (
            <TableHead className="w-28">Playoff</TableHead>
          )}
          <TableHead>Team</TableHead>
          <TableHead className="text-right">GP</TableHead>
          <TableHead className="text-right">W-L-OTL</TableHead>
          <TableHead className="text-right">{strategy.pointsLabel}</TableHead>
          <TableHead className="text-right">DIFF</TableHead>
          <TableHead className="text-right">Strk</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.teamId}>
            <TableCell className="text-center font-medium tabular-nums">
              {row.rank}
            </TableCell>
            {showDelta && (
              <TableCell className="text-right">
                <DeltaBadge delta={row.rankDelta} />
              </TableCell>
            )}
            {showPlayoffCol && playoffSpots && (
              <TableCell>
                <PlayoffSpotBadge spot={playoffSpots.get(row.teamId)!} />
              </TableCell>
            )}
            <TableCell>
              <div className="flex items-center gap-2">
                <Image
                  src={row.logoUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="shrink-0"
                  unoptimized
                />
                <span className="font-medium">{row.name}</span>
                <span className="text-muted-foreground">{row.abbrev}</span>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.gamesPlayed}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.wins}-{row.losses}-{row.otLosses}
            </TableCell>
            <TableCell className="text-right tabular-nums font-medium">
              {formatPointsCell(
                strategyId,
                row,
                strategy.displayPoints ?? ((t) => t.points),
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.goalDifferential > 0 ? "+" : ""}
              {row.goalDifferential}
            </TableCell>
            <TableCell className="text-right text-muted-foreground tabular-nums">
              {streakLabel(row.streakCode, row.streakCount) ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function StandingsMobileCards({
  rows,
  showDelta,
  strategyId,
  strategy,
  playoffSpots,
}: TablePartProps) {
  const showPlayoff = Boolean(playoffSpots);

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={row.teamId}
          className="rounded-lg border border-border bg-muted/20 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-6 shrink-0 text-center font-semibold tabular-nums">
                {row.rank}
              </span>
              <Image
                src={row.logoUrl}
                alt=""
                width={32}
                height={32}
                className="shrink-0"
                unoptimized
              />
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">
                  {row.shortLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.wins}-{row.losses}-{row.otLosses} · {row.gamesPlayed} GP
                </p>
                {showPlayoff && playoffSpots && (
                  <div className="mt-1">
                    <PlayoffSpotBadge spot={playoffSpots.get(row.teamId)!} />
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold tabular-nums">
                {formatPointsCell(
                  strategyId,
                  row,
                  strategy.displayPoints ?? ((t) => t.points),
                )}
              </p>
              {showDelta && row.rankDelta !== 0 && (
                <p className="text-xs text-muted-foreground">
                  <DeltaBadge delta={row.rankDelta} />
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
