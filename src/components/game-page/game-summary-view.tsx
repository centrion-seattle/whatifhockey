"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatUtc } from "@/lib/format";
import type { GameSummary } from "@/lib/game-summary/types";

import { GoalieBoxscore } from "./goalie-boxscore";
import { PenaltySummary } from "./penalty-summary";
import { ScoreHeader } from "./score-header";
import { ScoringTimeline } from "./scoring-timeline";
import { SkaterBoxscore } from "./skater-boxscore";
import { TeamComparison } from "./team-comparison";
import { ThreeStarsCard } from "./three-stars";

export function GameSummaryView({
  summary,
  updatedAt,
  source,
  fetchError,
}: {
  summary: GameSummary;
  updatedAt: string;
  source: "live" | "fallback";
  fetchError?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {source === "fallback" && (
          <Badge variant="warning">Sample data</Badge>
        )}
        {fetchError && source === "fallback" && (
          <Badge variant="destructive">Live fetch failed</Badge>
        )}
        <span className="text-xs text-muted-foreground">
          Updated {formatUtc(updatedAt)}
        </span>
      </div>

      <ScoreHeader game={summary} />

      <Card>
        <CardContent className="pt-6 space-y-6">
          <ThreeStarsCard stars={summary.threeStars} />

          <TeamComparison
            away={summary.teamStats.away}
            home={summary.teamStats.home}
            awayAbbrev={summary.awayTeam.abbrev}
            homeAbbrev={summary.homeTeam.abbrev}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ScoringTimeline
            periods={summary.scoringByPeriod}
            homeAbbrev={summary.homeTeam.abbrev}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <PenaltySummary periods={summary.penaltiesByPeriod} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SkaterBoxscore
            home={summary.skaters.home}
            away={summary.skaters.away}
            homeAbbrev={summary.homeTeam.abbrev}
            awayAbbrev={summary.awayTeam.abbrev}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <GoalieBoxscore
            home={summary.goalies.home}
            away={summary.goalies.away}
            homeAbbrev={summary.homeTeam.abbrev}
            awayAbbrev={summary.awayTeam.abbrev}
          />
        </CardContent>
      </Card>

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          Not affiliated with the NHL. Data from the public NHL web API for
          personal, non-commercial use.
        </p>
      </footer>
    </div>
  );
}
