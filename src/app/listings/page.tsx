import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "success" | "warning" | "outline"> = {
  DRAFT: "outline",
  READY: "warning",
  EXPORTED: "default",
  PUBLISHED: "success",
};

export default async function ListingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const listings = await prisma.listing.findMany({
    where: { userId },
    include: { images: { where: { isMain: true }, take: 1 }, product: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Listings" description={`${listings.length} listing${listings.length === 1 ? "" : "s"} in your workspace`} />
      <div className="px-6 py-6">
        {listings.length === 0 ? (
          <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">No listings yet. Generate one from a product's "Generate Listing" tab.</CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <Link key={l.id} href={`/listings/${l.id}`}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-secondary">
                    {l.images[0]?.url && <img src={l.images[0].url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <CardContent className="pt-4">
                    <p className="line-clamp-2 text-sm font-medium">{l.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={statusVariant[l.status] ?? "outline"}>{l.status}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(l.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
