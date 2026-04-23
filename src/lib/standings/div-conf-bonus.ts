import type { Game } from "@/lib/schedule/types";
import type { TeamStanding } from "./types";

export function applyDivConfBonus(
  teams: TeamStanding[],
  games: Game[],
): void {
  const info = new Map<string, { div: string; conf: string }>();
  for (const t of teams) info.set(t.abbrev, { div: t.division, conf: t.conference });

  const pts = new Map<string, number>();
  for (const t of teams) pts.set(t.abbrev, 0);

  for (const g of games) {
    if (g.status !== "final" || g.gameType !== "regular") continue;
    const hi = info.get(g.home.abbrev);
    const ai = info.get(g.away.abbrev);
    if (!hi || !ai || !g.winnerAbbrev) continue;

    const loser =
      g.winnerAbbrev === g.home.abbrev ? g.away.abbrev : g.home.abbrev;
    const samDiv = hi.div === ai.div;
    const samConf = hi.conf === ai.conf;
    const winPts = samDiv ? 3 : samConf ? 2 : 1;

    pts.set(g.winnerAbbrev, (pts.get(g.winnerAbbrev) ?? 0) + winPts);

    if (g.resultKind === "ot" || g.resultKind === "so") {
      pts.set(loser, (pts.get(loser) ?? 0) + 0.5);
    }
  }

  for (const t of teams) t.divConfBonusPoints = pts.get(t.abbrev) ?? 0;
}
