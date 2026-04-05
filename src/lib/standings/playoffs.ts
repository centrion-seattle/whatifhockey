import type { PlayoffSpot, RankedTeam, TeamStanding } from "./types";

/** Default division tab order (matches NHL site). */
export const DIVISION_ORDER_EAST = ["A", "M"] as const;
export const DIVISION_ORDER_WEST = ["C", "P"] as const;

/**
 * NHL-style playoff qualification per conference: top 3 in each division,
 * then 2 wild cards among remaining teams. Input order must be the conference
 * standings order from the active ranking strategy (best first).
 */
export function assignPlayoffSpots(
  orderedConferenceTeams: TeamStanding[],
): Map<string, PlayoffSpot> {
  const result = new Map<string, PlayoffSpot>();
  const divisionQualifierIds = new Set<string>();

  const divisions = [
    ...new Set(orderedConferenceTeams.map((t) => t.division)),
  ];
  for (const div of divisions) {
    const inDivision = orderedConferenceTeams.filter(
      (t) => t.division === div,
    );
    const top = inDivision.slice(0, Math.min(3, inDivision.length));
    let seed = 1;
    for (const t of top) {
      divisionQualifierIds.add(t.teamId);
      result.set(t.teamId, {
        kind: "DIV",
        seed: seed as 1 | 2 | 3,
        divisionAbbrev: t.division,
        divisionName: t.divisionName,
      });
      seed++;
    }
  }

  const wildCardPool = orderedConferenceTeams.filter(
    (t) => !divisionQualifierIds.has(t.teamId),
  );
  if (wildCardPool[0]) {
    result.set(wildCardPool[0].teamId, { kind: "WC", seed: 1 });
  }
  if (wildCardPool[1]) {
    result.set(wildCardPool[1].teamId, { kind: "WC", seed: 2 });
  }

  for (const t of orderedConferenceTeams) {
    if (!result.has(t.teamId)) {
      result.set(t.teamId, { kind: "OUT" });
    }
  }

  return result;
}

export function getPlayoffConferenceLayout(
  rankedConference: RankedTeam[],
  spots: Map<string, PlayoffSpot>,
  divisionOrder: readonly string[],
): {
  divisions: { abbrev: string; name: string; teams: RankedTeam[] }[];
  wildcards: RankedTeam[];
  out: RankedTeam[];
} {
  const divisions = divisionOrder.map((abbr) => {
    const name =
      rankedConference.find((t) => t.division === abbr)?.divisionName ?? abbr;
    const teams = rankedConference
      .filter((t) => {
        const s = spots.get(t.teamId);
        return s?.kind === "DIV" && t.division === abbr;
      })
      .sort((a, b) => {
        const sa = spots.get(a.teamId);
        const sb = spots.get(b.teamId);
        const ra = sa?.kind === "DIV" ? sa.seed : 0;
        const rb = sb?.kind === "DIV" ? sb.seed : 0;
        return ra - rb;
      });
    return { abbrev: abbr, name, teams };
  });

  const wildcards = rankedConference.filter(
    (t) => spots.get(t.teamId)?.kind === "WC",
  );
  const out = rankedConference.filter(
    (t) => spots.get(t.teamId)?.kind === "OUT",
  );

  return { divisions, wildcards, out };
}
