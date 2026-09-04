"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key } from "lucide-react";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", envVars: ["OPENAI_API_KEY"], fields: [{ key: "apiKey", label: "API Key" }] },
  { id: "aliexpress", name: "AliExpress Data Provider", envVars: ["ALIEXPRESS_DATA_API_URL", "ALIEXPRESS_DATA_API_KEY"], fields: [{ key: "apiUrl", label: "Data API URL" }, { key: "apiKey", label: "API Key" }] },
  { id: "ebay", name: "eBay Developer API", envVars: ["EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET", "EBAY_RU_NAME"], fields: [{ key: "clientId", label: "Client ID" }, { key: "clientSecret", label: "Client Secret" }, { key: "ruName", label: "RuName" }] },
];

export default function ApiSettingsPage() {
  return (
    <div>
      <PageHeader title="API Settings" description="Drop Hunter AI is fully usable in Demo Mode without any of these. Connect real credentials when you're ready to go live." />
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        {PROVIDERS.map((p) => <ProviderCard key={p.id} provider={p} />)}
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: (typeof PROVIDERS)[number] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: provider.id, value: values }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" /> {provider.name}</CardTitle>
        <CardDescription>
          Preferred: set <code className="rounded bg-secondary px-1 py-0.5 text-xs">{provider.envVars.join(", ")}</code> as server environment variables.
          The form below stores an encrypted per-account credential for future use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {provider.fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label>{f.label}</Label>
            <Input type="password" value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1">
          <Button variant="outline" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Encrypted</Button>
          {saved && <Badge variant="success">Saved</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
