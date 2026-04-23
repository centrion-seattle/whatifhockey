"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { formatUtc } from "@/lib/format";
import {
  GOALIE_COLUMNS,
  SKATER_COLUMNS,
  formatPlayerValue,
  type PlayerColumn,
} from "@/lib/players/columns";
import type { ClubStats, Goalie, Skater } from "@/lib/players/types";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";
type SortState = { kind: "name"; dir: SortDir } | { kind: "col"; id: string; dir: SortDir };

function defaultSkaterSort(): SortState {
  return { kind: "col", id: "points", dir: "desc" };
}

function defaultGoalieSort(): SortState {
  return { kind: "col", id: "wins", dir: "desc" };
}

export function PlayerStatsView(props: {
  teamName: string;
  teamAbbrev: string;
  teamLogoUrl: string;
  stats: ClubStats;
  seasonId: number;
  updatedAt: string;
  source: "live" | "fallback";
  fetchError?: string;
}) {
  const {
    teamName,
    teamAbbrev,
    teamLogoUrl,
    stats,
    seasonId,
    updatedAt,
    source,
    fetchError,
  } = props;

  const [minTen, setMinTen] = useState(false);
  const [skaterSort, setSkaterSort] = useState<SortState>(defaultSkaterSort());
  const [goalieSort, setGoalieSort] = useState<SortState>(defaultGoalieSort());

  const skaters = useMemo(
    () => filterAndSort(stats.skaters, SKATER_COLUMNS, skaterSort, minTen),
    [stats.skaters, skaterSort, minTen],
  );
  const goalies = useMemo(
    () => filterAndSort(stats.goalies, GOALIE_COLUMNS, goalieSort, minTen),
    [stats.goalies, goalieSort, minTen],
  );

  const season = `${String(seasonId).slice(0, 4)}–${String(seasonId).slice(4)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src={teamLogoUrl}
            alt=""
            width={40}
            height={40}
            className="shrink-0"
            unoptimized
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {teamName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Player stats · Season {season}
            </p>
          </div>
        </div>
        <Link
          href="/team-stats"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All teams
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={minTen}
            onChange={(e) => setMinTen(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span>Only show players with ≥ 10 games</span>
        </label>
        {source === "fallback" && <Badge variant="warning">Sample data</Badge>}
        {fetchError && source === "fallback" && (
          <Badge variant="destructive">Live fetch failed</Badge>
        )}
        <span className="text-xs text-muted-foreground">
          Updated {formatUtc(updatedAt)}
          {source === "live" ? " (from NHL API)" : ""}
        </span>
      </div>

      {fetchError && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Could not reach the NHL API ({fetchError}). Showing the committed
          snapshot so the table still works offline.
        </p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Skaters</CardTitle>
          <CardDescription>
            Every skater who played at least one game for {teamAbbrev} this
            season. Click any header to sort; hover for a definition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable<Skater>
            rows={skaters}
            columns={SKATER_COLUMNS}
            sort={skaterSort}
            setSort={setSkaterSort}
            renderIdentity={(p) => (
              <>
                <Image
                  src={p.headshot}
                  alt=""
                  width={28}
                  height={28}
                  className="shrink-0 rounded-full bg-muted"
                  unoptimized
                />
                <span className="font-medium">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-muted-foreground">{p.position}</span>
              </>
            )}
            emptyLabel={
              minTen
                ? "No skaters with 10+ games."
                : "No skaters played for this team."
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Goalies</CardTitle>
          <CardDescription>
            All goalies who appeared for {teamAbbrev} this season.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable<Goalie>
            rows={goalies}
            columns={GOALIE_COLUMNS}
            sort={goalieSort}
            setSort={setGoalieSort}
            renderIdentity={(p) => (
              <>
                <Image
                  src={p.headshot}
                  alt=""
                  width={28}
                  height={28}
                  className="shrink-0 rounded-full bg-muted"
                  unoptimized
                />
                <span className="font-medium">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-muted-foreground">G</span>
              </>
            )}
            emptyLabel={
              minTen
                ? "No goalies with 10+ games."
                : "No goalies played for this team."
            }
          />
        </CardContent>
      </Card>

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          Not affiliated with the NHL. Team names and marks are property of the
          NHL and its teams. Data from the public NHL web API for personal,
          non-commercial use.
        </p>
      </footer>
    </div>
  );
}

type WithGp = { gamesPlayed: number; playerId: number };

function filterAndSort<T extends WithGp>(
  rows: T[],
  columns: PlayerColumn<T>[],
  sort: SortState,
  minTen: boolean,
): T[] {
  const filtered = minTen ? rows.filter((r) => r.gamesPlayed >= 10) : rows.slice();
  if (sort.kind === "name") {
    const nameOf = (r: T) =>
      (r as unknown as { firstName: string; lastName: string }).lastName +
      " " +
      (r as unknown as { firstName: string; lastName: string }).firstName;
    filtered.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    if (sort.dir === "desc") filtered.reverse();
    return filtered;
  }
  const col = columns.find((c) => c.id === sort.id);
  if (!col) return filtered;
  const mult = sort.dir === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    const av = col.get(a);
    const bv = col.get(b);
    if (av === bv) return a.playerId - b.playerId;
    return (av - bv) * mult;
  });
  return filtered;
}

function PlayerTable<T extends WithGp>({
  rows,
  columns,
  sort,
  setSort,
  renderIdentity,
  emptyLabel,
}: {
  rows: T[];
  columns: PlayerColumn<T>[];
  sort: SortState;
  setSort: (s: SortState) => void;
  renderIdentity: (p: T) => React.ReactNode;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  function onNameClick() {
    if (sort.kind === "name") {
      setSort({ kind: "name", dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ kind: "name", dir: "asc" });
    }
  }

  function onColClick(col: PlayerColumn<T>) {
    if (sort.kind === "col" && sort.id === col.id) {
      setSort({
        kind: "col",
        id: col.id,
        dir: sort.dir === "asc" ? "desc" : "asc",
      });
    } else {
      setSort({
        kind: "col",
        id: col.id,
        dir: col.higherIsBetter ? "desc" : "asc",
      });
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="sticky left-0 z-10 bg-background"
            aria-sort={
              sort.kind === "name"
                ? sort.dir === "asc"
                  ? "ascending"
                  : "descending"
                : "none"
            }
          >
            <SortButton
              active={sort.kind === "name"}
              dir={sort.kind === "name" ? sort.dir : null}
              onClick={onNameClick}
              label="Player"
            />
          </TableHead>
          {columns.map((col) => {
            const active = sort.kind === "col" && sort.id === col.id;
            return (
              <TableHead
                key={col.id}
                className="whitespace-nowrap text-right"
                aria-sort={
                  active
                    ? sort.dir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <Tooltip
                  content={col.tooltip}
                  className="justify-end"
                  contentClassName="text-right"
                >
                  <SortButton
                    active={active}
                    dir={active ? sort.dir : null}
                    onClick={() => onColClick(col)}
                    label={col.label}
                  />
                </Tooltip>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.playerId}>
            <TableCell className="sticky left-0 z-10 bg-background">
              <div className="flex items-center gap-2 whitespace-nowrap">
                {renderIdentity(row)}
              </div>
            </TableCell>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                className={cn(
                  "text-right tabular-nums",
                  sort.kind === "col" &&
                    sort.id === col.id &&
                    "font-medium text-foreground",
                )}
              >
                {formatPlayerValue(col.get(row), col.format)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SortButton({
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
