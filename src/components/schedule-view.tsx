"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  formatDateShort,
  formatMonthLabel,
  formatResultLine,
  formatTimeShort,
  formatUtc,
} from "@/lib/format";
import {
  filterByTeam,
  filterMatchup,
  formatResult,
  getSeasonBounds,
  groupByDay,
  groupByMonth,
  recordFor,
} from "@/lib/schedule/helpers";
import type { Game, TeamRef } from "@/lib/schedule/types";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "team" | "matchup";

const VIEW_OPTIONS: { id: ViewMode; label: string }[] = [
  { id: "calendar", label: "Full calendar" },
  { id: "team", label: "Single team" },
  { id: "matchup", label: "Head to head" },
];

export function ScheduleView(props: {
  games: Game[];
  teams: TeamRef[];
  updatedAt: string;
  source: "live" | "fallback";
  fetchError?: string;
}) {
  const { games, teams, updatedAt, source, fetchError } = props;
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const teamsByAbbrev = useMemo(() => {
    const m = new Map<string, TeamRef>();
    for (const t of teams) m.set(t.abbrev, t);
    return m;
  }, [teams]);

  const bounds = useMemo(() => getSeasonBounds(games), [games]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            NHL schedule
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Browse the season three ways: a month-at-a-glance calendar, one
            team&apos;s run through the schedule, or the head-to-head games
            between any two teams.
          </p>
        </div>

        <div className="w-full sm:max-w-xs">
          <label htmlFor="schedule-view" className="text-sm font-medium">
            View
          </label>
          <Select
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
            <SelectTrigger id="schedule-view" aria-label="Schedule view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">
              {VIEW_OPTIONS.find((o) => o.id === viewMode)!.label}
            </CardTitle>
            {source === "fallback" && (
              <Badge variant="warning">Sample data</Badge>
            )}
            {fetchError && source === "fallback" && (
              <Badge variant="destructive">Live fetch failed</Badge>
            )}
          </div>
          <CardDescription>
            {viewMode === "calendar" &&
              "Every NHL game, grouped by night at the venue."}
            {viewMode === "team" &&
              "Pick a team to see their full season with results and upcoming dates."}
            {viewMode === "matchup" &&
              "Pick two teams to see every game they play each other this season."}
          </CardDescription>
          <p className="text-xs text-muted-foreground">
            Updated {formatUtc(updatedAt)}
            {source === "live" ? " (from NHL API)" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {fetchError && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Could not reach the NHL API ({fetchError}). Showing cached sample
              data so the page still works offline.
            </p>
          )}

          {viewMode === "calendar" && (
            <CalendarView games={games} bounds={bounds} />
          )}
          {viewMode === "team" && (
            <TeamView
              games={games}
              teams={teams}
              teamsByAbbrev={teamsByAbbrev}
            />
          )}
          {viewMode === "matchup" && (
            <MatchupView
              games={games}
              teams={teams}
              teamsByAbbrev={teamsByAbbrev}
            />
          )}
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

// ───────────────────────── Calendar view ─────────────────────────

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function monthKeyToday(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`;
}

function addMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const idx = y * 12 + (m - 1) + delta;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${pad2(nm)}`;
}

function monthGridDays(
  monthKey: string,
): { date: string; inMonth: boolean }[] {
  const [y, m] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const firstWeekday = first.getUTCDay();
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - firstWeekday);

  const cells: { date: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    const iso = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(
      d.getUTCDate(),
    )}`;
    cells.push({
      date: iso,
      inMonth: d.getUTCMonth() === m - 1 && d.getUTCFullYear() === y,
    });
  }
  return cells;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarView(props: {
  games: Game[];
  bounds: { first: string; last: string } | null;
}) {
  const { games, bounds } = props;
  const byDay = useMemo(() => groupByDay(games), [games]);

  const minMonth = bounds ? bounds.first.slice(0, 7) : null;
  const maxMonth = bounds ? bounds.last.slice(0, 7) : null;

  const initialMonth = useMemo(() => {
    const today = monthKeyToday();
    if (!minMonth || !maxMonth) return today;
    if (today < minMonth) return minMonth;
    if (today > maxMonth) return maxMonth;
    return today;
  }, [minMonth, maxMonth]);

  const [cursorMonth, setCursorMonth] = useState(initialMonth);

  const canPrev = !minMonth || cursorMonth > minMonth;
  const canNext = !maxMonth || cursorMonth < maxMonth;

  const cells = useMemo(() => monthGridDays(cursorMonth), [cursorMonth]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCursorMonth((m) => addMonth(m, -1))}
          disabled={!canPrev}
          aria-label="Previous month"
        >
          ‹ Prev
        </Button>
        <h3 className="text-base font-semibold">
          {formatMonthLabel(cursorMonth)}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCursorMonth((m) => addMonth(m, 1))}
          disabled={!canNext}
          aria-label="Next month"
        >
          Next ›
        </Button>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:block">
        <div className="mb-1 grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="px-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const games = byDay.get(cell.date) ?? [];
            return (
              <div
                key={cell.date}
                className={cn(
                  "min-h-24 rounded-md border border-border p-2 text-xs",
                  cell.inMonth ? "bg-muted/20" : "bg-muted/5 text-muted-foreground",
                )}
              >
                <div className="mb-1 text-right font-semibold tabular-nums">
                  {Number(cell.date.slice(-2))}
                </div>
                <ul className="space-y-0.5">
                  {games.map((g) => (
                    <CalendarCellGame key={g.id} game={g} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: flat list of days with games, for this month only */}
      <ul className="space-y-3 md:hidden">
        {cells
          .filter((c) => c.inMonth && (byDay.get(c.date)?.length ?? 0) > 0)
          .map((c) => {
            const games = byDay.get(c.date) ?? [];
            return (
              <li
                key={c.date}
                className="rounded-md border border-border bg-muted/20 p-3"
              >
                <p className="mb-2 text-sm font-semibold">
                  {formatDateShort(`${c.date}T12:00:00Z`)}
                </p>
                <ul className="space-y-1 text-sm">
                  {games.map((g) => (
                    <MobileDayGame key={g.id} game={g} />
                  ))}
                </ul>
              </li>
            );
          })}
        {cells.filter(
          (c) => c.inMonth && (byDay.get(c.date)?.length ?? 0) > 0,
        ).length === 0 && (
          <p className="text-sm text-muted-foreground">
            No games scheduled this month.
          </p>
        )}
      </ul>
    </div>
  );
}

function CalendarCellGame({ game }: { game: Game }) {
  const result = formatResult(game);
  if (result) {
    return (
      <li className="truncate">
        <Link href={`/game/${game.id}`} className="hover:underline">
          <span className="font-medium">{result.winnerAbbrev}</span>
          <span className="tabular-nums">
            {" "}
            {result.winnerScore}–{result.loserScore}{" "}
          </span>
          <span className="text-muted-foreground">{result.loserAbbrev}</span>
          {result.tag && (
            <span className="ml-1 text-[10px] text-muted-foreground">
              {result.tag}
            </span>
          )}
        </Link>
      </li>
    );
  }
  return (
    <li className="truncate text-muted-foreground">
      {game.away.abbrev} @ {game.home.abbrev}
    </li>
  );
}

function MobileDayGame({ game }: { game: Game }) {
  const line = formatResultLine(game);
  if (line) {
    return (
      <li className="tabular-nums">
        <Link href={`/game/${game.id}`} className="hover:underline">
          {line}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <span className="font-medium">
        {game.away.abbrev} @ {game.home.abbrev}
      </span>
      <span className="ml-2 text-muted-foreground">
        {formatTimeShort(game.startTimeUtc)}
      </span>
    </li>
  );
}

// ───────────────────────── Team view ─────────────────────────

function TeamSelect(props: {
  teams: TeamRef[];
  value?: string;
  placeholder: string;
  onChange: (abbrev: string) => void;
  id?: string;
  disabledAbbrev?: string;
}) {
  return (
    <Select value={props.value ?? ""} onValueChange={props.onChange}>
      <SelectTrigger id={props.id} aria-label={props.placeholder}>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {props.teams.map((t) => (
          <SelectItem
            key={t.abbrev}
            value={t.abbrev}
            disabled={t.abbrev === props.disabledAbbrev}
          >
            <span className="flex items-center gap-2">
              <Image
                src={t.logoUrl}
                alt=""
                width={20}
                height={20}
                className="shrink-0"
                unoptimized
              />
              <span>{t.name}</span>
              <span className="text-xs text-muted-foreground">{t.abbrev}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TeamView(props: {
  games: Game[];
  teams: TeamRef[];
  teamsByAbbrev: Map<string, TeamRef>;
}) {
  const [selected, setSelected] = useState<string | undefined>();

  const teamGames = useMemo(
    () => (selected ? filterByTeam(props.games, selected) : []),
    [props.games, selected],
  );

  const byMonth = useMemo(() => groupByMonth(teamGames), [teamGames]);

  const record = useMemo(
    () => (selected ? recordFor(teamGames, selected) : null),
    [teamGames, selected],
  );

  return (
    <div className="space-y-5">
      <div className="w-full sm:max-w-sm">
        <label htmlFor="team-picker" className="text-sm font-medium">
          Team
        </label>
        <TeamSelect
          id="team-picker"
          teams={props.teams}
          value={selected}
          placeholder="Pick a team"
          onChange={setSelected}
        />
      </div>

      {!selected && (
        <p className="text-sm text-muted-foreground">
          Choose a team to see their full season.
        </p>
      )}

      {selected && record && (
        <p className="text-sm text-muted-foreground">
          Record so far:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {record.wins}-{record.losses}
          </span>{" "}
          · {teamGames.length} games this season.
        </p>
      )}

      {selected &&
        Array.from(byMonth.entries()).map(([monthKey, games]) => (
          <div key={monthKey} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {formatMonthLabel(monthKey)}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Date</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead className="text-right">Result / Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((g) => (
                  <TeamViewRow key={g.id} game={g} teamAbbrev={selected} />
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
    </div>
  );
}

function TeamViewRow({ game, teamAbbrev }: { game: Game; teamAbbrev: string }) {
  const isHome = game.home.abbrev === teamAbbrev;
  const opponent = isHome ? game.away : game.home;
  const result = formatResult(game);

  let resultCell: React.ReactNode;
  if (result) {
    const won = result.winnerAbbrev === teamAbbrev;
    resultCell = (
      <span
        className={cn(
          "tabular-nums font-medium",
          won ? "text-emerald-400" : "text-rose-400",
        )}
      >
        {won ? "W" : "L"}{" "}
        {isHome
          ? `${game.home.score}–${game.away.score}`
          : `${game.away.score}–${game.home.score}`}
        {result.tag && (
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {result.tag}
          </Badge>
        )}
      </span>
    );
  } else {
    resultCell = (
      <span className="text-muted-foreground">
        {formatTimeShort(game.startTimeUtc)}
      </span>
    );
  }

  return (
    <TableRow>
      <TableCell className="tabular-nums">
        {formatDateShort(`${game.gameDateLocal}T12:00:00Z`)}
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{isHome ? "vs" : "@"}</span>{" "}
        <span className="inline-flex items-center gap-1.5">
          <Image
            src={opponent.logoUrl}
            alt=""
            width={20}
            height={20}
            className="shrink-0"
            unoptimized
          />
          <span className="font-medium">{opponent.name}</span>
          <span className="text-muted-foreground">{opponent.abbrev}</span>
        </span>
        {game.gameType !== "regular" && (
          <Badge variant="outline" className="ml-2 text-[10px] uppercase">
            {game.gameType === "preseason" ? "Pre" : "Playoff"}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {result ? (
          <Link href={`/game/${game.id}`} className="hover:underline">
            {resultCell}
          </Link>
        ) : (
          resultCell
        )}
      </TableCell>
    </TableRow>
  );
}

// ───────────────────────── Matchup view ─────────────────────────

function MatchupView(props: {
  games: Game[];
  teams: TeamRef[];
  teamsByAbbrev: Map<string, TeamRef>;
}) {
  const [teamA, setTeamA] = useState<string | undefined>();
  const [teamB, setTeamB] = useState<string | undefined>();

  const matchup = useMemo(
    () => (teamA && teamB ? filterMatchup(props.games, teamA, teamB) : []),
    [props.games, teamA, teamB],
  );

  const recordA = useMemo(
    () => (teamA ? recordFor(matchup, teamA) : null),
    [matchup, teamA],
  );

  const teamAName = teamA ? props.teamsByAbbrev.get(teamA)?.name ?? teamA : "";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="matchup-a" className="text-sm font-medium">
            Team A
          </label>
          <TeamSelect
            id="matchup-a"
            teams={props.teams}
            value={teamA}
            placeholder="Pick a team"
            onChange={setTeamA}
            disabledAbbrev={teamB}
          />
        </div>
        <div>
          <label htmlFor="matchup-b" className="text-sm font-medium">
            Team B
          </label>
          <TeamSelect
            id="matchup-b"
            teams={props.teams}
            value={teamB}
            placeholder="Pick a team"
            onChange={setTeamB}
            disabledAbbrev={teamA}
          />
        </div>
      </div>

      {(!teamA || !teamB) && (
        <p className="text-sm text-muted-foreground">
          Pick two teams to see their matchups this season.
        </p>
      )}

      {teamA && teamB && matchup.length === 0 && (
        <p className="text-sm text-muted-foreground">
          These teams don&apos;t face off this season.
        </p>
      )}

      {teamA && teamB && matchup.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {matchup.length} {matchup.length === 1 ? "game" : "games"}
            </span>{" "}
            this season
            {recordA && (recordA.wins + recordA.losses > 0) && (
              <>
                {" "}
                —{" "}
                <span className="tabular-nums">
                  {recordA.wins}W {recordA.losses}L
                </span>{" "}
                for {teamAName}
              </>
            )}
            .
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Date</TableHead>
                <TableHead>Home</TableHead>
                <TableHead>Away</TableHead>
                <TableHead className="text-right">Result / Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchup.map((g) => (
                <MatchupRow key={g.id} game={g} />
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}

function MatchupRow({ game }: { game: Game }) {
  const result = formatResult(game);
  return (
    <TableRow>
      <TableCell className="tabular-nums">
        {formatDateShort(`${game.gameDateLocal}T12:00:00Z`)}
      </TableCell>
      <TableCell>
        <TeamInline abbrev={game.home.abbrev} name={game.home.name} logoUrl={game.home.logoUrl} />
      </TableCell>
      <TableCell>
        <TeamInline abbrev={game.away.abbrev} name={game.away.name} logoUrl={game.away.logoUrl} />
      </TableCell>
      <TableCell className="text-right">
        {result ? (
          <Link href={`/game/${game.id}`} className="hover:underline">
            <span className="tabular-nums font-medium">
              {game.home.score}–{game.away.score}
              {result.tag && (
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {result.tag}
                </Badge>
              )}
            </span>
          </Link>
        ) : (
          <span className="text-muted-foreground">
            {formatTimeShort(game.startTimeUtc)}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}

function TeamInline({
  abbrev,
  name,
  logoUrl,
}: {
  abbrev: string;
  name: string;
  logoUrl: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Image
        src={logoUrl}
        alt=""
        width={20}
        height={20}
        className="shrink-0"
        unoptimized
      />
      <span className="font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{abbrev}</span>
    </span>
  );
}
