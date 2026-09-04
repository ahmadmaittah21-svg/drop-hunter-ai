import { cn } from "@/lib/utils";

export function ScorePill({ score, size = "md" }: { score: number | null | undefined; size?: "sm" | "md" | "lg" }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-muted-foreground">Not scored</span>;
  }
  const color = score >= 80 ? "text-success border-success/30 bg-success/10" : score >= 60 ? "text-warning border-warning/30 bg-warning/10" : "text-destructive border-destructive/30 bg-destructive/10";
  const sizeClass = size === "lg" ? "text-2xl px-4 py-2" : size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border font-mono font-semibold", color, sizeClass)}>
      {score}<span className="opacity-60 text-[0.7em]">/100</span>
    </span>
  );
}
