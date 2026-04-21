import type { Game } from "@/lib/schedule/types";
import { formatResult } from "@/lib/schedule/helpers";

export function formatUtc(iso: string): string {
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

export function formatTimeShort(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

/** "Sat, Oct 11" — viewer-local, suitable for calendar day headers. */
export function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

/** "YYYY-MM" → "Oct 2025" header label. */
export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/**
 * "MTL 3 – 2 TOR" (with "(OT)"/"(SO)" suffix when applicable).
 * Null if the game isn't final yet.
 */
export function formatResultLine(game: Game): string | null {
  const r = formatResult(game);
  if (!r) return null;
  const tag = r.tag ? ` (${r.tag})` : "";
  return `${r.winnerAbbrev} ${r.winnerScore} – ${r.loserScore} ${r.loserAbbrev}${tag}`;
}
