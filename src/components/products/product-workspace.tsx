"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScorePill } from "@/components/shared/score-pill";
import { calculateProfit } from "@/lib/profit/profitCalculator";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ExternalLink, Sparkles, ShieldAlert, Star, TrendingUp } from "lucide-react";

interface Props {
  product: any;
  preferences: any;
}

export function ProductWorkspace({ product, preferences }: Props) {
  const router = useRouter();

  return (
    <div>
      <div className="border-b border-border px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">{product.sourceMarketplace}</Badge>
              {product.normalizedData?.isDemoData && <Badge variant="warning">Demo Data</Badge>}
            </div>
            <h1 className="font-display text-xl font-semibold leading-snug">{product.title}</h1>
            <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              View source listing <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Winning Score</p>
              <ScorePill score={product.analysis?.winningScore} size="lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="profit">Profit Calculator</TabsTrigger>
            <TabsTrigger value="score">Winning Score</TabsTrigger>
            <TabsTrigger value="listing">Generate Listing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab product={product} /></TabsContent>
          <TabsContent value="specs"><SpecsTab product={product} /></TabsContent>
          <TabsContent value="images"><ImagesTab product={product} /></TabsContent>
          <TabsContent value="profit"><ProfitTab product={product} preferences={preferences} /></TabsContent>
          <TabsContent value="score"><ScoreTab product={product} /></TabsContent>
          <TabsContent value="listing"><ListingTab product={product} preferences={preferences} onCreated={(id) => router.push(`/listings/${id}`)} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab({ product }: { product: any }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Source Data</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Price" value={formatCurrency(product.discountPrice ?? product.price, product.currency)} />
          <Row label="Rating" value={product.rating ? `${product.rating} / 5` : "Not specified"} />
          <Row label="Orders" value={product.orderCount?.toLocaleString() ?? "Not specified"} />
          <Row label="Reviews" value={product.reviewCount?.toLocaleString() ?? "Not specified"} />
          <Row label="Seller" value={product.sellerName ?? "Not specified"} />
          <Row label="Seller rating" value={product.sellerRating ? `${product.sellerRating} / 5` : "Not specified"} />
          <Row label="Shipping" value={product.shippingInfo ?? "Not specified"} />
          <Row label="Weight" value={product.weightGrams ? `${product.weightGrams} g` : "Not specified"} />
          <Row label="Dimensions" value={product.dimensions ?? "Not specified"} />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Description</CardTitle><CardDescription>Verbatim from the source listing.</CardDescription></CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description ?? "Not specified."}</p>
          {product.variations.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Variations</p>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v: any) => (
                  <Badge key={v.id} variant="outline">{v.type}: {v.value}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SpecsTab({ product }: { product: any }) {
  return (
    <Card>
      <CardHeader><CardTitle>Product Specifications</CardTitle><CardDescription>Extracted directly from the source listing — nothing invented.</CardDescription></CardHeader>
      <CardContent>
        {product.specifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No specifications were found on the source listing.</p>
        ) : (
          <div className="divide-y divide-border rounded-md border border-border">
            {product.specifications.map((s: any) => (
              <div key={s.id} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{s.key}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImagesTab({ product }: { product: any }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {product.images.map((img: any) => (
        <div key={img.id} className="group relative overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt="" className="aspect-square w-full object-cover" />
          {img.isMain && <Badge className="absolute left-2 top-2" variant="warning">Main</Badge>}
        </div>
      ))}
      {product.images.length === 0 && <p className="text-sm text-muted-foreground">No product images were found.</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ProfitTab({ product, preferences }: { product: any; preferences: any }) {
  const [inputs, setInputs] = useState({
    productCost: product.discountPrice ?? product.price ?? 0,
    shippingCost: product.shippingCost ?? preferences?.defaultShippingCost ?? 0,
    sellingPrice: Math.round(((product.discountPrice ?? product.price ?? 0) * 3 + Number.EPSILON) * 100) / 100,
    ebayFeePct: preferences?.defaultEbayFeePct ?? 13.25,
    paymentFeePct: preferences?.defaultPaymentFeePct ?? 2.9,
    otherCosts: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const result = useMemo(() => calculateProfit(inputs), [inputs]);

  function update(key: keyof typeof inputs, value: string) {
    setSaved(false);
    setInputs((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  async function saveCalculation() {
    setSaving(true);
    await fetch("/api/profit/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inputs, productId: product.id }),
    });
    setSaving(false);
    setSaved(true);
  }

  const fields: [keyof typeof inputs, string, string?][] = [
    ["productCost", "AliExpress Cost", "$"],
    ["shippingCost", "Shipping Cost", "$"],
    ["sellingPrice", "eBay Selling Price", "$"],
    ["ebayFeePct", "eBay Fee %", "%"],
    ["paymentFeePct", "Payment Fee %", "%"],
    ["otherCosts", "Other Costs", "$"],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {fields.map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} type="number" step="0.01" value={inputs[key]} onChange={(e) => update(key, e.target.value)} />
            </div>
          ))}
          <Button onClick={saveCalculation} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saved ? "Saved" : "Save Calculation"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Result</CardTitle><CardDescription>Recalculates instantly as you type.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <ResultRow label="Gross Revenue" value={formatCurrency(result.grossRevenue)} />
          <ResultRow label="Estimated Fees" value={formatCurrency(result.estimatedFees)} />
          <ResultRow label="Total Cost" value={formatCurrency(result.totalCost)} />
          <div className="my-2 border-t border-border" />
          <ResultRow label="Estimated Profit" value={formatCurrency(result.estimatedProfit)} emphasis={result.estimatedProfit >= 0 ? "success" : "destructive"} />
          <ResultRow label="Profit Margin" value={`${result.profitMargin}%`} emphasis={result.profitMargin >= (preferences?.minMarginTarget ?? 20) ? "success" : "warning"} />
          <ResultRow label="ROI" value={`${result.roi}%`} />
        </CardContent>
      </Card>
    </div>
  );
}

function ResultRow({ label, value, emphasis }: { label: string; value: string; emphasis?: "success" | "warning" | "destructive" }) {
  const color = emphasis === "success" ? "text-success" : emphasis === "warning" ? "text-warning" : emphasis === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function ScoreTab({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(product.analysis);
  const [score, setScore] = useState<any>(product.analysis?.scoreBreakdown ? { breakdown: product.analysis.scoreBreakdown, total: product.analysis.winningScore, confidence: product.analysis.scoreConfidence } : null);

  async function runAnalysis() {
    setLoading(true);
    const res = await fetch(`/api/products/${product.id}/analyze`, { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setAnalysis(json.analysis);
      setScore(json.score);
    }
  }

  const labels: Record<string, string> = {
    demand: "Demand",
    profitPotential: "Profit Potential",
    competition: "Competition",
    trend: "Trend",
    priceGap: "Price Gap",
    shipping: "Shipping",
    reviewsSocialProof: "Reviews / Social Proof",
    seasonality: "Seasonality",
    ebayFit: "eBay Fit",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Winning Score</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-4"><ScorePill score={score?.total ?? analysis?.winningScore} size="lg" /></div>
          {score?.confidence && <p className="text-center text-xs text-muted-foreground">Confidence: {score.confidence} — based on how much verified data is available.</p>}
          <Button onClick={runAnalysis} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analysis ? "Re-run Analysis" : "Run AI Analysis"}
          </Button>
          {score?.breakdown && (
            <div className="space-y-2 pt-2">
              {Object.entries(score.breakdown).map(([key, val]: [string, any]) => (
                <div key={key}>
                  <div className="mb-0.5 flex justify-between text-xs"><span className="text-muted-foreground">{labels[key] ?? key}</span><span className="font-mono">{val}/100</span></div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${val}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Product Analysis</CardTitle><CardDescription>Facts stay factual; everything below is an AI estimate or opinion, clearly labeled.</CardDescription></CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!analysis ? (
            <p className="text-muted-foreground">Run the AI analysis to see why this product may or may not work, its risks, and suggested keywords.</p>
          ) : (
            <>
              <AnalysisBlock title="Why this product may work" text={analysis.whyItMayWork} />
              <ListBlock title="Potential Advantages" items={analysis.advantages} />
              <ListBlock title="Potential Risks" items={analysis.risks} />
              <AnalysisBlock title="Competition Concerns" text={analysis.competitionConcerns} />
              <AnalysisBlock title="Pricing Observations" text={analysis.pricingObservations} />
              <AnalysisBlock title="Shipping Concerns" text={analysis.shippingConcerns} />
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Seasonality: <Badge variant="outline">{analysis.seasonality}</Badge></span>
                <span>Target Customer: {analysis.targetCustomer}</span>
              </div>
              <ListBlock title="Suggested Keywords" items={analysis.suggestedKeywords} chips />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisBlock({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="text-foreground/90">{text}</p>
    </div>
  );
}

function ListBlock({ title, items, chips }: { title: string; items?: string[]; chips?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      {chips ? (
        <div className="flex flex-wrap gap-1.5">{items.map((i) => <Badge key={i} variant="outline">{i}</Badge>)}</div>
      ) : (
        <ul className="list-inside list-disc space-y-1 text-foreground/90">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      )}
    </div>
  );
}

function ListingTab({ product, preferences, onCreated }: { product: any; preferences: any; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState<string>(product.title.slice(0, preferences?.titleCharLimit ?? 80));
  const [description, setDescription] = useState<string>("");
  const [specifics, setSpecifics] = useState<any[]>([]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  async function generate(step: "title" | "description" | "specifics") {
    setLoadingStep(step);
    const res = await fetch(`/api/products/${product.id}/generate-${step}`, { method: "POST" });
    const json = await res.json();
    setLoadingStep(null);
    if (!res.ok) return;
    if (step === "title") setTitle(json.title);
    if (step === "description") setDescription(json.html);
    if (step === "specifics") setSpecifics(json.specifics);
  }

  async function checkPolicy() {
    setLoadingStep("policy");
    const specificsMap = Object.fromEntries(specifics.map((s) => [s.name, s.value]));
    const res = await fetch(`/api/products/${product.id}/policy-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, itemSpecifics: specificsMap }),
    });
    const json = await res.json();
    setLoadingStep(null);
    if (res.ok) setPolicy(json.result);
  }

  async function createListing() {
    setCreating(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, title, description: description || "<p>Not specified.</p>" }),
    });
    const json = await res.json();
    setCreating(false);
    if (res.ok) onCreated(json.listing.id);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Title</CardTitle><CardDescription>{title.length} / {preferences?.titleCharLimit ?? 80} characters</CardDescription></div>
          <Button size="sm" variant="outline" onClick={() => generate("title")} disabled={loadingStep === "title"}>
            {loadingStep === "title" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate
          </Button>
        </CardHeader>
        <CardContent>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={(preferences?.titleCharLimit ?? 80) + 20} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Item Specifics</CardTitle><CardDescription>Never invented — "Not Specified" where unknown.</CardDescription></div>
          <Button size="sm" variant="outline" onClick={() => generate("specifics")} disabled={loadingStep === "specifics"}>
            {loadingStep === "specifics" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {specifics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Generate item specifics to see AI-mapped fields with a confidence indicator.</p>
          ) : (
            specifics.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">{s.name}</span>
                <Input
                  value={s.value}
                  onChange={(e) => setSpecifics((prev) => prev.map((p, i) => (i === idx ? { ...p, value: e.target.value } : p)))}
                  className="h-8 text-sm"
                />
                <Badge variant={s.confidence === "HIGH" ? "success" : s.confidence === "MEDIUM" ? "warning" : "outline"}>{s.confidence}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Description</CardTitle><CardDescription>Clean HTML, structured for eBay.</CardDescription></div>
          <Button size="sm" variant="outline" onClick={() => generate("description")} disabled={loadingStep === "description"}>
            {loadingStep === "description" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <Textarea rows={14} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Generated description HTML will appear here." />
          <div className="rounded-md border border-border bg-secondary/30 p-4 text-sm">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
            <div dangerouslySetInnerHTML={{ __html: description || "<p class='text-muted-foreground'>Nothing generated yet.</p>" }} />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Policy / Risk Check</CardTitle><CardDescription>Assistance tool — not a guarantee of eBay compliance.</CardDescription></div>
          <Button size="sm" variant="outline" onClick={checkPolicy} disabled={loadingStep === "policy"}>
            {loadingStep === "policy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />} Run Check
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {!policy ? (
            <p className="text-sm text-muted-foreground">Run a check before publishing to catch common red flags.</p>
          ) : policy.findings.length === 0 ? (
            <div className="flex items-center gap-2 text-success text-sm"><Badge variant="success">GREEN</Badge> No obvious issues detected.</div>
          ) : (
            policy.findings.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Badge variant={f.level === "RED" ? "destructive" : "warning"}>{f.level}</Badge>
                <span className="text-foreground/90">{f.message}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={createListing} disabled={creating} size="lg" className="w-full">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
          Save Listing & Continue to Listing Builder
        </Button>
      </div>
    </div>
  );
}
