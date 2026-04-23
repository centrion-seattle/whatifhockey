"use client";

import Link from "next/link";

export function PlayerNavBar({
  teamAbbrev,
  teamName,
}: {
  teamAbbrev?: string;
  teamName?: string;
}) {
  return (
    <nav aria-label="Player sub-navigation" className="flex items-center gap-3">
      {teamAbbrev ? (
        <Link
          href={`/player-stats/${teamAbbrev}`}
          className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          ← {teamName ?? teamAbbrev} roster
        </Link>
      ) : (
        <Link
          href="/team-stats"
          className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          ← Teams
        </Link>
      )}
    </nav>
  );
}
