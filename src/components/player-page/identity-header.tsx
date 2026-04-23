import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatAge, formatHeight, formatWeight } from "@/lib/player/format";
import type { PlayerBio } from "@/lib/player/types";

export function IdentityHeader({ bio }: { bio: PlayerBio }) {
  const city = [bio.birthCity, bio.birthStateProvince, bio.birthCountry]
    .filter(Boolean)
    .join(", ");
  const draftLabel = bio.draft
    ? `${bio.draft.year} · Round ${bio.draft.round} · #${bio.draft.overallPick} overall · ${bio.draft.teamAbbrev}`
    : "Undrafted";

  return (
    <header
      className="relative overflow-hidden rounded-lg border border-border bg-card"
      aria-label={`Player header for ${bio.fullName}`}
    >
      {bio.heroImage && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bio.heroImage})` }}
        />
      )}
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-4">
          <Image
            src={bio.headshot}
            alt=""
            width={120}
            height={120}
            className="shrink-0 rounded-full border border-border bg-muted"
            unoptimized
          />
          {bio.currentTeamLogo && bio.currentTeamAbbrev && (
            <Link
              href={`/player-stats/${bio.currentTeamAbbrev}`}
              className="hidden shrink-0 sm:block"
              title={bio.currentTeamName ?? bio.currentTeamAbbrev}
            >
              <Image
                src={bio.currentTeamLogo}
                alt={bio.currentTeamName ?? bio.currentTeamAbbrev}
                width={72}
                height={72}
                unoptimized
              />
            </Link>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {typeof bio.sweaterNumber === "number" && (
              <span className="text-3xl font-black text-muted-foreground tabular-nums">
                #{bio.sweaterNumber}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {bio.fullName}
            </h1>
            <span className="text-sm font-medium text-muted-foreground">
              {bio.position}
            </span>
          </div>
          {bio.currentTeamAbbrev && bio.currentTeamName && (
            <Link
              href={`/player-stats/${bio.currentTeamAbbrev}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              {bio.currentTeamName}
            </Link>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-sm sm:grid-cols-4">
            <BioField label="Height" value={formatHeight(bio.heightInInches)} />
            <BioField label="Weight" value={formatWeight(bio.weightInPounds)} />
            <BioField label="Age" value={formatAge(bio.birthDate)} />
            <BioField
              label={bio.position === "G" ? "Catches" : "Shoots"}
              value={bio.shootsCatches || "—"}
            />
            <BioField label="Born" value={bio.birthDate} />
            <BioField
              label="Birthplace"
              value={city || "—"}
              className="col-span-2 sm:col-span-3"
            />
            <BioField label="Draft" value={draftLabel} className="col-span-2 sm:col-span-4" />
          </dl>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {bio.inHHOF && <Badge variant="success">Hall of Fame</Badge>}
            {bio.inTop100AllTime && (
              <Badge variant="default">NHL Top 100 All-Time</Badge>
            )}
            {bio.isActive ? (
              <Badge variant="secondary">Active</Badge>
            ) : (
              <Badge variant="secondary">Retired</Badge>
            )}
            {bio.twitterLink && (
              <a
                href={bio.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Twitter ↗
              </a>
            )}
            {bio.watchLink && (
              <a
                href={bio.watchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Watch ↗
              </a>
            )}
            {bio.shopLink && (
              <a
                href={bio.shopLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                Shop ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function BioField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
