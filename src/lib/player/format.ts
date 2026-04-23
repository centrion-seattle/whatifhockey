export function formatSeason(season: number | undefined): string {
  if (!season) return "";
  const s = String(season);
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}–${s.slice(6, 8)}`;
}

export function formatHeight(inches: number): string {
  if (!Number.isFinite(inches) || inches <= 0) return "—";
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}

export function formatWeight(lb: number): string {
  if (!Number.isFinite(lb) || lb <= 0) return "—";
  return `${lb} lb`;
}

export function formatMmSs(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatAge(birthDate: string, today = new Date()): string {
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return "—";
  let years = today.getUTCFullYear() - b.getUTCFullYear();
  const m = today.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < b.getUTCDate())) years -= 1;
  return `${years}`;
}

export function formatSavePct(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return n.toFixed(3).replace(/^0/, "");
}
