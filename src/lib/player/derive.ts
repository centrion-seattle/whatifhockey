import type { SkaterSplits } from "./types";

export type SplitTotals = {
  goals: number;
  assists: number;
  points: number;
  shots: number;
  toiSeconds: number;
  toiPct: number;
  goalsPer60: number;
  pointsPer60: number;
  shotsPer60: number;
};

function per60(total: number, toiSeconds: number): number {
  if (toiSeconds <= 0) return 0;
  return (total * 3600) / toiSeconds;
}

export function derivePpSplit(s: SkaterSplits): SplitTotals | undefined {
  const p = s.powerPlay;
  if (!p) return undefined;
  const toi = p.ppTimeOnIceSeconds;
  return {
    goals: p.ppGoals,
    assists: p.ppAssists,
    points: p.ppPoints,
    shots: p.ppShots,
    toiSeconds: toi,
    toiPct: p.ppTimeOnIcePct,
    goalsPer60: p.ppGoalsPer60,
    pointsPer60: p.ppPointsPer60,
    shotsPer60: p.ppShotsPer60,
  };
}

export function derivePkSplit(s: SkaterSplits): SplitTotals | undefined {
  const k = s.penaltyKill;
  if (!k) return undefined;
  return {
    goals: k.shGoals,
    assists: k.shAssists,
    points: k.shPoints,
    shots: k.shShots,
    toiSeconds: k.shTimeOnIceSeconds,
    toiPct: k.shTimeOnIcePct,
    goalsPer60: k.shGoalsPer60,
    pointsPer60: k.shPointsPer60,
    shotsPer60: k.shShotsPer60,
  };
}

export function deriveEvSplit(s: SkaterSplits): SplitTotals | undefined {
  const sum = s.summary;
  if (!sum) return undefined;
  const pp = s.powerPlay;
  const pk = s.penaltyKill;
  const evGoals = sum.goals - (pp?.ppGoals ?? 0) - (pk?.shGoals ?? 0);
  const evAssists =
    sum.assists -
    ((pp?.ppPoints ?? 0) - (pp?.ppGoals ?? 0)) -
    ((pk?.shPoints ?? 0) - (pk?.shGoals ?? 0));
  const evPoints = sum.points - (pp?.ppPoints ?? 0) - (pk?.shPoints ?? 0);
  const evShots = sum.shots - (pp?.ppShots ?? 0) - (pk?.shShots ?? 0);
  const totalToi = sum.timeOnIcePerGameSeconds * sum.gamesPlayed;
  const evToi = Math.max(
    0,
    totalToi - (pp?.ppTimeOnIceSeconds ?? 0) - (pk?.shTimeOnIceSeconds ?? 0),
  );
  const evToiPct = totalToi > 0 ? (evToi / totalToi) * 100 : 0;
  return {
    goals: Math.max(0, evGoals),
    assists: Math.max(0, evAssists),
    points: Math.max(0, evPoints),
    shots: Math.max(0, evShots),
    toiSeconds: evToi,
    toiPct: evToiPct,
    goalsPer60: per60(evGoals, evToi),
    pointsPer60: per60(evPoints, evToi),
    shotsPer60: per60(evShots, evToi),
  };
}

export function rollingAverage(
  values: number[],
  window: number,
): Array<number | null> {
  const out: Array<number | null> = [];
  for (let i = 0; i < values.length; i++) {
    if (i + 1 < window) {
      out.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += values[j];
    out.push(sum / window);
  }
  return out;
}

export function cumulative(values: number[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const v of values) {
    acc += v;
    out.push(acc);
  }
  return out;
}
