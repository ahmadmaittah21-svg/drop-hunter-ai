import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { calculateListingQuality } from "@/lib/scoring/listingQuality";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const listing = await prisma.listing.findFirst({
    where: { id: params.id, userId },
    include: { images: true, specifics: true, policyChecks: true },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const prefs = await prisma.userPreference.findUnique({ where: { userId } });

  const result = calculateListingQuality({
    title: listing.title,
    titleCharLimit: prefs?.titleCharLimit ?? 80,
    description: listing.description,
    itemSpecifics: Object.fromEntries(listing.specifics.map((s) => [s.name, s.value])),
    imageCount: listing.images.length,
    categoryConfidence: (listing.categoryConfidence as "HIGH" | "MEDIUM" | "LOW" | undefined) ?? undefined,
    keywordCount: 0,
    policyRedCount: listing.policyChecks.filter((p) => p.level === "RED").length,
    policyYellowCount: listing.policyChecks.filter((p) => p.level === "YELLOW").length,
  });

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      qualityScore: result.score,
      qualityFactors: result.factors as unknown as object,
      strengths: result.strengths as unknown as object,
      warnings: result.warnings as unknown as object,
      recommendations: result.recommendations as unknown as object,
    },
  });

  return NextResponse.json({ result, listing: updated });
}
