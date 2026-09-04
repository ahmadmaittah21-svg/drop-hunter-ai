"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScorePill } from "@/components/shared/score-pill";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Radar, ExternalLink } from "lucide-react";

export default function ResearchPage() {
  const [filters, setFilters] = useState({ maxCost: "", minProfit: "", minMargin: "" });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch() {
    setLoading(true);
    setSearched(true);
    const body = {
      maxCost: filters.maxCost ? Number(filters.maxCost) : undefined,
      minProfit: filters.minProfit ? Number(filters.minProfit) : undefined,
      minMargin: filters.minMargin ? Number(filters.minMargin) : undefined,
    };
    const res = await fetch("/api/research/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) setResults(json.results);
  }

  return (
    <div>
      <PageHeader
        title="Product Finder"
        description="Search for potentially profitable products. Filters and scoring are architected for a future automated Product Hunter engine — V1 runs on curated sample opportunities."
      />

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-4">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader><CardTitle className="flex items-center gap-2"><Radar className="h-4 w-4" /> Filters</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Max Product Cost</Label><Input type="number" value={filters.maxCost} onChange={(e) => setFilters((f) => ({ ...f, maxCost: e.target.value }))} placeholder="e.g. 10" /></div>
            <div className="space-y-1.5"><Label>Minimum Profit</Label><Input type="number" value={filters.minProfit} onChange={(e) => setFilters((f) => ({ ...f, minProfit: e.target.value }))} placeholder="e.g. 5" /></div>
            <div className="space-y-1.5"><Label>Minimum Margin %</Label><Input type="number" value={filters.minMargin} onChange={(e) => setFilters((f) => ({ ...f, minMargin: e.target.value }))} placeholder="e.g. 30" /></div>
            <Button onClick={runSearch} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />} Find Winning Products
            </Button>
          </CardContent>
        </Card>

        <div id="radar" className="lg:col-span-3">
          {!searched ? (
            <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">Run a search to see today's opportunities, trending products, and high-margin candidates.</CardContent></Card>
          ) : results.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">No sample opportunities match those filters. Try loosening them.</CardContent></Card>
          ) : (
            <div id="winners" className="grid gap-4 sm:grid-cols-2">
              {results.map((p, idx) => (
                <Card key={idx}>
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-t-lg bg-secondary">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{p.title}</p>
                      <ScorePill score={p.winningScore} size="sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>Cost {formatCurrency(p.cost)}</span>
                      <span>Sell {formatCurrency(p.estimatedSellingPrice)}</span>
                      <span>Profit {formatCurrency(p.profit)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.reasons.map((r: string) => <Badge key={r} variant="success">{r}</Badge>)}
                      {p.risks.map((r: string) => <Badge key={r} variant="warning">{r}</Badge>)}
                    </div>
                    <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
