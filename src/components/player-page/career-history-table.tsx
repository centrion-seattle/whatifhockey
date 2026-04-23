"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import {
  GOALIE_SEASON_COLUMNS,
  SKATER_SEASON_COLUMNS,
  formatValue,
  type PlayerTableColumn,
} from "@/lib/player/columns";
import { formatSeason } from "@/lib/player/format";
import type { PlayerSeasonTotal } from "@/lib/player/types";
import { cn } from "@/lib/utils";

type SortDir = "asc" | "desc";
type SortState = { id: string; dir: SortDir };

export function CareerHistoryTable({
  seasonTotals,
  isGoalie,
}: {
  seasonTotals: PlayerSeasonTotal[];
  isGoalie: boolean;
}) {
  const [tab, setTab] = useState<"regular" | "playoffs">("regular");
  const [nhlOnly, setNhlOnly] = useState(true);
  const [sort, setSort] = useState<SortState>({ id: "season", dir: "desc" });

  const gameTypeId = tab === "regular" ? 2 : 3;

  const columns = useMemo(
    () =>
      (isGoalie
        ? GOALIE_SEASON_COLUMNS
        : SKATER_SEASON_COLUMNS) as PlayerTableColumn<PlayerSeasonTotal>[],
    [isGoalie],
  );

  const rows = useMemo(() => {
    let out = seasonTotals.filter((r) => r.gameTypeId === gameTypeId);
    if (nhlOnly) out = out.filter((r) => r.leagueAbbrev === "NHL");
    const copy = [...out];
    if (sort.id === "season") {
      copy.sort((a, b) => a.season - b.season);
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
  }, [seasonTotals, gameTypeId, nhlOnly, sort, columns]);

  function onHeaderClick(id: string, defaultDir: SortDir) {
    setSort((prev) =>
      prev.id === id
        ? { id, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { id, dir: defaultDir },
    );
  }

  const hasAnyNonNhl = seasonTotals.some(
    (r) => r.gameTypeId === gameTypeId && r.leagueAbbrev !== "NHL",
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Career history</CardTitle>
          <div className="flex items-center gap-1">
            <TabButton active={tab === "regular"} onClick={() => setTab("regular")}>
              Regular
            </TabButton>
            <TabButton
              active={tab === "playoffs"}
              onClick={() => setTab("playoffs")}
            >
              Playoffs
            </TabButton>
          </div>
        </div>
        {hasAnyNonNhl && (
          <label className="inline-flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={nhlOnly}
              onChange={(e) => setNhlOnly(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            NHL only
          </label>
        )}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No {tab} history.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="whitespace-nowrap"
                  aria-sort={
                    sort.id === "season"
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <SortBtn
                    active={sort.id === "season"}
                    dir={sort.id === "season" ? sort.dir : null}
                    onClick={() => onHeaderClick("season", "desc")}
                    label="Season"
                  />
                </TableHead>
                {columns.map((col) => {
                  const active = sort.id === col.id;
                  return (
                    <TableHead
                      key={col.id}
                      className={cn(
                        "whitespace-nowrap",
                        col.align === "left" ? "text-left" : "text-right",
                      )}
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
                        className={col.align === "left" ? "" : "justify-end"}
                      >
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
              {rows.map((row) => (
                <TableRow key={`${row.season}-${row.sequence}-${row.teamName}`}>
                  <TableCell className="whitespace-nowrap font-medium tabular-nums">
                    {formatSeason(row.season)}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        "whitespace-nowrap tabular-nums",
                        col.align === "left" ? "text-left" : "text-right",
                        sort.id === col.id && "font-medium text-foreground",
                      )}
                    >
                      {formatValue(col.get(row), col.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
