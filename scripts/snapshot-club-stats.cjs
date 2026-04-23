#!/usr/bin/env node
"use strict";

/**
 * Writes src/lib/nhl/fallback-club-stats.json — per-team skater + goalie
 * rosters for the current season, keyed by team abbrev.
 *
 *   node scripts/snapshot-club-stats.cjs
 *
 * Mapping must stay in sync with src/lib/nhl/fetch-club-stats.ts
 * (mapSkater / mapGoalie).
 */

const fs = require("fs");
const path = require("path");

const STANDINGS_URL = "https://api-web.nhle.com/v1/standings/now";
const SEASONS_URL = "https://api-web.nhle.com/v1/standings-season";
const CLUB_URL = (abbr, season) =>
  "https://api-web.nhle.com/v1/club-stats/" + abbr + "/" + season + "/2";
const OUT_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "nhl",
  "fallback-club-stats.json",
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

function mapSkater(r) {
  return {
    playerId: r.playerId,
    firstName: r.firstName.default,
    lastName: r.lastName.default,
    headshot: r.headshot,
    position: r.positionCode,
    gamesPlayed: r.gamesPlayed,
    goals: r.goals,
    assists: r.assists,
    points: r.points,
    plusMinus: r.plusMinus,
    penaltyMinutes: r.penaltyMinutes,
    powerPlayGoals: r.powerPlayGoals,
    shorthandedGoals: r.shorthandedGoals,
    gameWinningGoals: r.gameWinningGoals,
    overtimeGoals: r.overtimeGoals,
    shots: r.shots,
    shootingPct: r.shootingPctg,
    avgTimeOnIcePerGame: r.avgTimeOnIcePerGame,
    avgShiftsPerGame: r.avgShiftsPerGame,
    faceoffWinPct: r.faceoffWinPctg,
  };
}

function mapGoalie(r) {
  return {
    playerId: r.playerId,
    firstName: r.firstName.default,
    lastName: r.lastName.default,
    headshot: r.headshot,
    gamesPlayed: r.gamesPlayed,
    gamesStarted: r.gamesStarted,
    wins: r.wins,
    losses: r.losses,
    overtimeLosses: r.overtimeLosses,
    goalsAgainstAverage: r.goalsAgainstAverage,
    savePercentage: r.savePercentage,
    shotsAgainst: r.shotsAgainst,
    saves: r.saves,
    goalsAgainst: r.goalsAgainst,
    shutouts: r.shutouts,
    goals: r.goals,
    assists: r.assists,
    points: r.points,
    penaltyMinutes: r.penaltyMinutes,
    timeOnIce: r.timeOnIce,
  };
}

async function main() {
  if (typeof fetch !== "function") {
    console.error("Requires Node 18+ (global fetch).");
    process.exit(1);
  }

  const seasons = await fetchJson(SEASONS_URL);
  const seasonId = seasons.seasons[seasons.seasons.length - 1].id;
  console.log("Season:", seasonId);

  const standings = await fetchJson(STANDINGS_URL);
  const abbrevs = standings.standings.map((r) => r.teamAbbrev.default);
  console.log("Fetching club-stats for", abbrevs.length, "teams…");

  const byAbbrev = {};
  const entries = await Promise.all(
    abbrevs.map(async (a) => {
      try {
        const d = await fetchJson(CLUB_URL(a, seasonId));
        return [
          a,
          {
            skaters: (d.skaters || []).map(mapSkater),
            goalies: (d.goalies || []).map(mapGoalie),
          },
        ];
      } catch (err) {
        console.warn("  !", a, err.message);
        return [a, { skaters: [], goalies: [] }];
      }
    }),
  );
  for (const [a, v] of entries) byAbbrev[a] = v;

  const payload = {
    seasonId,
    updatedAt: new Date().toISOString(),
    byAbbrev,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  const total = Object.values(byAbbrev).reduce(
    (n, v) => n + v.skaters.length + v.goalies.length,
    0,
  );
  console.log("Wrote", OUT_PATH, "—", total, "player rows.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
