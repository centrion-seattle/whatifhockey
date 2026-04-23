"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TeammateOption = {
  playerId: number;
  name: string;
  position: string;
};

export function TeammateSwitch({
  currentId,
  teammates,
}: {
  currentId: number;
  teammates: TeammateOption[];
}) {
  const router = useRouter();
  if (teammates.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Jump to teammate</span>
      <Select
        value={String(currentId)}
        onValueChange={(v) => router.push(`/player/${v}`)}
      >
        <SelectTrigger className="h-8 w-[220px]" aria-label="Teammate">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {teammates.map((t) => (
            <SelectItem key={t.playerId} value={String(t.playerId)}>
              {t.name} · {t.position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
