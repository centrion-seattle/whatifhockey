import Link from "next/link";

import type { BoxscoreGoalie } from "@/lib/game-summary/types";

export function GoalieBoxscore({
  home,
  away,
  homeAbbrev,
  awayAbbrev,
}: {
  home: BoxscoreGoalie[];
  away: BoxscoreGoalie[];
  homeAbbrev: string;
  awayAbbrev: string;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Goalies
      </h2>
      <div className="space-y-3">
        {[
          { label: awayAbbrev, goalies: away },
          { label: homeAbbrev, goalies: home },
        ].map(({ label, goalies }) =>
          goalies
            .filter((g) => g.toi !== "00:00")
            .map((g) => (
              <div
                key={g.playerId}
                className="rounded-md border border-border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                  <Link
                    href={`/player/${g.playerId}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    #{g.sweaterNumber} {g.name}
                  </Link>
                  {g.starter && (
                    <span className="text-[10px] text-muted-foreground">
                      (starter)
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums">
                  <Stat label="SV%" value={g.savePct > 0 ? `.${Math.round(g.savePct * 1000)}` : "—"} />
                  <Stat label="Saves" value={`${g.saves}/${g.shotsAgainst}`} />
                  <Stat label="GA" value={String(g.goalsAgainst)} />
                  <Stat label="TOI" value={g.toi} />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs tabular-nums text-muted-foreground">
                  <Stat label="ES" value={`${g.evenStrength.saves}/${g.evenStrength.shotsAgainst}`} />
                  <Stat label="PP" value={`${g.powerPlay.saves}/${g.powerPlay.shotsAgainst}`} />
                  <Stat label="SH" value={`${g.shortHanded.saves}/${g.shortHanded.shotsAgainst}`} />
                </div>
              </div>
            )),
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="text-muted-foreground">{label}</span>{" "}
      <span className="font-medium">{value}</span>
    </span>
  );
}
