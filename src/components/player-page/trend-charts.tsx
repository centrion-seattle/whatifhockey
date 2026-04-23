"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { cumulative, rollingAverage } from "@/lib/player/derive";

type Mode = "cumulative" | "rolling" | "perGame";

export function TrendCharts({
  perGame,
  label = "Points",
}: {
  perGame: number[];
  label?: string;
}) {
  const [mode, setMode] = useState<Mode>("cumulative");

  const series = useMemo(() => {
    if (mode === "cumulative") return cumulative(perGame);
    if (mode === "rolling")
      return rollingAverage(perGame, 10).map((v) => (v == null ? null : v));
    return perGame;
  }, [perGame, mode]);

  if (perGame.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
          {label} trend
        </h3>
        <div className="flex items-center gap-1">
          <ModeButton active={mode === "cumulative"} onClick={() => setMode("cumulative")}>
            Cumulative
          </ModeButton>
          <ModeButton active={mode === "rolling"} onClick={() => setMode("rolling")}>
            10-gm avg
          </ModeButton>
          <ModeButton active={mode === "perGame"} onClick={() => setMode("perGame")}>
            Per game
          </ModeButton>
        </div>
      </div>
      {mode === "perGame" ? (
        <BarChart values={perGame as number[]} />
      ) : (
        <LineChart values={series as Array<number | null>} />
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-2 py-0.5 text-xs transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const WIDTH = 600;
const HEIGHT = 120;
const PAD = 6;

function LineChart({ values }: { values: Array<number | null> }) {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return <EmptyChart />;
  const max = Math.max(...nums, 0.0001);
  const min = Math.min(...nums, 0);
  const range = max - min || 1;
  const stepX = (WIDTH - PAD * 2) / Math.max(1, values.length - 1);

  const points = values
    .map((v, i) => {
      if (v == null) return null;
      const x = PAD + i * stepX;
      const y =
        HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter((p): p is string => p !== null)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-28 w-full text-primary"
      preserveAspectRatio="none"
      role="img"
      aria-label="Line chart"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function BarChart({ values }: { values: number[] }) {
  if (values.length === 0) return <EmptyChart />;
  const max = Math.max(...values, 1);
  const stepX = (WIDTH - PAD * 2) / values.length;
  const barW = Math.max(1, stepX * 0.7);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-28 w-full text-primary"
      preserveAspectRatio="none"
      role="img"
      aria-label="Bar chart"
    >
      {values.map((v, i) => {
        const x = PAD + i * stepX + (stepX - barW) / 2;
        const h = (v / max) * (HEIGHT - PAD * 2);
        const y = HEIGHT - PAD - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={Math.max(0, h)}
            fill="currentColor"
            opacity={v === 0 ? 0.2 : 0.8}
          >
            <title>
              Game {i + 1}: {v}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
      No data yet
    </div>
  );
}
