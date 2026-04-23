import { Badge } from "@/components/ui/badge";
import fallbackClubStats from "@/lib/nhl/fallback-club-stats.json";
import { formatUtc } from "@/lib/format";
import type { PlayerLanding, SkaterSplits } from "@/lib/player/types";

import { AwardsCard } from "./awards-card";
import { CareerHistoryTable } from "./career-history-table";
import { CurrentSeasonStrip } from "./current-season-strip";
import { FaceoffCard } from "./faceoff-card";
import { GameLogSection } from "./game-log-table";
import { GoalieTrack } from "./goalie-track";
import { IdentityHeader } from "./identity-header";
import { LastFiveCard } from "./last-five-card";
import { PlayerNavBar } from "./nav-bar";
import { Per60Card } from "./per60-card";
import { ShootoutCard } from "./shootout-card";
import { SplitsCard } from "./splits-card";
import { TeammateSwitch, type TeammateOption } from "./teammate-switch";

type ClubFallback = {
  byAbbrev: Record<
    string,
    {
      skaters: Array<{ playerId: number; firstName: string; lastName: string; position: string }>;
      goalies: Array<{ playerId: number; firstName: string; lastName: string }>;
    }
  >;
};

function teammatesFor(abbrev: string | undefined): TeammateOption[] {
  if (!abbrev) return [];
  const club = fallbackClubStats as unknown as ClubFallback;
  const team = club.byAbbrev[abbrev];
  if (!team) return [];
  const out: TeammateOption[] = [];
  for (const s of team.skaters) {
    out.push({
      playerId: s.playerId,
      name: `${s.firstName} ${s.lastName}`,
      position: s.position,
    });
  }
  for (const g of team.goalies) {
    out.push({
      playerId: g.playerId,
      name: `${g.firstName} ${g.lastName}`,
      position: "G",
    });
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

export function PlayerPageView({
  landing,
  seasonId,
  splits,
  leagueSplits,
  updatedAt,
  source,
  fetchError,
}: {
  landing: PlayerLanding;
  seasonId: number;
  splits: SkaterSplits | undefined;
  leagueSplits: Record<string, SkaterSplits>;
  updatedAt: string;
  source: "live" | "fallback";
  fetchError?: string;
}) {
  const { bio } = landing;
  const isGoalie = bio.position === "G";
  const teammates = teammatesFor(bio.currentTeamAbbrev);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PlayerNavBar
          teamAbbrev={bio.currentTeamAbbrev}
          teamName={bio.currentTeamName}
        />
        <div className="flex flex-wrap items-center gap-2">
          {source === "fallback" && <Badge variant="warning">Sample data</Badge>}
          {fetchError && source === "fallback" && (
            <Badge variant="destructive">Live fetch failed</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Updated {formatUtc(updatedAt)}
            {source === "live" ? " (from NHL API)" : ""}
          </span>
          <TeammateSwitch currentId={bio.playerId} teammates={teammates} />
        </div>
      </div>

      <IdentityHeader bio={bio} />

      <CurrentSeasonStrip
        season={landing.featuredSeason}
        subSeason={landing.featuredRegular}
        career={landing.featuredCareer}
        isGoalie={isGoalie}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AwardsCard awards={landing.awards} badges={landing.badges} />
        <LastFiveCard games={landing.last5Games} />
      </div>

      <CareerHistoryTable
        seasonTotals={landing.seasonTotals}
        isGoalie={isGoalie}
      />

      {isGoalie ? (
        <GoalieTrack
          playerId={bio.playerId}
          initialSeasonId={seasonId}
          playerStatsSeasons={[]}
        />
      ) : (
        <>
          <SplitsCard splits={splits} />
          <Per60Card
            playerId={bio.playerId}
            splits={splits}
            leagueSplits={leagueSplits}
          />
          <FaceoffCard splits={splits} position={bio.position} />
          <ShootoutCard splits={splits} />
        </>
      )}

      <GameLogSection
        playerId={bio.playerId}
        isGoalie={isGoalie}
        initialSeasonId={seasonId}
        playerStatsSeasons={[]}
      />

      <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          Not affiliated with the NHL. Team names, marks, and headshots are
          property of the NHL and its teams. Data from the public NHL web API
          for personal, non-commercial use.
        </p>
      </footer>
    </div>
  );
}
