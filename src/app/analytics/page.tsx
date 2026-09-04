import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [productsAnalyzed, savedProducts, listingsGenerated, analyses, profitCalcs, searches] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.savedProduct.count({ where: { userId } }),
    prisma.listing.count({ where: { userId } }),
    prisma.productAnalysis.findMany({ where: { product: { userId } }, select: { winningScore: true } }),
    prisma.profitCalculation.findMany({ where: { product: { userId } }, select: { estimatedProfit: true, profitMargin: true } }),
    prisma.productSearch.findMany({ where: { userId }, select: { category: true } }),
  ]);

  const scores = analyses.map((a) => a.winningScore).filter((s): s is number => s !== null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const highestScore = scores.length ? Math.max(...scores) : null;
  const avgMargin = profitCalcs.length ? Math.round(profitCalcs.reduce((a, b) => a + b.profitMargin, 0) / profitCalcs.length) : null;
  const avgProfit = profitCalcs.length ? profitCalcs.reduce((a, b) => a + b.estimatedProfit, 0) / profitCalcs.length : null;
  const categories = Array.from(new Set(searches.map((s) => s.category).filter(Boolean)));

  const cards = [
    { label: "Products Analyzed", value: productsAnalyzed },
    { label: "Products Saved", value: savedProducts },
    { label: "Average Score", value: avgScore ?? "—" },
    { label: "Highest Score", value: highestScore ?? "—" },
    { label: "Average Est. Margin", value: avgMargin !== null ? `${avgMargin}%` : "—" },
    { label: "Average Est. Profit", value: avgProfit !== null ? formatCurrency(avgProfit) : "—" },
    { label: "Listings Generated", value: listingsGenerated },
    { label: "Categories Researched", value: categories.length },
  ];

  return (
    <div>
      <PageHeader title="Analytics" description="Aggregated research metrics across your account. Connect real sales data later to extend this view." />
      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
