import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScorePill } from "@/components/shared/score-pill";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Import, Radar, ListChecks, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [productsAnalyzed, listingsGenerated, winningProducts, recentProducts, analyses, profitCalcs] = await Promise.all([
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
    prisma.profitCalculation.findMany({ where: { product: { userId } }, select: { estimatedProfit: true } }),
  ]);

  const scores = analyses.map((a) => a.winningScore).filter((s): s is number => s !== null);
  const avgWinningScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const estimatedPotentialProfit = profitCalcs.reduce((sum, p) => sum + p.estimatedProfit, 0);

  const cards = [
    { label: "Products Analyzed", value: productsAnalyzed, icon: Import },
    { label: "Winning Products", value: winningProducts, icon: TrendingUp },
    { label: "Listings Generated", value: listingsGenerated, icon: ListChecks },
    { label: "Avg. Winning Score", value: avgWinningScore ?? "—", icon: Radar },
    { label: "Est. Potential Profit", value: formatCurrency(estimatedPotentialProfit), icon: TrendingUp },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your research and listing pipeline at a glance."
        action={
          <div className="flex gap-2">
            <Link href="/products/import"><Button><Import className="h-4 w-4" /> Import Product</Button></Link>
            <Link href="/research"><Button variant="outline"><Radar className="h-4 w-4" /> Find Winning Products</Button></Link>
            <Link href="/listings"><Button variant="outline"><ListChecks className="h-4 w-4" /> View Listings</Button></Link>
          </div>
        }
      />

      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex flex-col gap-2 pt-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wide">{c.label}</span>
                <c.icon className="h-4 w-4" />
              </div>
              <span className="font-display text-2xl font-semibold">{c.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="px-6 pb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent Products</h2>
          <Link href="/products" className="text-sm text-primary hover:underline">View all</Link>
        </div>

        {recentProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <p className="text-sm text-muted-foreground">No products yet. Import your first AliExpress listing to get started.</p>
              <Link href="/products/import"><Button>Import a Product</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((p) => {
              const profit = p.profitCalcs[0];
              return (
                <Link key={p.id} href={`/products/${p.id}`}>
                  <Card className="h-full overflow-hidden transition-colors hover:border-primary/40">
                    <div className="aspect-[4/3] w-full bg-secondary">
                      {p.images[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Source: {formatCurrency(p.discountPrice ?? p.price, p.currency)}</span>
                        {profit && <span>Sell: {formatCurrency(profit.sellingPrice, p.currency)}</span>}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <ScorePill score={p.analysis?.winningScore} size="sm" />
                        <span className="text-[11px] text-muted-foreground">{formatDate(p.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
