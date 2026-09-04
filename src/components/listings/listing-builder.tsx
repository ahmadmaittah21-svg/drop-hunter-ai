"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Download, Copy, Gauge } from "lucide-react";

export function ListingBuilder({ listing: initial }: { listing: any }) {
  const [listing, setListing] = useState(initial);
  const [quality, setQuality] = useState<any>(
    initial.qualityScore ? { score: initial.qualityScore, factors: initial.qualityFactors, strengths: initial.strengths, warnings: initial.warnings, recommendations: initial.recommendations } : null
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(partial: Partial<any>) {
    setSaving(true);
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) setListing((prev: any) => ({ ...prev, ...json.listing }));
  }

  async function runQualityCheck() {
    setLoading(true);
    const res = await fetch(`/api/listings/${listing.id}/quality-score`, { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (res.ok) setQuality(json.result);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">eBay Listing Builder</p>
          <h1 className="font-display text-xl font-semibold">{listing.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {quality && (
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">{quality.score}/100</span>
            </div>
          )}
          <Button variant="outline" onClick={runQualityCheck} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />} Quality Check
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        <Tabs defaultValue="title">
          <TabsList>
            <TabsTrigger value="title">Title</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifics">Item Specifics</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="quality">Quality Score</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="title">
            <Card>
              <CardHeader><CardTitle>Title</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Input value={listing.title} onChange={(e) => setListing((p: any) => ({ ...p, title: e.target.value }))} />
                <Button onClick={() => save({ title: listing.title })} disabled={saving}>Save</Button>
                <Button variant="outline" size="icon" onClick={() => copy(listing.title)}><Copy className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description">
            <Card>
              <CardHeader><CardTitle>Description (HTML)</CardTitle></CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <Textarea rows={16} value={listing.description} onChange={(e) => setListing((p: any) => ({ ...p, description: e.target.value }))} />
                <div className="rounded-md border border-border bg-secondary/30 p-4 text-sm" dangerouslySetInnerHTML={{ __html: listing.description }} />
              </CardContent>
              <div className="flex gap-2 px-5 pb-5">
                <Button onClick={() => save({ description: listing.description })} disabled={saving}>Save</Button>
                <Button variant="outline" onClick={() => copy(listing.description)}><Copy className="h-4 w-4" /> Copy HTML</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="specifics">
            <Card>
              <CardHeader><CardTitle>Item Specifics</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {listing.specifics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No item specifics saved on this listing yet. Generate them from the product page.</p>
                ) : (
                  listing.specifics.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="flex items-center gap-2">{s.value} <Badge variant={s.confidence === "HIGH" ? "success" : s.confidence === "MEDIUM" ? "warning" : "outline"}>{s.confidence}</Badge></span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent className="flex max-w-xs flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Selling Price</Label>
                  <Input id="price" type="number" step="0.01" value={listing.sellingPrice ?? ""} onChange={(e) => setListing((p: any) => ({ ...p, sellingPrice: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input id="qty" type="number" value={listing.quantity} onChange={(e) => setListing((p: any) => ({ ...p, quantity: Number(e.target.value) }))} />
                </div>
                <Button onClick={() => save({ sellingPrice: listing.sellingPrice, quantity: listing.quantity })} disabled={saving}>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality">
            <Card>
              <CardHeader><CardTitle>Listing Quality Score</CardTitle><CardDescription>Reflects completeness and risk — not a guarantee of performance.</CardDescription></CardHeader>
              <CardContent>
                {!quality ? (
                  <p className="text-sm text-muted-foreground">Run a quality check to see a 0-100 score with strengths, warnings, and recommendations.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="font-mono text-3xl font-semibold">{quality.score}<span className="text-base text-muted-foreground">/100</span></div>
                    {quality.strengths?.length > 0 && <ListSection title="Strengths" items={quality.strengths} variant="success" />}
                    {quality.warnings?.length > 0 && <ListSection title="Warnings" items={quality.warnings} variant="warning" />}
                    {quality.recommendations?.length > 0 && <ListSection title="Recommendations" items={quality.recommendations} variant="outline" />}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader><CardTitle>Preview</CardTitle><CardDescription>This is a Drop Hunter AI preview, not an official eBay preview.</CardDescription></CardHeader>
              <CardContent>
                <div className="mx-auto max-w-2xl rounded-lg border border-border bg-background p-6">
                  <div className="mb-2 flex justify-end"><Badge variant="outline">Preview</Badge></div>
                  {listing.images[0]?.url && <img src={listing.images[0].url} alt="" className="mb-4 aspect-video w-full rounded-md object-cover" />}
                  <h2 className="font-display text-lg font-semibold">{listing.title}</h2>
                  <p className="mt-1 text-2xl font-semibold text-primary">{formatCurrency(listing.sellingPrice)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Condition: {listing.condition} · Qty available: {listing.quantity}</p>
                  <div className="mt-4 border-t border-border pt-4 text-sm" dangerouslySetInnerHTML={{ __html: listing.description }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader><CardTitle>Export</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {["json", "csv", "html", "txt"].map((fmt) => (
                  <a key={fmt} href={`/api/listings/${listing.id}/export?format=${fmt}`} target="_blank" rel="noreferrer">
                    <Button variant="outline"><Download className="h-4 w-4" /> {fmt.toUpperCase()}</Button>
                  </a>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ListSection({ title, items, variant }: { title: string; items: string[]; variant: "success" | "warning" | "outline" }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {items.map((i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <Badge variant={variant}>{title === "Strengths" ? "✓" : title === "Warnings" ? "!" : "→"}</Badge>
            <span>{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
