"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Import,
  Package,
  ListChecks,
  Radar,
  Star,
  BarChart3,
  Settings,
  Crosshair,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/research", label: "Product Finder", icon: Search },
  { href: "/products/import", label: "Import Product", icon: Import },
  { href: "/products", label: "My Products", icon: Package },
  { href: "/listings", label: "Listings", icon: ListChecks },
  { href: "/research#radar", label: "Product Radar", icon: Radar },
  { href: "/research#winners", label: "Saved Winners", icon: Star },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/40 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Crosshair className="h-4 w-4" />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">Drop Hunter AI</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("#")[0]) && item.href.split("#")[0] !== "/research");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  active && "bg-primary/15 text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Demo Mode</span> is active. Product data and AI text are
            sample/offline unless API keys are configured in Settings → API.
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 md:hidden">
          <span className="font-display text-[15px] font-semibold">Drop Hunter AI</span>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
