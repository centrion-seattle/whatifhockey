#!/usr/bin/env node
"use strict";

/**
 * Writes src/lib/nhl/fallback-team-stats.json by pulling team summary +
 * realtime stats for the current season and joining to standings for
 * abbrev/logo enrichment.
 *
 * Run manually whenever the offline fallback feels stale:
 *   node scripts/snapshot-team-stats.cjs
 *
 * Kept as CommonJS so it runs without a build step. The merge below must
 * stay in sync with src/lib/nhl/fetch-team-stats.ts.
 */

const fs = require("fs");
const path = require("path");

const STANDINGS_URL = "https://api-web.nhle.com/v1/standings/now";
const SEASONS_URL = "https://api-web.nhle.com/v1/standings-season";
const SUMMARY_URL = (s) =>
  "https://api.nhle.com/stats/rest/en/team/summary?cayenneExp=seasonId=" +
  s +
  "%20and%20gameTypeId=2";
const REALTIME_URL = (s) =>
  "https://api.nhle.com/stats/rest/en/team/realtime?cayenneExp=seasonId=" +
  s +
  "%20and%20gameTypeId=2";
const OUT_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "nhl",
  "fallback-team-stats.json",
);

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

function merge(summary, realtime, standings) {
  const rtById = new Map();
  for (const r of realtime) rtById.set(r.teamId, r);
  const standByName = new Map();
  for (const s of standings) {
    standByName.set(s.teamName.default, s);
  }
  const out = [];
  for (const s of summary) {
    const rt = rtById.get(s.teamId);
    const team = standByName.get(s.teamFullName);
    if (!team || !rt) continue;
    out.push({
      teamId: team.teamAbbrev.default,
      abbrev: team.teamAbbrev.default,
      name: team.teamName.default,
      logoUrl: team.teamLogo,
      conference: team.conferenceAbbrev,
      division: team.divisionAbbrev,
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      otLosses: s.otLosses,
      points: s.points,
      pointPct: s.pointPct,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifferential: s.goalsFor - s.goalsAgainst,
      goalsForPerGame: s.goalsForPerGame,
      goalsAgainstPerGame: s.goalsAgainstPerGame,
      shotsForPerGame: s.shotsForPerGame,
      shotsAgainstPerGame: s.shotsAgainstPerGame,
      powerPlayPct: s.powerPlayPct,
      powerPlayNetPct: s.powerPlayNetPct,
      penaltyKillPct: s.penaltyKillPct,
      penaltyKillNetPct: s.penaltyKillNetPct,
      faceoffWinPct: s.faceoffWinPct,
      satPct: rt.satPct,
      hits: rt.hits,
      hitsPer60: rt.hitsPer60,
      blockedShots: rt.blockedShots,
      blockedShotsPer60: rt.blockedShotsPer60,
      giveaways: rt.giveaways,
      giveawaysPer60: rt.giveawaysPer60,
      takeaways: rt.takeaways,
      takeawaysPer60: rt.takeawaysPer60,
      shots: rt.shots,
      missedShots: rt.missedShots,
      totalShotAttempts: rt.totalShotAttempts,
      shotAttemptsBlocked: rt.shotAttemptsBlocked,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  if (typeof fetch !== "function") {
    console.error("Requires Node 18+ (global fetch).");
    process.exit(1);
  }

  console.log("Resolving current season…");
  const seasons = await fetchJson(SEASONS_URL);
  const seasonId = seasons.seasons[seasons.seasons.length - 1].id;
  console.log("Season:", seasonId);

  console.log("Fetching summary + realtime + standings…");
  const [summary, realtime, standings] = await Promise.all([
    fetchJson(SUMMARY_URL(seasonId)),
    fetchJson(REALTIME_URL(seasonId)),
    fetchJson(STANDINGS_URL),
  ]);

  const teams = merge(summary.data, realtime.data, standings.standings);
  const payload = {
    seasonId,
    updatedAt: new Date().toISOString(),
    teams,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  console.log("Wrote", OUT_PATH, "—", teams.length, "teams.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
