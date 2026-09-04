import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { calculateWinningScore } from "@/lib/scoring/winningScore";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    include: { analysis: true, profitCalcs: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const latestProfit = product.profitCalcs[0];
  const breakdown = (product.analysis?.scoreBreakdown ?? {}) as Record<string, number>;

  const score = calculateWinningScore({
    price: product.price ?? undefined,
    discountPrice: product.discountPrice ?? undefined,
    rating: product.rating ?? undefined,
    reviewCount: product.reviewCount ?? undefined,
    orderCount: product.orderCount ?? undefined,
    shippingCost: product.shippingCost ?? undefined,
    estimatedSellingPrice: latestProfit?.sellingPrice,
    estimatedProfit: latestProfit?.estimatedProfit,
    estimatedMargin: latestProfit?.profitMargin,
    aiCompetitionEstimate: breakdown.competition,
    aiTrendEstimate: breakdown.trend,
    aiSeasonalityEstimate: breakdown.seasonality,
    aiEbayFitEstimate: breakdown.ebayFit,
  });

  return NextResponse.json({ score });
}
