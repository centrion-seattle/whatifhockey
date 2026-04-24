import { notFound } from "next/navigation";

import { GameSummaryView } from "@/components/game-page/game-summary-view";
import fallbackSchedule from "@/lib/nhl/fallback-schedule.json";
import { getGameSummary } from "@/lib/nhl/fetch-game-summary";
import type { Game } from "@/lib/schedule/types";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { games } = fallbackSchedule as { games: Game[] };
  return games
    .filter((g) => g.status === "final" && g.gameType !== "preseason")
    .map((g) => ({ gameId: String(g.id) }));
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const result = await getGameSummary(gameId);

  if (!result.ok && !result.summary) notFound();

  const summary = result.ok ? result.summary : result.summary!;

  return (
    <GameSummaryView
      summary={summary}
      updatedAt={result.updatedAt}
      source={result.ok ? "live" : "fallback"}
      fetchError={result.ok ? undefined : result.error}
    />
  );
}
