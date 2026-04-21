import type { Game } from "./types";

export function isPlayed(game: Game): boolean {
  return game.status === "final";
}

export function isUpcoming(game: Game): boolean {
  return game.status === "scheduled" || game.status === "live";
}

export function sortByStart(games: Game[]): Game[] {
  return [...games].sort((a, b) =>
    a.startTimeUtc < b.startTimeUtc ? -1 : a.startTimeUtc > b.startTimeUtc ? 1 : 0,
  );
}

/** Key: gameDateLocal (YYYY-MM-DD). Insertion order follows the input. */
export function groupByDay(games: Game[]): Map<string, Game[]> {
  const out = new Map<string, Game[]>();
  for (const g of games) {
    const list = out.get(g.gameDateLocal);
    if (list) list.push(g);
    else out.set(g.gameDateLocal, [g]);
  }
  return out;
}

/** Key: YYYY-MM. */
export function groupByMonth(games: Game[]): Map<string, Game[]> {
  const out = new Map<string, Game[]>();
  for (const g of games) {
    const key = g.gameDateLocal.slice(0, 7);
    const list = out.get(key);
    if (list) list.push(g);
    else out.set(key, [g]);
  }
  return out;
}

export function filterByTeam(games: Game[], abbrev: string): Game[] {
  return games.filter(
    (g) => g.home.abbrev === abbrev || g.away.abbrev === abbrev,
  );
}

export function filterMatchup(games: Game[], a: string, b: string): Game[] {
  return games.filter((g) => {
    const teams = [g.home.abbrev, g.away.abbrev];
    return teams.includes(a) && teams.includes(b);
  });
}

export type ResultSummary = {
  winnerAbbrev: string;
  winnerScore: number;
  loserAbbrev: string;
  loserScore: number;
  tag?: "OT" | "SO";
};

export function formatResult(game: Game): ResultSummary | null {
  if (game.status !== "final") return null;
  const { home, away } = game;
  if (home.score == null || away.score == null) return null;
  const homeWon = home.score >= away.score;
  const winner = homeWon ? home : away;
  const loser = homeWon ? away : home;
  const tag =
    game.resultKind === "ot" ? "OT" : game.resultKind === "so" ? "SO" : undefined;
  return {
    winnerAbbrev: winner.abbrev,
    winnerScore: winner.score!,
    loserAbbrev: loser.abbrev,
    loserScore: loser.score!,
    tag,
  };
}

export function getSeasonBounds(
  games: Game[],
): { first: string; last: string } | null {
  if (games.length === 0) return null;
  let first = games[0].gameDateLocal;
  let last = games[0].gameDateLocal;
  for (const g of games) {
    if (g.gameDateLocal < first) first = g.gameDateLocal;
    if (g.gameDateLocal > last) last = g.gameDateLocal;
  }
  return { first, last };
}

/** W/L record for `abbrev` across the given games. */
export function recordFor(
  games: Game[],
  abbrev: string,
): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;
  for (const g of games) {
    if (g.status !== "final") continue;
    if (!g.winnerAbbrev) continue;
    const participated = g.home.abbrev === abbrev || g.away.abbrev === abbrev;
    if (!participated) continue;
    if (g.winnerAbbrev === abbrev) wins++;
    else losses++;
  }
  return { wins, losses };
}
