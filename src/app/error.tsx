"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg border-destructive/40">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          The standings page hit an unexpected error. You can try again.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {error.message || "Unknown error"}
        </p>
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
