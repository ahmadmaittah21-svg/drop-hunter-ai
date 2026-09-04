import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { analyzeProduct } from "@/lib/ai/aiService";
import { calculateWinningScore } from "@/lib/scoring/winningScore";
import type { NormalizedProductData } from "@/types/product";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const normalized = product.normalizedData as unknown as NormalizedProductData;

  let ai;
  try {
    ai = await analyzeProduct(normalized);
  } catch (err) {
    return NextResponse.json(
      { error: "AI generation failed. Your extracted product data is still saved." },
      { status: 502 }
    );
  }

  const latestProfit = await prisma.profitCalculation.findFirst({ where: { productId: product.id }, orderBy: { createdAt: "desc" } });

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
    aiCompetitionEstimate: ai.aiCompetitionEstimate,
    aiTrendEstimate: ai.aiTrendEstimate,
    aiSeasonalityEstimate: ai.aiSeasonalityEstimate,
    aiEbayFitEstimate: ai.aiEbayFitEstimate,
  });

  const analysis = await prisma.productAnalysis.upsert({
    where: { productId: product.id },
    create: {
      productId: product.id,
      winningScore: score.total,
      scoreBreakdown: score.breakdown as unknown as object,
      scoreConfidence: score.confidence,
      whyItMayWork: ai.whyItMayWork,
      advantages: ai.advantages as unknown as object,
      risks: ai.risks as unknown as object,
      competitionConcerns: ai.competitionConcerns,
      pricingObservations: ai.pricingObservations,
      shippingConcerns: ai.shippingConcerns,
      seasonality: ai.seasonality,
      targetCustomer: ai.targetCustomer,
      suggestedKeywords: ai.suggestedKeywords as unknown as object,
    },
    update: {
      winningScore: score.total,
      scoreBreakdown: score.breakdown as unknown as object,
      scoreConfidence: score.confidence,
      whyItMayWork: ai.whyItMayWork,
      advantages: ai.advantages as unknown as object,
      risks: ai.risks as unknown as object,
      competitionConcerns: ai.competitionConcerns,
      pricingObservations: ai.pricingObservations,
      shippingConcerns: ai.shippingConcerns,
      seasonality: ai.seasonality,
      targetCustomer: ai.targetCustomer,
      suggestedKeywords: ai.suggestedKeywords as unknown as object,
    },
  });

  return NextResponse.json({ analysis, score });
}
