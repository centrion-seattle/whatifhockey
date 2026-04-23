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
  STAT_COLUMNS,
  formatStatValue,
  type StatColumn,
} from "@/lib/team-stats/columns";
import type { TeamStats } from "@/lib/team-stats/types";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";

type SortState =
  | { kind: "team"; dir: SortDir }
  | { kind: "stat"; columnId: string; dir: SortDir };

function defaultDirFor(col: StatColumn): SortDir {
  return col.higherIsBetter ? "desc" : "asc";
}

export function TeamStatsView(props: {
  teams: TeamStats[];
  seasonId: number;
  updatedAt: string;
  source: "live" | "fallback";
  fetchError?: string;
}) {
  const { teams, seasonId, updatedAt, source, fetchError } = props;

  const [sort, setSort] = useState<SortState>({
    kind: "stat",
    columnId: "points",
    dir: "desc",
  });

  const columnsById = useMemo(() => {
    const m = new Map<string, StatColumn>();
    for (const c of STAT_COLUMNS) m.set(c.id, c);
    return m;
  }, []);

  const sorted = useMemo(() => {
    const copy = [...teams];
    if (sort.kind === "team") {
      copy.sort((a, b) => a.name.localeCompare(b.name));
      if (sort.dir === "desc") copy.reverse();
      return copy;
    }
    const col = columnsById.get(sort.columnId);
    if (!col) return copy;
    const mult = sort.dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const av = col.get(a);
      const bv = col.get(b);
      if (av === bv) return a.name.localeCompare(b.name);
      return (av - bv) * mult;
    });
    return copy;
  }, [teams, sort, columnsById]);

  function onTeamHeaderClick() {
    setSort((prev) => {
      if (prev.kind === "team") {
        return { kind: "team", dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { kind: "team", dir: "asc" };
    });
  }

  function onStatHeaderClick(col: StatColumn) {
    setSort((prev) => {
      if (prev.kind === "stat" && prev.columnId === col.id) {
        return {
          kind: "stat",
          columnId: col.id,
          dir: prev.dir === "asc" ? "desc" : "asc",
        };
      }
      return { kind: "stat", columnId: col.id, dir: defaultDirFor(col) };
    });
  }

  const season = `${String(seasonId).slice(0, 4)}–${String(seasonId).slice(4)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Team stats
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Season-to-date team-level stats. Click any column header to sort;
          hover a header for a definition of the stat.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">Season {season}</CardTitle>
            {source === "fallback" && (
              <Badge variant="warning">Sample data</Badge>
            )}
            {fetchError && source === "fallback" && (
              <Badge variant="destructive">Live fetch failed</Badge>
            )}
          </div>
          <CardDescription>
            All 32 teams, sortable by any stat. Hover any header for details.
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            Updated {formatUtc(updatedAt)}
            {source === "live" ? " (from NHL stats API)" : ""}
          </p>
        </CardHeader>
        <CardContent>
          {fetchError && (
            <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Could not reach the NHL stats API ({fetchError}). Showing the
              committed snapshot so the table still works offline.
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="sticky left-0 z-10 bg-background"
                  aria-sort={
                    sort.kind === "team"
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <SortButton
                    active={sort.kind === "team"}
                    dir={sort.kind === "team" ? sort.dir : null}
                    onClick={onTeamHeaderClick}
                    label="Team"
                  />
                </TableHead>
                {STAT_COLUMNS.map((col) => {
                  const active =
                    sort.kind === "stat" && sort.columnId === col.id;
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
                          onClick={() => onStatHeaderClick(col)}
                          label={col.label}
                        />
                      </Tooltip>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.teamId}>
                  <TableCell className="sticky left-0 z-10 bg-background">
                    <Link
                      href={`/player-stats/${row.abbrev}`}
                      className="flex items-center gap-2 whitespace-nowrap hover:underline"
                      title={`Player stats for ${row.name}`}
                    >
                      <Image
                        src={row.logoUrl}
                        alt=""
                        width={24}
                        height={24}
                        className="shrink-0"
                        unoptimized
                      />
                      <span className="font-medium">{row.name}</span>
                      <span className="text-muted-foreground">
                        {row.abbrev}
                      </span>
                    </Link>
                  </TableCell>
                  {STAT_COLUMNS.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        "text-right tabular-nums",
                        sort.kind === "stat" &&
                          sort.columnId === col.id &&
                          "font-medium text-foreground",
                      )}
                    >
                      {formatStatValue(col.get(row), col.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
