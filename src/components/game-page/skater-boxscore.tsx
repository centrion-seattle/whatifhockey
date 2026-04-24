"use client";

import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BoxscoreSkater } from "@/lib/game-summary/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SortDir = "asc" | "desc";
type SortState = { id: string; dir: SortDir };

type Col = {
  id: string;
  label: string;
  get: (s: BoxscoreSkater) => number | string;
  defaultDir: SortDir;
};

const COLUMNS: Col[] = [
  { id: "g", label: "G", get: (s) => s.goals, defaultDir: "desc" },
  { id: "a", label: "A", get: (s) => s.assists, defaultDir: "desc" },
  { id: "p", label: "P", get: (s) => s.points, defaultDir: "desc" },
  { id: "pm", label: "+/-", get: (s) => s.plusMinus, defaultDir: "desc" },
  { id: "sog", label: "SOG", get: (s) => s.sog, defaultDir: "desc" },
  { id: "hits", label: "HIT", get: (s) => s.hits, defaultDir: "desc" },
  { id: "blk", label: "BLK", get: (s) => s.blockedShots, defaultDir: "desc" },
  { id: "toi", label: "TOI", get: (s) => s.toi, defaultDir: "desc" },
  { id: "fo", label: "FO%", get: (s) => s.faceoffWinPct, defaultDir: "desc" },
];

export function SkaterBoxscore({
  home,
  away,
  homeAbbrev,
  awayAbbrev,
}: {
  home: BoxscoreSkater[];
  away: BoxscoreSkater[];
  homeAbbrev: string;
  awayAbbrev: string;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Skaters
      </h2>
      <div className="space-y-4">
        <SkaterTable skaters={away} teamLabel={awayAbbrev} />
        <SkaterTable skaters={home} teamLabel={homeAbbrev} />
      </div>
    </div>
  );
}

function SkaterTable({
  skaters,
  teamLabel,
}: {
  skaters: BoxscoreSkater[];
  teamLabel: string;
}) {
  const [sort, setSort] = useState<SortState>({ id: "p", dir: "desc" });

  const sorted = useMemo(() => {
    const copy = [...skaters];
    const col = COLUMNS.find((c) => c.id === sort.id);
    if (!col) return copy;
    const m = sort.dir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const av = col.get(a);
      const bv = col.get(b);
      if (typeof av === "string" && typeof bv === "string")
        return av.localeCompare(bv) * m;
      return ((Number(av) || 0) - (Number(bv) || 0)) * m;
    });
    return copy;
  }, [skaters, sort]);

  function onSort(id: string, defaultDir: SortDir) {
    setSort((prev) =>
      prev.id === id
        ? { id, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { id, dir: defaultDir },
    );
  }

  return (
    <div>
      <h3 className="mb-1 text-xs font-medium">{teamLabel}</h3>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              {COLUMNS.map((c) => (
                <TableHead key={c.id} className="text-right">
                  <button
                    type="button"
                    onClick={() => onSort(c.id, c.defaultDir)}
                    className={cn(
                      "text-xs uppercase tracking-wide",
                      sort.id === c.id
                        ? "font-bold text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c.label}
                    {sort.id === c.id && (
                      <span className="ml-0.5 text-[10px]">
                        {sort.dir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((s) => (
              <TableRow key={s.playerId}>
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={`/player/${s.playerId}`}
                    className="hover:underline"
                  >
                    #{s.sweaterNumber} {s.name}
                  </Link>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {s.position}
                  </span>
                </TableCell>
                {COLUMNS.map((c) => {
                  const v = c.get(s);
                  const display =
                    c.id === "fo"
                      ? typeof v === "number" && v > 0
                        ? `${(v * 100).toFixed(1)}%`
                        : "—"
                      : String(v);
                  return (
                    <TableCell
                      key={c.id}
                      className={cn(
                        "text-right tabular-nums whitespace-nowrap",
                        sort.id === c.id && "font-medium",
                      )}
                    >
                      {display}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
