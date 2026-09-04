"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Import, Loader2, AlertCircle } from "lucide-react";

export default function ImportProductPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "We couldn't retrieve enough product information. Try another product or use manual import.");
        setLoading(false);
        return;
      }
      router.push(`/products/${json.product.id}`);
    } catch {
      setError("Something went wrong reaching the import service. Your connection may be offline.");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Import Product" description="Paste an AliExpress product URL to analyze it and prepare an eBay listing." />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Paste AliExpress Product URL</Label>
                <Input
                  id="url"
                  placeholder="https://www.aliexpress.com/item/XXXXXXXX.html"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  In Demo Mode, any URL works — Drop Hunter AI returns realistic sample product data so you can try the full flow.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Import className="h-4 w-4" />}
                {loading ? "Analyzing Product…" : "Analyze Product"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { step: "1. Extract", text: "Pulls title, price, images, specs, and variations from the source listing." },
            { step: "2. Normalize", text: "Cleans and structures the data without inventing anything unverified." },
            { step: "3. Generate", text: "AI drafts an eBay-ready title, description, and item specifics for review." },
          ].map((s) => (
            <div key={s.step} className="rounded-md border border-border p-4 text-xs">
              <p className="mb-1 font-mono text-primary">{s.step}</p>
              <p className="text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
