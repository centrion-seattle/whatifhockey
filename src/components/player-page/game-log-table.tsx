"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { fetchPlayerGameLog } from "@/lib/nhl/fetch-player-game-log";
import {
  GOALIE_GAME_LOG_COLUMNS,
  SKATER_GAME_LOG_COLUMNS,
  formatValue,
  type PlayerTableColumn,
} from "@/lib/player/columns";
import { formatSeason } from "@/lib/player/format";
import type {
  GoalieGameLogRow,
  PlayerGameLog,
  PlayerGameLogRow,
  SkaterGameLogRow,
} from "@/lib/player/types";
import { cn } from "@/lib/utils";

import { TrendCharts } from "./trend-charts";

type SortDir = "asc" | "desc";
type SortState = { id: string; dir: SortDir };

export function GameLogSection({
  playerId,
  isGoalie,
  initialSeasonId,
  playerStatsSeasons,
}: {
  playerId: number;
  isGoalie: boolean;
  initialSeasonId: number;
  playerStatsSeasons: Array<{ season: number; gameTypes: number[] }>;
}) {
  const fallbackSeasons = useMemo(
    () =>
      playerStatsSeasons.length > 0
        ? playerStatsSeasons
        : [{ season: initialSeasonId, gameTypes: [2] }],
    [playerStatsSeasons, initialSeasonId],
  );

  const [seasonId, setSeasonId] = useState(fallbackSeasons[0].season);
  const [gameTypeId, setGameTypeId] = useState<2 | 3>(2);
  const [log, setLog] = useState<PlayerGameLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ id: "date", dir: "desc" });

  const availableTypes = useMemo(() => {
    const current = fallbackSeasons.find((s) => s.season === seasonId);
    return current?.gameTypes ?? [2];
  }, [fallbackSeasons, seasonId]);

  useEffect(() => {
    if (!availableTypes.includes(gameTypeId)) {
      setGameTypeId(availableTypes[0] as 2 | 3);
    }
  }, [availableTypes, gameTypeId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPlayerGameLog(playerId, seasonId, gameTypeId, isGoalie).then(
      (res) => {
        if (cancelled) return;
        if (res.ok) {
          setLog(res.log);
          setError(null);
        } else {
          setLog(null);
          setError(res.error);
        }
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [playerId, seasonId, gameTypeId, isGoalie]);

  const rows = useMemo(() => log?.rows ?? [], [log]);

  const columns = useMemo(
    () =>
      (isGoalie
        ? GOALIE_GAME_LOG_COLUMNS
        : SKATER_GAME_LOG_COLUMNS) as PlayerTableColumn<PlayerGameLogRow>[],
    [isGoalie],
  );

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    if (sort.id === "date") {
      copy.sort((a, b) => a.gameDate.localeCompare(b.gameDate));
      if (sort.dir === "desc") copy.reverse();
      return copy;
    }
    if (sort.id === "opponent") {
      copy.sort((a, b) => a.opponentAbbrev.localeCompare(b.opponentAbbrev));
      if (sort.dir === "desc") copy.reverse();
      return copy;
    }
    const col = columns.find((c) => c.id === sort.id);
    if (!col) return copy;
    const mult = sort.dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const av = col.get(a);
      const bv = col.get(b);
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * mult;
      }
      return ((Number(av) || 0) - (Number(bv) || 0)) * mult;
    });
    return copy;
  }, [rows, columns, sort]);

  const trendValues = useMemo(() => {
    if (isGoalie) return [];
    const chronological = [...rows].sort((a, b) =>
      a.gameDate.localeCompare(b.gameDate),
    );
    return chronological.map((r) => (r as SkaterGameLogRow).points);
  }, [rows, isGoalie]);

  function onHeaderClick(id: string, defaultDir: SortDir) {
    setSort((prev) =>
      prev.id === id
        ? { id, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { id, dir: defaultDir },
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Game log</CardTitle>
            <CardDescription>
              Per-game stats. Click any header to sort; hover for a definition.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(seasonId)}
              onValueChange={(v) => setSeasonId(Number(v))}
            >
              <SelectTrigger className="w-[140px]" aria-label="Season">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fallbackSeasons.map((s) => (
                  <SelectItem key={s.season} value={String(s.season)}>
                    {formatSeason(s.season)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <TabButton
                active={gameTypeId === 2}
                disabled={!availableTypes.includes(2)}
                onClick={() => setGameTypeId(2)}
              >
                Regular
              </TabButton>
              <TabButton
                active={gameTypeId === 3}
                disabled={!availableTypes.includes(3)}
                onClick={() => setGameTypeId(3)}
              >
                Playoffs
              </TabButton>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading game log…</p>
        )}
        {error && !loading && (
          <div className="flex items-center gap-2">
            <Badge variant="warning">Live fetch failed</Badge>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        )}
        {!loading && rows.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">
            No games in this view.
          </p>
        )}

        {!isGoalie && trendValues.length > 1 && (
          <TrendCharts perGame={trendValues} label="Points" />
        )}

        {rows.length > 0 && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    aria-sort={
                      sort.id === "date"
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <SortBtn
                      active={sort.id === "date"}
                      dir={sort.id === "date" ? sort.dir : null}
                      onClick={() => onHeaderClick("date", "desc")}
                      label="Date"
                    />
                  </TableHead>
                  <TableHead
                    aria-sort={
                      sort.id === "opponent"
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <SortBtn
                      active={sort.id === "opponent"}
                      dir={sort.id === "opponent" ? sort.dir : null}
                      onClick={() => onHeaderClick("opponent", "asc")}
                      label="Opp"
                    />
                  </TableHead>
                  {columns.map((col) => {
                    const active = sort.id === col.id;
                    return (
                      <TableHead
                        key={col.id}
                        className="text-right"
                        aria-sort={
                          active
                            ? sort.dir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <Tooltip content={col.tooltip} className="justify-end">
                          <SortBtn
                            active={active}
                            dir={active ? sort.dir : null}
                            onClick={() =>
                              onHeaderClick(
                                col.id,
                                col.higherIsBetter ? "desc" : "asc",
                              )
                            }
                            label={col.label}
                          />
                        </Tooltip>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row) => (
                  <TableRow key={row.gameId}>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {row.gameDate}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.homeRoadFlag === "H" ? "vs" : "@"}{" "}
                      <span className="font-medium">{row.opponentAbbrev}</span>
                    </TableCell>
                    {columns.map((col) => {
                      const value = formatValue(
                        col.get(row) as number | string,
                        col.format,
                      );
                      return (
                        <TableCell
                          key={col.id}
                          className={cn(
                            "whitespace-nowrap text-right tabular-nums",
                            sort.id === col.id &&
                              "font-medium text-foreground",
                          )}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}

function SortBtn({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir | null;
  onClick: () => void;
}) {
  const indicator = active ? (dir === "asc" ? "▲" : "▼") : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium uppercase tracking-wide transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span>{label}</span>
      <span aria-hidden className="text-[0.65rem] tabular-nums">
        {indicator ?? ""}
      </span>
    </button>
  );
}

// Re-export row union for downstream consumers without touching types module.
export type { GoalieGameLogRow, SkaterGameLogRow };
