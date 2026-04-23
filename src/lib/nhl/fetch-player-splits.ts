import "server-only";

import fallbackData from "./fallback-player-splits.json";
import type { SkaterSplits } from "@/lib/player/types";

const REVALIDATE_SECONDS = 120;

type ApiList<T> = { data: T[]; total?: number };

type Row = Record<string, unknown> & { playerId: number };

function u(endpoint: string, seasonId: number): string {
  return `https://api.nhle.com/stats/rest/en/skater/${endpoint}?cayenneExp=seasonId=${seasonId}%20and%20gameTypeId=2&limit=-1`;
}

async function fetchList<T>(url: string): Promise<T[]> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      Accept: "application/json",
      "User-Agent": "hockey-standings-app/1.0",
    },
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  const j = (await res.json()) as ApiList<T>;
  return j.data ?? [];
}

function byId<T extends Row>(rows: T[]): Map<number, T> {
  const m = new Map<number, T>();
  for (const r of rows) m.set(r.playerId, r);
  return m;
}

export type LeagueSplits = {
  seasonId: number;
  updatedAt: string;
  bySkaterId: Record<string, SkaterSplits>;
  source: "live" | "fallback";
  error?: string;
};

type FallbackShape = LeagueSplits;

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function buildSplits(
  seasonId: number,
  summary: Map<number, Row>,
  realtime: Map<number, Row>,
  pp: Map<number, Row>,
  pk: Map<number, Row>,
  fo: Map<number, Row>,
  so: Map<number, Row>,
): Record<string, SkaterSplits> {
  const out: Record<string, SkaterSplits> = {};
  const ids = new Set<number>([
    ...summary.keys(),
    ...realtime.keys(),
    ...pp.keys(),
    ...pk.keys(),
    ...fo.keys(),
    ...so.keys(),
  ]);
  for (const id of ids) {
    const s = summary.get(id);
    const rt = realtime.get(id);
    const p = pp.get(id);
    const k = pk.get(id);
    const f = fo.get(id);
    const o = so.get(id);
    const splits: SkaterSplits = {
      seasonId,
      summary: s
        ? {
            gamesPlayed: num(s.gamesPlayed),
            goals: num(s.goals),
            assists: num(s.assists),
            points: num(s.points),
            plusMinus: num(s.plusMinus),
            shots: num(s.shots),
            shootingPct: num(s.shootingPct),
            timeOnIcePerGameSeconds: num(s.timeOnIcePerGame),
            evGoals: num(s.evGoals),
            evPoints: num(s.evPoints),
            ppGoals: num(s.ppGoals),
            ppPoints: num(s.ppPoints),
            shGoals: num(s.shGoals),
            shPoints: num(s.shPoints),
            pointsPerGame: num(s.pointsPerGame),
          }
        : undefined,
      realtime: rt
        ? {
            hits: num(rt.hits),
            hitsPer60: num(rt.hitsPer60),
            blockedShots: num(rt.blockedShots),
            blockedShotsPer60: num(rt.blockedShotsPer60),
            giveaways: num(rt.giveaways),
            giveawaysPer60: num(rt.giveawaysPer60),
            takeaways: num(rt.takeaways),
            takeawaysPer60: num(rt.takeawaysPer60),
            missedShots: num(rt.missedShots),
            missedShotWide: num(rt.missedShotWideOfNet),
            missedShotOverNet: num(rt.missedShotOverNet),
            missedShotCrossbar: num(rt.missedShotCrossbar),
            missedShotGoalpost: num(rt.missedShotGoalpost),
            missedShotShort: num(rt.missedShotShort),
            missedShotGoalLine: num(rt.missedShotGoalLine),
            firstGoals: num(rt.firstGoals),
            emptyNetGoals: num(rt.emptyNetGoals),
            otGoals: num(rt.otGoals),
          }
        : undefined,
      powerPlay: p
        ? {
            ppGoals: num(p.ppGoals),
            ppAssists: num(p.ppAssists),
            ppPoints: num(p.ppPoints),
            ppShots: num(p.ppShots),
            ppTimeOnIceSeconds: num(p.ppTimeOnIce),
            ppTimeOnIcePct: num(p.ppTimeOnIcePctPerGame),
            ppGoalsPer60: num(p.ppGoalsPer60),
            ppPointsPer60: num(p.ppPointsPer60),
            ppShotsPer60: num(p.ppShotsPer60),
            ppShootingPct: num(p.ppShootingPct),
            ppIndividualSatFor: num(p.ppIndividualSatFor),
          }
        : undefined,
      penaltyKill: k
        ? {
            shGoals: num(k.shGoals),
            shAssists: num(k.shAssists),
            shPoints: num(k.shPoints),
            shShots: num(k.shShots),
            shTimeOnIceSeconds: num(k.shTimeOnIce),
            shTimeOnIcePct: num(k.shTimeOnIcePctPerGame),
            shGoalsPer60: num(k.shGoalsPer60),
            shPointsPer60: num(k.shPointsPer60),
            shShotsPer60: num(k.shShotsPer60),
            ppGoalsAgainstPer60: num(k.ppGoalsAgainstPer60),
          }
        : undefined,
      faceoffs: f
        ? {
            totalFaceoffs: num(f.totalFaceoffs),
            faceoffWinPct: num(f.faceoffWinPct),
            offensiveZoneFaceoffs: num(f.offensiveZoneFaceoffs),
            offensiveZoneFaceoffPct: num(f.offensiveZoneFaceoffPct),
            defensiveZoneFaceoffs: num(f.defensiveZoneFaceoffs),
            defensiveZoneFaceoffPct: num(f.defensiveZoneFaceoffPct),
            neutralZoneFaceoffs: num(f.neutralZoneFaceoffs),
            neutralZoneFaceoffPct: num(f.neutralZoneFaceoffPct),
            evFaceoffPct: num(f.evFaceoffPct),
            evFaceoffs: num(f.evFaceoffs),
            ppFaceoffs: num(f.ppFaceoffs),
            ppFaceoffPct: num(f.ppFaceoffPct),
            shFaceoffs: num(f.shFaceoffs),
            shFaceoffPct: num(f.shFaceoffPct),
          }
        : undefined,
      shootout: o
        ? {
            shots: num(o.shootoutShots),
            goals: num(o.shootoutGoals),
            shootingPct: num(o.shootoutShootingPct),
            gameDecidingGoals: num(o.shootoutGameDecidingGoals),
            gamesPlayed: num(o.shootoutGamesPlayed),
            careerShots: num(o.careerShootoutShots),
            careerGoals: num(o.careerShootoutGoals),
            careerShootingPct: num(o.careerShootoutShootingPct),
            careerGameDecidingGoals: num(o.careerShootoutGameDecidingGoals),
          }
        : undefined,
    };
    out[String(id)] = splits;
  }
  return out;
}

export async function getLeagueSplits(
  seasonId: number,
): Promise<LeagueSplits> {
  try {
    const [summary, realtime, pp, pk, fo, so] = await Promise.all([
      fetchList<Row>(u("summary", seasonId)),
      fetchList<Row>(u("realtime", seasonId)),
      fetchList<Row>(u("powerplay", seasonId)),
      fetchList<Row>(u("penaltykill", seasonId)),
      fetchList<Row>(u("faceoffpercentages", seasonId)),
      fetchList<Row>(u("shootout", seasonId)),
    ]);
    const bySkaterId = buildSplits(
      seasonId,
      byId(summary),
      byId(realtime),
      byId(pp),
      byId(pk),
      byId(fo),
      byId(so),
    );
    return {
      seasonId,
      updatedAt: new Date().toISOString(),
      bySkaterId,
      source: "live",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const fb = fallbackData as unknown as FallbackShape;
    return {
      seasonId: fb.seasonId,
      updatedAt: fb.updatedAt,
      bySkaterId: fb.bySkaterId,
      source: "fallback",
      error: message,
    };
  }
}

export function leagueRank(
  bySkaterId: Record<string, SkaterSplits>,
  playerId: number,
  pick: (s: SkaterSplits) => number | undefined,
  minGp = 20,
): { rank: number; outOf: number } | null {
  const values: Array<{ id: number; v: number }> = [];
  for (const [id, s] of Object.entries(bySkaterId)) {
    const gp = s.summary?.gamesPlayed ?? 0;
    if (gp < minGp) continue;
    const v = pick(s);
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    values.push({ id: Number(id), v });
  }
  if (values.length === 0) return null;
  values.sort((a, b) => b.v - a.v);
  const idx = values.findIndex((r) => r.id === playerId);
  if (idx === -1) return null;
  return { rank: idx + 1, outOf: values.length };
}
