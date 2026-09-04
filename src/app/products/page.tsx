import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScorePill } from "@/components/shared/score-pill";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Import } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const products = await prisma.product.findMany({
    where: { userId },
    include: { images: { where: { isMain: true }, take: 1 }, analysis: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="My Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"} analyzed`}
        action={<Link href="/products/import"><Button><Import className="h-4 w-4" /> Import Product</Button></Link>}
      />

      <div className="px-6 py-6">
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center text-sm text-muted-foreground">
              No products yet. <Link href="/products/import" className="text-primary hover:underline">Import your first product</Link>.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Source Price</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Imported</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                          {p.images[0]?.url && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="line-clamp-1 font-medium">{p.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(p.discountPrice ?? p.price, p.currency)}</td>
                    <td className="px-4 py-3"><ScorePill score={p.analysis?.winningScore} size="sm" /></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
