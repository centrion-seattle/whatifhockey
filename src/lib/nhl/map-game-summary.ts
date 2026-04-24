import type {
  NhlBoxscoreGoalie,
  NhlBoxscoreSkater,
  NhlBoxscoreTeamPlayers,
  NhlGameBoxscoreResponse,
  NhlGameLandingResponse,
  NhlLandingGoal,
  NhlLandingPenalty,
  NhlLandingPenaltyPeriod,
  NhlLandingScoringPeriod,
  NhlLandingThreeStar,
  NhlPeriodDescriptor,
} from "./game-summary-api-types";
import type {
  BoxscoreGoalie,
  BoxscoreSkater,
  GameSummary,
  PenaltyEvent,
  PenaltyPeriod,
  ScoringGoal,
  ScoringPeriod,
  SummaryTeam,
  TeamStatLine,
  ThreeStar,
} from "@/lib/game-summary/types";

function periodLabel(pd: NhlPeriodDescriptor): string {
  if (pd.periodType === "SO") return "Shootout";
  if (pd.periodType === "OT") return pd.number > 4 ? `OT${pd.number - 3}` : "OT";
  return `Period ${pd.number}`;
}

function mapTeam(t: { abbrev: string; commonName: { default: string }; logo: string; score: number; sog: number }): SummaryTeam {
  return { abbrev: t.abbrev, name: t.commonName.default, logoUrl: t.logo, score: t.score, sog: t.sog };
}

function mapGoal(g: NhlLandingGoal): ScoringGoal {
  return {
    time: g.timeInPeriod,
    strength: g.strength,
    teamAbbrev: g.teamAbbrev.default,
    scorer: { playerId: g.playerId, name: g.name.default, headshot: g.headshot, seasonTotal: g.goalsToDate },
    assists: g.assists.map((a) => ({ playerId: a.playerId, name: a.name.default, seasonTotal: a.assistsToDate })),
    shotType: g.shotType,
    goalModifier: g.goalModifier === "none" ? undefined : g.goalModifier,
    awayScore: g.awayScore,
    homeScore: g.homeScore,
  };
}

function mapScoringPeriod(p: NhlLandingScoringPeriod): ScoringPeriod {
  return { periodLabel: periodLabel(p.periodDescriptor), goals: p.goals.map(mapGoal) };
}

function penaltyName(descKey: string): string {
  return descKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapPenalty(p: NhlLandingPenalty): PenaltyEvent {
  const by = p.committedByPlayer;
  return {
    time: p.timeInPeriod,
    playerName: `${by.firstName.default} ${by.lastName.default}`,
    teamAbbrev: p.teamAbbrev.default,
    infraction: penaltyName(p.descKey),
    duration: p.duration,
    drawnByName: p.drawnBy ? `${p.drawnBy.firstName.default} ${p.drawnBy.lastName.default}` : undefined,
  };
}

function mapPenaltyPeriod(p: NhlLandingPenaltyPeriod): PenaltyPeriod {
  return { periodLabel: periodLabel(p.periodDescriptor), penalties: p.penalties.map(mapPenalty) };
}

function mapStar(s: NhlLandingThreeStar): ThreeStar {
  return {
    star: s.star as 1 | 2 | 3,
    playerId: s.playerId,
    name: s.name.default,
    teamAbbrev: s.teamAbbrev,
    headshot: s.headshot,
    sweaterNo: s.sweaterNo,
    position: s.position,
    goals: s.goals,
    assists: s.assists,
    points: s.points,
  };
}

function mapSkater(s: NhlBoxscoreSkater): BoxscoreSkater {
  return {
    playerId: s.playerId,
    name: s.name.default,
    sweaterNumber: s.sweaterNumber,
    position: s.position,
    goals: s.goals,
    assists: s.assists,
    points: s.points,
    plusMinus: s.plusMinus,
    sog: s.sog,
    hits: s.hits,
    blockedShots: s.blockedShots,
    toi: s.toi,
    faceoffWinPct: s.faceoffWinningPctg,
    pim: s.pim,
    shifts: s.shifts,
    giveaways: s.giveaways,
    takeaways: s.takeaways,
    powerPlayGoals: s.powerPlayGoals,
  };
}

function parseSplitStat(s: string): { saves: number; shotsAgainst: number } {
  const parts = s.split("/");
  const saves = Number(parts[0]) || 0;
  const sa = Number(parts[1]) || 0;
  return { saves, shotsAgainst: sa };
}

function mapGoalie(g: NhlBoxscoreGoalie): BoxscoreGoalie {
  const sa = g.shotsAgainst || 0;
  const sv = g.saves || 0;
  return {
    playerId: g.playerId,
    name: g.name.default,
    sweaterNumber: g.sweaterNumber,
    starter: g.starter,
    saves: sv,
    shotsAgainst: sa,
    goalsAgainst: g.goalsAgainst,
    savePct: sa > 0 ? sv / sa : 0,
    toi: g.toi,
    evenStrength: parseSplitStat(g.evenStrengthShotsAgainst),
    powerPlay: parseSplitStat(g.powerPlayShotsAgainst),
    shortHanded: parseSplitStat(g.shorthandedShotsAgainst),
  };
}

function aggregateTeamStats(players: NhlBoxscoreTeamPlayers, goals: ScoringGoal[], penalties: PenaltyEvent[], teamAbbrev: string): TeamStatLine {
  const all: NhlBoxscoreSkater[] = [...players.forwards, ...players.defense];
  let hits = 0, blocks = 0, pim = 0, giveaways = 0, takeaways = 0;
  let foWins = 0, foTotal = 0;
  for (const s of all) {
    hits += s.hits;
    blocks += s.blockedShots;
    pim += s.pim;
    giveaways += s.giveaways;
    takeaways += s.takeaways;
    if (s.faceoffWinningPctg > 0) {
      const rounds = Math.round(s.sog > 0 ? s.shifts : s.shifts);
      foWins += s.faceoffWinningPctg;
      foTotal += 1;
    }
  }
  for (const g of players.goalies) pim += g.pim;

  const ppGoals = goals.filter((g) => g.strength === "pp" && g.teamAbbrev === teamAbbrev).length;
  const ppOpportunities = penalties.filter((p) => p.teamAbbrev !== teamAbbrev && p.duration >= 2).length;

  const sog = all.reduce((sum, s) => sum + s.sog, 0);
  const totalFoWins = all.reduce((sum, s) => sum + s.faceoffWinningPctg * (s.faceoffWinningPctg > 0 ? 1 : 0), 0);
  const foPlayers = all.filter((s) => s.faceoffWinningPctg > 0).length;

  return {
    sog,
    hits,
    blocks,
    pim,
    faceoffPct: foPlayers > 0 ? totalFoWins / foPlayers : 0,
    giveaways,
    takeaways,
    powerPlay: `${ppGoals}/${ppOpportunities}`,
  };
}

export function mapGameSummary(
  landing: NhlGameLandingResponse,
  boxscore: NhlGameBoxscoreResponse,
): GameSummary {
  const scoringByPeriod = landing.summary.scoring.map(mapScoringPeriod);
  const penaltiesByPeriod = landing.summary.penalties.map(mapPenaltyPeriod);
  const allGoals = scoringByPeriod.flatMap((p) => p.goals);
  const allPenalties = penaltiesByPeriod.flatMap((p) => p.penalties);

  const homeStats = aggregateTeamStats(boxscore.playerByGameStats.homeTeam, allGoals, allPenalties, boxscore.homeTeam.abbrev);
  const awayStats = aggregateTeamStats(boxscore.playerByGameStats.awayTeam, allGoals, allPenalties, boxscore.awayTeam.abbrev);
  homeStats.sog = landing.homeTeam.sog;
  awayStats.sog = landing.awayTeam.sog;

  const homePlayers = boxscore.playerByGameStats.homeTeam;
  const awayPlayers = boxscore.playerByGameStats.awayTeam;

  return {
    gameId: landing.id,
    gameDateLocal: landing.gameDate,
    startTimeUtc: landing.startTimeUTC,
    season: landing.season,
    gameType: landing.gameType,
    venue: landing.venue.default,
    venueLocation: landing.venueLocation.default,
    lastPeriodType: boxscore.gameOutcome?.lastPeriodType ?? "REG",
    homeTeam: mapTeam(landing.homeTeam),
    awayTeam: mapTeam(landing.awayTeam),
    threeStars: landing.summary.threeStars.map(mapStar),
    teamStats: { home: homeStats, away: awayStats },
    scoringByPeriod,
    penaltiesByPeriod,
    skaters: {
      home: [...homePlayers.forwards, ...homePlayers.defense].map(mapSkater),
      away: [...awayPlayers.forwards, ...awayPlayers.defense].map(mapSkater),
    },
    goalies: {
      home: homePlayers.goalies.map(mapGoalie),
      away: awayPlayers.goalies.map(mapGoalie),
    },
  };
}
