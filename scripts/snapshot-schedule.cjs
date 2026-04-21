#!/usr/bin/env node
"use strict";

/**
 * Writes src/lib/nhl/fallback-schedule.json by fetching the full-season
 * schedule for each of the 32 NHL teams and deduping games by id.
 *
 * Run manually whenever we want a fresher offline fallback:
 *   node scripts/snapshot-schedule.cjs
 *
 * Not wired into `npm run build` — the build calls the live API itself
 * and only falls back to this JSON if every fetch fails.
 *
 * Kept as plain CommonJS (no TypeScript) so it runs without a build step.
 * The mapping below must stay in sync with src/lib/nhl/map-game.ts.
 */

const fs = require("fs");
const path = require("path");

const STANDINGS_URL = "https://api-web.nhle.com/v1/standings/now";
const CLUB_URL = (abbr) =>
  "https://api-web.nhle.com/v1/club-schedule-season/" + abbr + "/now";
const OUT_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "nhl",
  "fallback-schedule.json",
);

function mapGameType(t) {
  if (t === 1) return "preseason";
  if (t === 3) return "playoffs";
  return "regular";
}

function mapStatus(gameState, gameScheduleState) {
  if (gameScheduleState === "PPD") return "postponed";
  if (gameScheduleState === "CNCL") return "cancelled";
  switch (gameState) {
    case "FINAL":
    case "OFF":
      return "final";
    case "LIVE":
    case "CRIT":
      return "live";
    default:
      return "scheduled";
  }
}

function mapResultKind(kind) {
  if (kind === "OT") return "ot";
  if (kind === "SO") return "so";
  return "regulation";
}

function mapTeam(t) {
  return {
    abbrev: t.abbrev,
    name: t.commonName.default,
    logoUrl: t.logo,
    score: typeof t.score === "number" ? t.score : undefined,
  };
}

function mapGame(raw) {
  const status = mapStatus(raw.gameState, raw.gameScheduleState);
  const resultKind =
    status === "final" && raw.gameOutcome
      ? mapResultKind(raw.gameOutcome.lastPeriodType)
      : undefined;
  const home = mapTeam(raw.homeTeam);
  const away = mapTeam(raw.awayTeam);
  let winnerAbbrev;
  if (
    status === "final" &&
    typeof home.score === "number" &&
    typeof away.score === "number"
  ) {
    winnerAbbrev = home.score >= away.score ? home.abbrev : away.abbrev;
  }
  const out = {
    id: raw.id,
    startTimeUtc: raw.startTimeUTC,
    gameDateLocal: raw.gameDate,
    venueTimezone: raw.venueTimezone,
    season: raw.season,
    gameType: mapGameType(raw.gameType),
    status,
    home,
    away,
  };
  if (resultKind) out.resultKind = resultKind;
  if (winnerAbbrev) out.winnerAbbrev = winnerAbbrev;
  return out;
}

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

async function main() {
  if (typeof fetch !== "function") {
    console.error("Requires Node 18+ (global fetch).");
    process.exit(1);
  }

  console.log("Fetching standings to discover team abbrevs…");
  const standings = await fetchJson(STANDINGS_URL);
  const abbrevs = standings.standings.map((r) => r.teamAbbrev.default);
  console.log("Found", abbrevs.length, "teams. Fetching schedules…");

  const responses = await Promise.all(
    abbrevs.map(async (a) => {
      try {
        return await fetchJson(CLUB_URL(a));
      } catch (err) {
        console.warn("  !", a, err.message);
        return null;
      }
    }),
  );

  const byId = new Map();
  let apiGameCount = 0;
  for (const r of responses) {
    if (!r) continue;
    for (const raw of r.games) {
      apiGameCount++;
      if (byId.has(raw.id)) continue;
      byId.set(raw.id, mapGame(raw));
    }
  }

  const games = Array.from(byId.values()).sort((a, b) =>
    a.startTimeUtc < b.startTimeUtc
      ? -1
      : a.startTimeUtc > b.startTimeUtc
        ? 1
        : 0,
  );

  const payload = {
    updatedAt: new Date().toISOString(),
    games,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  console.log(
    "Wrote",
    OUT_PATH,
    "—",
    games.length,
    "unique games (of",
    apiGameCount,
    "raw rows).",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
