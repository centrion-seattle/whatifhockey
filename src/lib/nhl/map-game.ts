import type { NhlApiGame, NhlApiTeam } from "./schedule-api-types";
import type {
  Game,
  GameResultKind,
  GameStatus,
  GameTeam,
  GameType,
} from "@/lib/schedule/types";

function mapGameType(t: NhlApiGame["gameType"]): GameType {
  if (t === 1) return "preseason";
  if (t === 3) return "playoffs";
  return "regular";
}

function mapStatus(
  gameState: string,
  gameScheduleState: string,
): GameStatus {
  if (gameScheduleState === "PPD") return "postponed";
  if (gameScheduleState === "CNCL") return "cancelled";
  switch (gameState) {
    case "FINAL":
    case "OFF":
      return "final";
    case "LIVE":
    case "CRIT":
      return "live";
    case "FUT":
    case "PRE":
    default:
      return "scheduled";
  }
}

function mapResultKind(kind: "REG" | "OT" | "SO"): GameResultKind {
  if (kind === "OT") return "ot";
  if (kind === "SO") return "so";
  return "regulation";
}

function mapTeam(t: NhlApiTeam): GameTeam {
  return {
    abbrev: t.abbrev,
    name: t.commonName.default,
    logoUrl: t.logo,
    score: t.score,
  };
}

export function mapApiGameToDomain(raw: NhlApiGame): Game {
  const status = mapStatus(raw.gameState, raw.gameScheduleState);
  const resultKind =
    status === "final" && raw.gameOutcome
      ? mapResultKind(raw.gameOutcome.lastPeriodType)
      : undefined;
  const home = mapTeam(raw.homeTeam);
  const away = mapTeam(raw.awayTeam);
  let winnerAbbrev: string | undefined;
  if (
    status === "final" &&
    typeof home.score === "number" &&
    typeof away.score === "number"
  ) {
    winnerAbbrev = home.score >= away.score ? home.abbrev : away.abbrev;
  }
  return {
    id: raw.id,
    startTimeUtc: raw.startTimeUTC,
    gameDateLocal: raw.gameDate,
    venueTimezone: raw.venueTimezone,
    season: raw.season,
    gameType: mapGameType(raw.gameType),
    status,
    resultKind,
    home,
    away,
    winnerAbbrev,
  };
}
