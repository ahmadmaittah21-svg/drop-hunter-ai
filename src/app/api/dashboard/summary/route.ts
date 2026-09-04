import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const [productsAnalyzed, listingsGenerated, winningProducts, recentProducts, analyses] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.listing.count({ where: { userId } }),
    prisma.product.count({ where: { userId, analysis: { winningScore: { gte: 80 } } } }),
    prisma.product.findMany({
      where: { userId },
      include: { images: { where: { isMain: true }, take: 1 }, analysis: true, profitCalcs: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.productAnalysis.findMany({ where: { product: { userId } }, select: { winningScore: true } }),
  ]);

  const scores = analyses.map((a) => a.winningScore).filter((s): s is number => s !== null);
  const avgWinningScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const profitCalcs = await prisma.profitCalculation.findMany({ where: { product: { userId } }, select: { estimatedProfit: true } });
  const estimatedPotentialProfit = profitCalcs.reduce((sum, p) => sum + p.estimatedProfit, 0);

  return NextResponse.json({
    productsAnalyzed,
    winningProducts,
    listingsGenerated,
    avgWinningScore,
    estimatedPotentialProfit: Math.round(estimatedPotentialProfit * 100) / 100,
    recentProducts,
  });
}
