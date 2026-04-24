import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/format";
import type { GameSummary } from "@/lib/game-summary/types";

function resultTag(lpt: string): string | null {
  if (lpt === "OT") return "OT";
  if (lpt === "SO") return "SO";
  return null;
}

export function ScoreHeader({ game }: { game: GameSummary }) {
  const tag = resultTag(game.lastPeriodType);
  const winner =
    game.homeTeam.score > game.awayTeam.score
      ? game.homeTeam.abbrev
      : game.awayTeam.abbrev;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-muted-foreground">
        {formatDateShort(game.startTimeUtc)} · {game.venue},{" "}
        {game.venueLocation}
      </div>
      <div className="flex items-center gap-6 sm:gap-10">
        <TeamSide team={game.awayTeam} isWinner={winner === game.awayTeam.abbrev} />
        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="text-4xl font-bold">{game.awayTeam.score}</span>
          <span className="text-xl text-muted-foreground">–</span>
          <span className="text-4xl font-bold">{game.homeTeam.score}</span>
          {tag && (
            <Badge variant="outline" className="ml-1 text-xs">
              {tag}
            </Badge>
          )}
        </div>
        <TeamSide team={game.homeTeam} isWinner={winner === game.homeTeam.abbrev} />
      </div>
      <div className="flex gap-6 text-xs text-muted-foreground tabular-nums">
        <span>{game.awayTeam.abbrev} {game.awayTeam.sog} SOG</span>
        <span>{game.homeTeam.abbrev} {game.homeTeam.sog} SOG</span>
      </div>
    </div>
  );
}

function TeamSide({
  team,
  isWinner,
}: {
  team: { abbrev: string; name: string; logoUrl: string };
  isWinner: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Image
        src={team.logoUrl}
        alt={team.abbrev}
        width={64}
        height={64}
        unoptimized
      />
      <span className={`text-sm font-medium ${isWinner ? "text-foreground" : "text-muted-foreground"}`}>
        {team.abbrev}
      </span>
    </div>
  );
}
