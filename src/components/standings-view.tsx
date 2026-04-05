"use client";

import { useMemo, useState } from "react";

import {
  StandingsDesktopTable,
  StandingsMobileCards,
} from "@/components/standings-table-parts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIVISION_ORDER_EAST,
  DIVISION_ORDER_WEST,
  assignPlayoffSpots,
  getPlayoffConferenceLayout,
} from "@/lib/standings/playoffs";
import { rankTeams, rankTeamsInConference } from "@/lib/standings/rank";
import {
  RANKING_STRATEGIES,
  type RankingStrategy,
  type RankingStrategyId,
} from "@/lib/standings/strategies";
import type { PlayoffSpot, TeamStanding } from "@/lib/standings/types";

function formatUtc(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export type StandingsViewMode = "league" | "conference" | "playoffs";

const VIEW_OPTIONS: { id: StandingsViewMode; label: string }[] = [
  { id: "league", label: "Full league (1–32)" },
  { id: "conference", label: "By conference (1–16)" },
  { id: "playoffs", label: "Playoff picture" },
];

export function StandingsView(props: {
  teams: TeamStanding[];
  updatedAt: string;
  source: "live" | "fallback";
  fetchError?: string;
}) {
  const { teams, updatedAt, source, fetchError } = props;
  const [strategyId, setStrategyId] = useState<RankingStrategyId>("api");
  const [viewMode, setViewMode] = useState<StandingsViewMode>("league");

  const strategy = useMemo(
    () => RANKING_STRATEGIES.find((s) => s.id === strategyId)!,
    [strategyId],
  );

  const rankedLeague = useMemo(
    () => rankTeams(teams, strategyId),
    [teams, strategyId],
  );

  const rankedEast = useMemo(
    () => rankTeamsInConference(teams, strategyId, "E"),
    [teams, strategyId],
  );

  const rankedWest = useMemo(
    () => rankTeamsInConference(teams, strategyId, "W"),
    [teams, strategyId],
  );

  const spotsEast = useMemo(
    () => assignPlayoffSpots(rankedEast),
    [rankedEast],
  );
  const spotsWest = useMemo(
    () => assignPlayoffSpots(rankedWest),
    [rankedWest],
  );

  const layoutEast = useMemo(
    () => getPlayoffConferenceLayout(rankedEast, spotsEast, DIVISION_ORDER_EAST),
    [rankedEast, spotsEast],
  );
  const layoutWest = useMemo(
    () => getPlayoffConferenceLayout(rankedWest, spotsWest, DIVISION_ORDER_WEST),
    [rankedWest, spotsWest],
  );

  const showDelta = strategyId !== "api" && viewMode !== "playoffs";
  const leagueDeltaHeader = "Δ vs NHL";
  const confDeltaHeader = "Δ vs conf.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            NHL standings
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Explore unofficial &quot;what if&quot; ranking methods. Official order uses
            the league&apos;s published sequence from the NHL stats API.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex w-full flex-col gap-2">
            <label htmlFor="standings-view" className="text-sm font-medium">
              View
            </label>
            <Select
              value={viewMode}
              onValueChange={(v) => setViewMode(v as StandingsViewMode)}
            >
              <SelectTrigger id="standings-view" aria-label="Standings view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIEW_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {viewMode === "playoffs" && (
              <p className="text-xs text-muted-foreground">
                Playoff groups use the NHL rule of three division qualifiers plus two
                wild cards per conference, applied to the selected ranking (unofficial).
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-2">
            <label htmlFor="ranking-method" className="text-sm font-medium">
              Ranking method
            </label>
            <Select
              value={strategyId}
              onValueChange={(v) => setStrategyId(v as RankingStrategyId)}
            >
              <SelectTrigger id="ranking-method" aria-label="Ranking method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANKING_STRATEGIES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">{strategy.label}</CardTitle>
            {source === "fallback" && (
              <Badge variant="warning">Sample data</Badge>
            )}
            {fetchError && source === "fallback" && (
              <Badge variant="destructive">Live fetch failed</Badge>
            )}
          </div>
          <CardDescription>{strategy.description}</CardDescription>
          <p className="text-xs text-muted-foreground">
            Updated {formatUtc(updatedAt)}
            {source === "live" ? " (from NHL API)" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {fetchError && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Could not reach the NHL API ({fetchError}). Showing cached sample
              teams so the UI still works offline.
            </p>
          )}

          {viewMode === "league" && (
            <>
              <div className="hidden md:block">
                <StandingsDesktopTable
                  rows={rankedLeague}
                  showDelta={showDelta}
                  deltaHeader={leagueDeltaHeader}
                  strategyId={strategyId}
                  strategy={strategy}
                />
              </div>
              <div className="md:hidden">
                <StandingsMobileCards
                  rows={rankedLeague}
                  showDelta={showDelta}
                  deltaHeader={leagueDeltaHeader}
                  strategyId={strategyId}
                  strategy={strategy}
                />
              </div>
            </>
          )}

          {viewMode === "conference" && (
            <div className="space-y-8">
              <section aria-labelledby="conf-east-heading">
                <h2 id="conf-east-heading" className="mb-3 text-base font-semibold">
                  Eastern Conference
                </h2>
                <div className="hidden md:block">
                  <StandingsDesktopTable
                    rows={rankedEast}
                    showDelta={showDelta}
                    deltaHeader={confDeltaHeader}
                    strategyId={strategyId}
                    strategy={strategy}
                  />
                </div>
                <div className="md:hidden">
                  <StandingsMobileCards
                    rows={rankedEast}
                    showDelta={showDelta}
                    deltaHeader={confDeltaHeader}
                    strategyId={strategyId}
                    strategy={strategy}
                  />
                </div>
              </section>
              <section aria-labelledby="conf-west-heading">
                <h2 id="conf-west-heading" className="mb-3 text-base font-semibold">
                  Western Conference
                </h2>
                <div className="hidden md:block">
                  <StandingsDesktopTable
                    rows={rankedWest}
                    showDelta={showDelta}
                    deltaHeader={confDeltaHeader}
                    strategyId={strategyId}
                    strategy={strategy}
                  />
                </div>
                <div className="md:hidden">
                  <StandingsMobileCards
                    rows={rankedWest}
                    showDelta={showDelta}
                    deltaHeader={confDeltaHeader}
                    strategyId={strategyId}
                    strategy={strategy}
                  />
                </div>
              </section>
            </div>
          )}

          {viewMode === "playoffs" && (
            <div className="space-y-10">
              <PlayoffConferenceBlock
                title="Eastern Conference"
                layout={layoutEast}
                spots={spotsEast}
                strategyId={strategyId}
                strategy={strategy}
              />
              <PlayoffConferenceBlock
                title="Western Conference"
                layout={layoutWest}
                spots={spotsWest}
                strategyId={strategyId}
                strategy={strategy}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          Not affiliated with the NHL. Team names and marks are property of the
          NHL and its teams. Data from the public NHL web API for personal,
          non-commercial use.
        </p>
      </footer>
    </div>
  );
}

function PlayoffConferenceBlock({
  title,
  layout,
  spots,
  strategyId,
  strategy,
}: {
  title: string;
  layout: ReturnType<typeof getPlayoffConferenceLayout>;
  spots: Map<string, PlayoffSpot>;
  strategyId: RankingStrategyId;
  strategy: RankingStrategy;
}) {
  const divisionsWithTeams = layout.divisions.filter((d) => d.teams.length > 0);

  return (
    <section className="space-y-6" aria-label={title}>
      <h2 className="text-lg font-semibold">{title}</h2>

      {divisionsWithTeams.map((div) => (
        <div key={div.abbrev} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {div.name}
          </h3>
          <div className="hidden md:block">
            <StandingsDesktopTable
              rows={div.teams}
              showDelta={false}
              deltaHeader=""
              strategyId={strategyId}
              strategy={strategy}
              playoffSpots={spots}
            />
          </div>
          <div className="md:hidden">
            <StandingsMobileCards
              rows={div.teams}
              showDelta={false}
              deltaHeader=""
              strategyId={strategyId}
              strategy={strategy}
              playoffSpots={spots}
            />
          </div>
        </div>
      ))}

      {layout.wildcards.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Wild card</h3>
          <div className="hidden md:block">
            <StandingsDesktopTable
              rows={layout.wildcards}
              showDelta={false}
              deltaHeader=""
              strategyId={strategyId}
              strategy={strategy}
              playoffSpots={spots}
            />
          </div>
          <div className="md:hidden">
            <StandingsMobileCards
              rows={layout.wildcards}
              showDelta={false}
              deltaHeader=""
              strategyId={strategyId}
              strategy={strategy}
              playoffSpots={spots}
            />
          </div>
        </div>
      )}

      {layout.out.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Outside playoffs
          </h3>
          <div className="hidden md:block">
            <StandingsDesktopTable
              rows={layout.out}
              showDelta={false}
              deltaHeader=""
              strategyId={strategyId}
              strategy={strategy}
              playoffSpots={spots}
            />
          </div>
          <div className="md:hidden">
            <StandingsMobileCards
              rows={layout.out}
              showDelta={false}
              deltaHeader=""
              strategyId={strategyId}
              strategy={strategy}
              playoffSpots={spots}
            />
          </div>
        </div>
      )}
    </section>
  );
}
