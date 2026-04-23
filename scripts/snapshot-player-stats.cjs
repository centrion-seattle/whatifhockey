#!/usr/bin/env node
"use strict";

/**
 * Writes src/lib/nhl/fallback-player-landing.json and fallback-player-splits.json.
 *
 *   node scripts/snapshot-player-stats.cjs
 *
 * Landing is fetched once per player id found in fallback-club-stats.json
 * (bounded-concurrency pool). Splits fetch each /stats/rest/en/skater/*
 * endpoint once for the current season (limit=-1) and index by playerId.
 *
 * Mapping here must stay in sync with
 * src/lib/nhl/map-player-landing.ts and src/lib/nhl/fetch-player-splits.ts.
 */

const fs = require("fs");
const path = require("path");

const SEASONS_URL = "https://api-web.nhle.com/v1/standings-season";
const LANDING_URL = (id) => `https://api-web.nhle.com/v1/player/${id}/landing`;
const SPLITS_URL = (endpoint, season) =>
  `https://api.nhle.com/stats/rest/en/skater/${endpoint}?cayenneExp=seasonId=${season}%20and%20gameTypeId=2&limit=-1`;

const ROOT = path.join(__dirname, "..");
const CLUB_STATS_PATH = path.join(
  ROOT,
  "src",
  "lib",
  "nhl",
  "fallback-club-stats.json",
);
const OUT_LANDING = path.join(
  ROOT,
  "src",
  "lib",
  "nhl",
  "fallback-player-landing.json",
);
const OUT_SPLITS = path.join(
  ROOT,
  "src",
  "lib",
  "nhl",
  "fallback-player-splits.json",
);

const CONCURRENCY = 12;

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "hockey-standings-app/1.0 (snapshot)",
    },
  });
  if (!res.ok) throw new Error(url + " → HTTP " + res.status);
  return res.json();
}

function toiToSeconds(toi) {
  if (!toi) return 0;
  const parts = String(toi).split(":");
  if (parts.length !== 2) return 0;
  const m = Number(parts[0]);
  const s = Number(parts[1]);
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 0;
  return m * 60 + s;
}

function mapSkaterSeasonTotal(r) {
  return {
    kind: "skater",
    season: r.season,
    sequence: r.sequence,
    gameTypeId: r.gameTypeId,
    leagueAbbrev: r.leagueAbbrev,
    teamName: r.teamName?.default ?? "",
    gamesPlayed: r.gamesPlayed,
    goals: r.goals,
    assists: r.assists,
    points: r.points,
    plusMinus: r.plusMinus ?? 0,
    pim: r.pim ?? 0,
    powerPlayGoals: r.powerPlayGoals ?? 0,
    powerPlayPoints: r.powerPlayPoints ?? 0,
    shorthandedGoals: r.shorthandedGoals ?? 0,
    shorthandedPoints: r.shorthandedPoints ?? 0,
    gameWinningGoals: r.gameWinningGoals ?? 0,
    otGoals: r.otGoals ?? 0,
    shots: r.shots ?? 0,
    shootingPct: r.shootingPctg ?? 0,
    avgToiSeconds: toiToSeconds(r.avgToi),
    faceoffWinPct: r.faceoffWinningPctg ?? 0,
  };
}

function mapGoalieSeasonTotal(r) {
  return {
    kind: "goalie",
    season: r.season,
    sequence: r.sequence,
    gameTypeId: r.gameTypeId,
    leagueAbbrev: r.leagueAbbrev,
    teamName: r.teamName?.default ?? "",
    gamesPlayed: r.gamesPlayed,
    gamesStarted: r.gamesStarted ?? 0,
    wins: r.wins ?? 0,
    losses: r.losses ?? 0,
    otLosses: r.otLosses ?? 0,
    goalsAgainstAvg: r.goalsAgainstAvg ?? 0,
    savePct: r.savePctg ?? 0,
    shotsAgainst: r.shotsAgainst ?? 0,
    goalsAgainst: r.goalsAgainst ?? 0,
    shutouts: r.shutouts ?? 0,
    goals: r.goals ?? 0,
    assists: r.assists ?? 0,
    pim: r.pim ?? 0,
    timeOnIceSeconds: toiToSeconds(r.timeOnIce),
  };
}

function isGoalieSeasonRow(r) {
  return (
    typeof r.wins === "number" ||
    typeof r.savePctg === "number" ||
    typeof r.goalsAgainstAvg === "number"
  );
}

function mapSkaterLast5(r) {
  return {
    kind: "skater",
    gameId: r.gameId,
    gameDate: r.gameDate,
    gameTypeId: r.gameTypeId,
    opponentAbbrev: r.opponentAbbrev,
    homeRoadFlag: r.homeRoadFlag,
    teamAbbrev: r.teamAbbrev,
    goals: r.goals,
    assists: r.assists,
    points: r.points,
    plusMinus: r.plusMinus,
    shots: r.shots,
    toi: r.toi,
    pim: r.pim,
  };
}

function mapGoalieLast5(r) {
  return {
    kind: "goalie",
    gameId: r.gameId,
    gameDate: r.gameDate,
    gameTypeId: r.gameTypeId,
    opponentAbbrev: r.opponentAbbrev,
    homeRoadFlag: r.homeRoadFlag,
    teamAbbrev: r.teamAbbrev,
    gamesStarted: r.gamesStarted,
    decision: r.decision,
    shotsAgainst: r.shotsAgainst,
    goalsAgainst: r.goalsAgainst,
    savePct: r.savePctg,
    toi: r.toi,
  };
}

function mapSkaterFeatured(f) {
  if (!f) return undefined;
  return {
    kind: "skater",
    gamesPlayed: f.gamesPlayed,
    goals: f.goals,
    assists: f.assists,
    points: f.points,
    plusMinus: f.plusMinus,
    pim: f.pim,
    shots: f.shots,
    shootingPct: f.shootingPctg,
    powerPlayGoals: f.powerPlayGoals,
    powerPlayPoints: f.powerPlayPoints,
    shorthandedGoals: f.shorthandedGoals,
    gameWinningGoals: f.gameWinningGoals,
  };
}

function mapGoalieFeatured(f) {
  if (!f) return undefined;
  return {
    kind: "goalie",
    gamesPlayed: f.gamesPlayed,
    wins: f.wins,
    losses: f.losses,
    otLosses: f.otLosses,
    savePct: f.savePctg,
    goalsAgainstAvg: f.goalsAgainstAvg,
    shutouts: f.shutouts,
  };
}

function mapSkaterCareerTotals(t) {
  if (!t) return undefined;
  return { ...mapSkaterFeatured(t), avgToiSeconds: toiToSeconds(t.avgToi) };
}

function mapGoalieCareerTotals(t) {
  if (!t) return undefined;
  return {
    ...mapGoalieFeatured(t),
    gamesStarted: t.gamesStarted,
    shotsAgainst: t.shotsAgainst,
    goalsAgainst: t.goalsAgainst,
    timeOnIceSeconds: toiToSeconds(t.timeOnIce),
  };
}

function isGoalieFeatured(f) {
  return f && typeof f.wins === "number";
}

function mapAward(a) {
  return {
    trophy: a.trophy.default,
    seasons: (a.seasons || []).map((s) => ({
      seasonId: s.seasonId,
      gameTypeId: s.gameTypeId,
      goals: s.goals,
      assists: s.assists,
      points: s.points,
      plusMinus: s.plusMinus,
      wins: s.wins,
      savePct: s.savePctg,
      goalsAgainstAvg: s.goalsAgainstAvg,
    })),
  };
}

function mapLanding(raw) {
  const seasonTotals = (raw.seasonTotals || []).map((r) =>
    isGoalieSeasonRow(r) ? mapGoalieSeasonTotal(r) : mapSkaterSeasonTotal(r),
  );
  const last5Games = (raw.last5Games || []).map((r) =>
    typeof r.decision !== "undefined" || typeof r.savePctg !== "undefined"
      ? mapGoalieLast5(r)
      : mapSkaterLast5(r),
  );
  const fSub = raw.featuredStats?.regularSeason?.subSeason;
  const fCar = raw.featuredStats?.regularSeason?.career;
  const fPlay = raw.featuredStats?.playoffs?.subSeason;
  const featuredRegular = fSub
    ? isGoalieFeatured(fSub)
      ? mapGoalieFeatured(fSub)
      : mapSkaterFeatured(fSub)
    : undefined;
  const careerReg = raw.careerTotals?.regularSeason;
  const featuredCareer = careerReg
    ? isGoalieFeatured(careerReg)
      ? mapGoalieCareerTotals(careerReg)
      : mapSkaterCareerTotals(careerReg)
    : fCar
      ? isGoalieFeatured(fCar)
        ? mapGoalieFeatured(fCar)
        : mapSkaterFeatured(fCar)
      : undefined;
  const featuredPlayoffs = fPlay
    ? isGoalieFeatured(fPlay)
      ? mapGoalieFeatured(fPlay)
      : mapSkaterFeatured(fPlay)
    : undefined;
  return {
    bio: {
      playerId: raw.playerId,
      firstName: raw.firstName.default,
      lastName: raw.lastName.default,
      fullName: `${raw.firstName.default} ${raw.lastName.default}`,
      position: raw.position,
      sweaterNumber: raw.sweaterNumber,
      headshot: raw.headshot,
      heroImage: raw.heroImage,
      heightInInches: raw.heightInInches,
      heightInCentimeters: raw.heightInCentimeters,
      weightInPounds: raw.weightInPounds,
      weightInKilograms: raw.weightInKilograms,
      birthDate: raw.birthDate,
      birthCity: raw.birthCity?.default,
      birthStateProvince: raw.birthStateProvince?.default,
      birthCountry: raw.birthCountry,
      shootsCatches: raw.shootsCatches,
      draft: raw.draftDetails
        ? {
            year: raw.draftDetails.year,
            teamAbbrev: raw.draftDetails.teamAbbrev,
            round: raw.draftDetails.round,
            pickInRound: raw.draftDetails.pickInRound,
            overallPick: raw.draftDetails.overallPick,
          }
        : undefined,
      isActive: raw.isActive,
      inHHOF: raw.inHHOF === 1,
      inTop100AllTime: raw.inTop100AllTime === 1,
      currentTeamAbbrev: raw.currentTeamAbbrev,
      currentTeamLogo: raw.teamLogo,
      currentTeamName: raw.fullTeamName?.default,
      twitterLink: raw.twitterLink,
      watchLink: raw.watchLink,
      shopLink: raw.shopLink,
    },
    seasonTotals,
    last5Games,
    featuredSeason: raw.featuredStats?.season,
    featuredRegular,
    featuredCareer,
    featuredPlayoffs,
    awards: (raw.awards || []).map(mapAward),
    badges: (raw.badges || [])
      .map((b) => b.title?.default)
      .filter(Boolean),
  };
}

function num(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function buildSkaterSplits(seasonId, summary, realtime, pp, pk, fo, so) {
  const indexBy = (rows) => {
    const m = new Map();
    for (const r of rows) m.set(r.playerId, r);
    return m;
  };
  const sM = indexBy(summary);
  const rM = indexBy(realtime);
  const pM = indexBy(pp);
  const kM = indexBy(pk);
  const fM = indexBy(fo);
  const oM = indexBy(so);
  const ids = new Set([
    ...sM.keys(),
    ...rM.keys(),
    ...pM.keys(),
    ...kM.keys(),
    ...fM.keys(),
    ...oM.keys(),
  ]);
  const out = {};
  for (const id of ids) {
    const s = sM.get(id);
    const rt = rM.get(id);
    const p = pM.get(id);
    const k = kM.get(id);
    const f = fM.get(id);
    const o = oM.get(id);
    out[String(id)] = {
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
  }
  return out;
}

async function pool(items, worker, concurrency) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      try {
        results[i] = await worker(items[i], i);
      } catch (e) {
        results[i] = { error: e.message };
      }
    }
  }
  const workers = [];
  for (let i = 0; i < concurrency; i++) workers.push(run());
  await Promise.all(workers);
  return results;
}

async function main() {
  if (typeof fetch !== "function") {
    console.error("Requires Node 18+ (global fetch).");
    process.exit(1);
  }

  const seasons = await fetchJson(SEASONS_URL);
  const seasonId = seasons.seasons[seasons.seasons.length - 1].id;
  console.log("Season:", seasonId);

  const club = JSON.parse(fs.readFileSync(CLUB_STATS_PATH, "utf8"));
  const playerIds = new Set();
  for (const team of Object.values(club.byAbbrev)) {
    for (const s of team.skaters) playerIds.add(s.playerId);
    for (const g of team.goalies) playerIds.add(g.playerId);
  }
  const ids = Array.from(playerIds);
  console.log("Fetching landing for", ids.length, "players…");

  const results = await pool(
    ids,
    async (id) => {
      const raw = await fetchJson(LANDING_URL(id));
      return [id, mapLanding(raw)];
    },
    CONCURRENCY,
  );

  const byId = {};
  let failed = 0;
  for (const r of results) {
    if (!r || r.error) {
      failed++;
      continue;
    }
    byId[String(r[0])] = r[1];
  }
  console.log("Landing OK:", Object.keys(byId).length, "failed:", failed);

  fs.writeFileSync(
    OUT_LANDING,
    JSON.stringify(
      { seasonId, updatedAt: new Date().toISOString(), byId },
      null,
      2,
    ) + "\n",
  );
  console.log("Wrote", OUT_LANDING);

  console.log("Fetching league-wide skater splits…");
  const [summary, realtime, pp, pk, fo, so] = await Promise.all([
    fetchJson(SPLITS_URL("summary", seasonId)).then((d) => d.data || []),
    fetchJson(SPLITS_URL("realtime", seasonId)).then((d) => d.data || []),
    fetchJson(SPLITS_URL("powerplay", seasonId)).then((d) => d.data || []),
    fetchJson(SPLITS_URL("penaltykill", seasonId)).then((d) => d.data || []),
    fetchJson(SPLITS_URL("faceoffpercentages", seasonId)).then(
      (d) => d.data || [],
    ),
    fetchJson(SPLITS_URL("shootout", seasonId)).then((d) => d.data || []),
  ]);
  const bySkaterId = buildSkaterSplits(
    seasonId,
    summary,
    realtime,
    pp,
    pk,
    fo,
    so,
  );
  fs.writeFileSync(
    OUT_SPLITS,
    JSON.stringify(
      {
        seasonId,
        updatedAt: new Date().toISOString(),
        bySkaterId,
        source: "live",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Wrote",
    OUT_SPLITS,
    "—",
    Object.keys(bySkaterId).length,
    "skaters.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
