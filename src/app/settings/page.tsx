import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Key, SlidersHorizontal } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure marketplace, profit, AI, and API settings." />
      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
        <Link href="/settings/preferences">
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Preferences</CardTitle>
              <CardDescription>Marketplace, currency, fees, profit targets, and AI tone.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/settings/api">
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" /> API Settings</CardTitle>
              <CardDescription>Connect OpenAI, AliExpress data access, and eBay credentials.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
