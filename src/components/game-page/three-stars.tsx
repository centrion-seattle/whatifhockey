import Image from "next/image";
import Link from "next/link";

import type { ThreeStar } from "@/lib/game-summary/types";

const STAR_LABELS = ["", "1st", "2nd", "3rd"] as const;

export function ThreeStarsCard({ stars }: { stars: ThreeStar[] }) {
  if (stars.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Three Stars
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {stars.map((s) => (
          <Link
            key={s.playerId}
            href={`/player/${s.playerId}`}
            className="flex flex-col items-center gap-1 rounded-md border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {STAR_LABELS[s.star] ?? `${s.star}`} Star
            </span>
            <Image
              src={s.headshot}
              alt={s.name}
              width={56}
              height={56}
              unoptimized
              className="rounded-full"
            />
            <span className="text-sm font-semibold">{s.name}</span>
            <span className="text-xs text-muted-foreground">
              {s.position} · #{s.sweaterNo} · {s.teamAbbrev}
            </span>
            <span className="tabular-nums text-sm">
              {s.goals}G {s.assists}A {s.points}P
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
