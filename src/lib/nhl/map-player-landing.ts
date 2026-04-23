import type {
  NhlCareerTotalsGoalie,
  NhlCareerTotalsSkater,
  NhlFeaturedStatsGoalie,
  NhlFeaturedStatsSkater,
  NhlPlayerAward,
  NhlPlayerGameLogGoalieRow,
  NhlPlayerGameLogResponse,
  NhlPlayerGameLogSkaterRow,
  NhlPlayerLandingResponse,
  NhlPlayerLast5Goalie,
  NhlPlayerLast5Skater,
  NhlPlayerSeasonTotalGoalie,
  NhlPlayerSeasonTotalSkater,
} from "./player-landing-api-types";
import type {
  GoalieFeatured,
  GoalieGameLogRow,
  GoalieLast5,
  GoalieSeasonTotal,
  PlayerAward,
  PlayerGameLog,
  PlayerLanding,
  SkaterFeatured,
  SkaterGameLogRow,
  SkaterLast5,
  SkaterSeasonTotal,
} from "@/lib/player/types";

export function toiToSeconds(toi: string | undefined): number {
  if (!toi) return 0;
  const parts = toi.split(":");
  if (parts.length !== 2) return 0;
  const m = Number(parts[0]);
  const s = Number(parts[1]);
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 0;
  return m * 60 + s;
}

function isGoalieSeason(
  row: NhlPlayerSeasonTotalSkater | NhlPlayerSeasonTotalGoalie,
): row is NhlPlayerSeasonTotalGoalie {
  return (
    "wins" in row ||
    "savePctg" in row ||
    "goalsAgainstAvg" in row
  );
}

export function mapSkaterSeasonTotal(
  row: NhlPlayerSeasonTotalSkater,
): SkaterSeasonTotal {
  return {
    kind: "skater",
    season: row.season,
    sequence: row.sequence,
    gameTypeId: row.gameTypeId,
    leagueAbbrev: row.leagueAbbrev,
    teamName: row.teamName?.default ?? "",
    gamesPlayed: row.gamesPlayed,
    goals: row.goals,
    assists: row.assists,
    points: row.points,
    plusMinus: row.plusMinus ?? 0,
    pim: row.pim ?? 0,
    powerPlayGoals: row.powerPlayGoals ?? 0,
    powerPlayPoints: row.powerPlayPoints ?? 0,
    shorthandedGoals: row.shorthandedGoals ?? 0,
    shorthandedPoints: row.shorthandedPoints ?? 0,
    gameWinningGoals: row.gameWinningGoals ?? 0,
    otGoals: row.otGoals ?? 0,
    shots: row.shots ?? 0,
    shootingPct: row.shootingPctg ?? 0,
    avgToiSeconds: toiToSeconds(row.avgToi),
    faceoffWinPct: row.faceoffWinningPctg ?? 0,
  };
}

export function mapGoalieSeasonTotal(
  row: NhlPlayerSeasonTotalGoalie,
): GoalieSeasonTotal {
  return {
    kind: "goalie",
    season: row.season,
    sequence: row.sequence,
    gameTypeId: row.gameTypeId,
    leagueAbbrev: row.leagueAbbrev,
    teamName: row.teamName?.default ?? "",
    gamesPlayed: row.gamesPlayed,
    gamesStarted: row.gamesStarted ?? 0,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    otLosses: row.otLosses ?? 0,
    goalsAgainstAvg: row.goalsAgainstAvg ?? 0,
    savePct: row.savePctg ?? 0,
    shotsAgainst: row.shotsAgainst ?? 0,
    goalsAgainst: row.goalsAgainst ?? 0,
    shutouts: row.shutouts ?? 0,
    goals: row.goals ?? 0,
    assists: row.assists ?? 0,
    pim: row.pim ?? 0,
    timeOnIceSeconds: toiToSeconds(row.timeOnIce),
  };
}

function mapSkaterLast5(row: NhlPlayerLast5Skater): SkaterLast5 {
  return {
    kind: "skater",
    gameId: row.gameId,
    gameDate: row.gameDate,
    gameTypeId: row.gameTypeId,
    opponentAbbrev: row.opponentAbbrev,
    homeRoadFlag: row.homeRoadFlag,
    teamAbbrev: row.teamAbbrev,
    goals: row.goals,
    assists: row.assists,
    points: row.points,
    plusMinus: row.plusMinus,
    shots: row.shots,
    toi: row.toi,
    pim: row.pim,
  };
}

function mapGoalieLast5(row: NhlPlayerLast5Goalie): GoalieLast5 {
  return {
    kind: "goalie",
    gameId: row.gameId,
    gameDate: row.gameDate,
    gameTypeId: row.gameTypeId,
    opponentAbbrev: row.opponentAbbrev,
    homeRoadFlag: row.homeRoadFlag,
    teamAbbrev: row.teamAbbrev,
    gamesStarted: row.gamesStarted,
    decision: row.decision,
    shotsAgainst: row.shotsAgainst,
    goalsAgainst: row.goalsAgainst,
    savePct: row.savePctg,
    toi: row.toi,
  };
}

function mapSkaterFeatured(f: NhlFeaturedStatsSkater): SkaterFeatured {
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

function mapGoalieFeatured(f: NhlFeaturedStatsGoalie): GoalieFeatured {
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

function isGoalieFeaturedRaw(
  f: NhlFeaturedStatsSkater | NhlFeaturedStatsGoalie,
): f is NhlFeaturedStatsGoalie {
  return "wins" in f;
}

function mapSkaterCareerTotals(t: NhlCareerTotalsSkater): SkaterFeatured {
  return {
    ...mapSkaterFeatured(t),
    avgToiSeconds: toiToSeconds(t.avgToi),
  };
}

function mapGoalieCareerTotals(t: NhlCareerTotalsGoalie): GoalieFeatured {
  return {
    ...mapGoalieFeatured(t),
    gamesStarted: t.gamesStarted,
    shotsAgainst: t.shotsAgainst,
    goalsAgainst: t.goalsAgainst,
    timeOnIceSeconds: toiToSeconds(t.timeOnIce),
  };
}

function mapAward(a: NhlPlayerAward): PlayerAward {
  return {
    trophy: a.trophy.default,
    seasons: a.seasons.map((s) => ({
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

export function mapLandingResponse(
  raw: NhlPlayerLandingResponse,
): PlayerLanding {
  const seasonTotals =
    raw.seasonTotals?.map((row) =>
      isGoalieSeason(row)
        ? mapGoalieSeasonTotal(row)
        : mapSkaterSeasonTotal(row as NhlPlayerSeasonTotalSkater),
    ) ?? [];

  const last5Games =
    raw.last5Games?.map((row) =>
      "decision" in row || "savePctg" in row
        ? mapGoalieLast5(row as NhlPlayerLast5Goalie)
        : mapSkaterLast5(row as NhlPlayerLast5Skater),
    ) ?? [];

  const featuredSub = raw.featuredStats?.regularSeason?.subSeason;
  const featuredCareerRaw = raw.featuredStats?.regularSeason?.career;
  const featuredPlayoffsSub = raw.featuredStats?.playoffs?.subSeason;

  const featuredRegular = featuredSub
    ? isGoalieFeaturedRaw(featuredSub)
      ? mapGoalieFeatured(featuredSub)
      : mapSkaterFeatured(featuredSub)
    : undefined;
  const featuredCareer = featuredCareerRaw
    ? isGoalieFeaturedRaw(featuredCareerRaw)
      ? mapGoalieFeatured(featuredCareerRaw)
      : mapSkaterFeatured(featuredCareerRaw)
    : undefined;
  const featuredPlayoffs = featuredPlayoffsSub
    ? isGoalieFeaturedRaw(featuredPlayoffsSub)
      ? mapGoalieFeatured(featuredPlayoffsSub)
      : mapSkaterFeatured(featuredPlayoffsSub)
    : undefined;

  const careerRegRaw = raw.careerTotals?.regularSeason;
  const careerReg = careerRegRaw
    ? isGoalieFeaturedRaw(careerRegRaw)
      ? mapGoalieCareerTotals(careerRegRaw as NhlCareerTotalsGoalie)
      : mapSkaterCareerTotals(careerRegRaw as NhlCareerTotalsSkater)
    : undefined;

  const fullName = `${raw.firstName.default} ${raw.lastName.default}`;

  return {
    bio: {
      playerId: raw.playerId,
      firstName: raw.firstName.default,
      lastName: raw.lastName.default,
      fullName,
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
    featuredCareer: careerReg ?? featuredCareer,
    featuredPlayoffs,
    awards: raw.awards?.map(mapAward) ?? [],
    badges:
      raw.badges
        ?.map((b) => b.title?.default)
        .filter((v): v is string => Boolean(v)) ?? [],
  };
}

function mapSkaterGameLogRow(
  row: NhlPlayerGameLogSkaterRow,
): SkaterGameLogRow {
  return {
    kind: "skater",
    gameId: row.gameId,
    gameDate: row.gameDate,
    teamAbbrev: row.teamAbbrev,
    homeRoadFlag: row.homeRoadFlag,
    opponentAbbrev: row.opponentAbbrev,
    goals: row.goals,
    assists: row.assists,
    points: row.points,
    plusMinus: row.plusMinus,
    shots: row.shots,
    shifts: row.shifts,
    powerPlayGoals: row.powerPlayGoals,
    powerPlayPoints: row.powerPlayPoints,
    shorthandedGoals: row.shorthandedGoals,
    shorthandedPoints: row.shorthandedPoints,
    gameWinningGoals: row.gameWinningGoals,
    otGoals: row.otGoals,
    pim: row.pim,
    toi: row.toi,
  };
}

function mapGoalieGameLogRow(
  row: NhlPlayerGameLogGoalieRow,
): GoalieGameLogRow {
  return {
    kind: "goalie",
    gameId: row.gameId,
    gameDate: row.gameDate,
    teamAbbrev: row.teamAbbrev,
    homeRoadFlag: row.homeRoadFlag,
    opponentAbbrev: row.opponentAbbrev,
    gamesStarted: row.gamesStarted,
    decision: row.decision,
    shotsAgainst: row.shotsAgainst,
    goalsAgainst: row.goalsAgainst,
    savePct: row.savePctg,
    shutouts: row.shutouts,
    pim: row.pim,
    toi: row.toi,
  };
}

export function mapGameLogResponse(
  raw: NhlPlayerGameLogResponse,
  isGoalie: boolean,
): PlayerGameLog {
  return {
    seasonId: raw.seasonId,
    gameTypeId: raw.gameTypeId,
    seasonsAvailable: raw.playerStatsSeasons ?? [],
    rows: (raw.gameLog ?? []).map((r) =>
      isGoalie
        ? mapGoalieGameLogRow(r as NhlPlayerGameLogGoalieRow)
        : mapSkaterGameLogRow(r as NhlPlayerGameLogSkaterRow),
    ),
  };
}
