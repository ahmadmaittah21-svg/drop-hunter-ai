import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ProductWorkspace } from "@/components/products/product-workspace";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    include: {
      images: { orderBy: { position: "asc" } },
      variations: true,
      specifications: true,
      analysis: true,
      profitCalcs: { orderBy: { createdAt: "desc" }, take: 1 },
      policyChecks: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const prefs = await prisma.userPreference.findUnique({ where: { userId } });

  return <ProductWorkspace product={JSON.parse(JSON.stringify(product))} preferences={JSON.parse(JSON.stringify(prefs))} />;
}
