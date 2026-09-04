"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/preferences").then((r) => r.json()).then((j) => setPrefs(j.preferences));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      setPrefs(json.preferences);
      setSaved(true);
    }
  }

  if (!prefs) return <div className="px-6 py-10 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div>
      <PageHeader title="Preferences" description="Defaults applied across imports, calculators, and AI generation." />
      <div className="mx-auto max-w-2xl px-6 py-6">
        <Card>
          <CardHeader><CardTitle>Demo Mode</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="max-w-sm text-sm text-muted-foreground">
              Run the app entirely on offline sample data — no API keys required. Turn off once you've connected real credentials in Settings → API.
            </p>
            <Switch checked={prefs.demoMode} onCheckedChange={(v: boolean) => setPrefs((p: any) => ({ ...p, demoMode: v }))} />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle>Marketplace &amp; Currency</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Default Marketplace</Label>
              <Select value={prefs.defaultMarketplace} onChange={(e) => setPrefs((p: any) => ({ ...p, defaultMarketplace: e.target.value }))}>
                <option value="ebay-us">eBay US</option>
                <option value="ebay-uk">eBay UK</option>
                <option value="ebay-de">eBay DE</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default Currency</Label>
              <Select value={prefs.defaultCurrency} onChange={(e) => setPrefs((p: any) => ({ ...p, defaultCurrency: e.target.value }))}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle>Profit Settings</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <NumField label="Default eBay Fee %" value={prefs.defaultEbayFeePct} onChange={(v) => setPrefs((p: any) => ({ ...p, defaultEbayFeePct: v }))} />
            <NumField label="Default Payment Fee %" value={prefs.defaultPaymentFeePct} onChange={(v) => setPrefs((p: any) => ({ ...p, defaultPaymentFeePct: v }))} />
            <NumField label="Default Shipping Cost" value={prefs.defaultShippingCost} onChange={(v) => setPrefs((p: any) => ({ ...p, defaultShippingCost: v }))} />
            <NumField label="Minimum Profit Target" value={prefs.minProfitTarget} onChange={(v) => setPrefs((p: any) => ({ ...p, minProfitTarget: v }))} />
            <NumField label="Minimum Margin Target %" value={prefs.minMarginTarget} onChange={(v) => setPrefs((p: any) => ({ ...p, minMarginTarget: v }))} />
            <NumField label="Title Character Limit" value={prefs.titleCharLimit} onChange={(v) => setPrefs((p: any) => ({ ...p, titleCharLimit: v }))} />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle>AI Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={prefs.aiTone} onChange={(e) => setPrefs((p: any) => ({ ...p, aiTone: e.target.value }))}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="minimal">Minimal</option>
            </Select>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Preferences</Button>
          {saved && <span className="text-sm text-success">Saved.</span>}
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
