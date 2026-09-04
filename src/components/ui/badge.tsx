import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive" | "outline";

const variantClasses: Record<Variant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  destructive: "bg-destructive/15 text-destructive border border-destructive/30",
  outline: "border border-border text-foreground",
};

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", variantClasses[variant], className)}
      {...props}
    />
  );
}
