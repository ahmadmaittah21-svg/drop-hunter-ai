import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { discoveryFilterSchema } from "@/lib/validation/schemas";
import { DemoDiscoveryProvider } from "@/lib/discovery/demoDiscoveryProvider";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = discoveryFilterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid filters." }, { status: 400 });

  const search = await prisma.productSearch.create({
    data: { userId, ...parsed.data, status: "RUNNING" },
  });

  // Only a DemoDiscoveryProvider exists in V1. This is the exact seam
  // where AliExpressDiscoveryProvider / eBayMarketProvider / TrendProvider
  // plug in later — see src/lib/discovery/productDiscoveryProvider.ts
  const provider = new DemoDiscoveryProvider();
  const results = await provider.discover(parsed.data);

  await prisma.productSearch.update({ where: { id: search.id }, data: { status: "COMPLETE", resultsCount: results.length } });

  return NextResponse.json({ searchId: search.id, results, isDemoData: true });
}
