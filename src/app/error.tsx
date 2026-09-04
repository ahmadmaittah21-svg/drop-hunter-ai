"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center px-6">
      <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{error.message || "An unexpected error occurred. Your data has not been lost."}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
