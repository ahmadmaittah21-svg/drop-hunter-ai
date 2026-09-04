export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { importProductSchema } from "@/lib/validation/schemas";
import { getProviders, selectProvider } from "@/lib/providers";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = importProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const prefs = await prisma.userPreference.findUnique({ where: { userId } });
  const demoMode = prefs?.demoMode ?? true;

  const providers = getProviders(demoMode);
  const provider = selectProvider(parsed.data.url, providers);

  if (!provider) {
    return NextResponse.json(
      { error: "We couldn't retrieve enough product information. Try another product or use manual import." },
      { status: 422 }
    );
  }

  const result = await provider.fetchProduct(parsed.data.url);
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.error ?? "Product import failed." }, { status: 422 });
  }

  const data = result.data;

  const product = await prisma.product.create({
    data: {
      userId,
      sourceUrl: data.sourceUrl,
      sourceMarketplace: data.sourceMarketplace,
      sourceProductId: data.sourceProductId,
      title: data.title,
      brand: data.brand,
      model: data.model,
      sku: data.sku,
      currency: data.currency,
      price: data.price,
      discountPrice: data.discountPrice,
      rating: data.rating,
      reviewCount: data.reviewCount,
      orderCount: data.orderCount,
      sellerName: data.sellerName,
      sellerRating: data.sellerRating,
      weightGrams: data.weightGrams,
      dimensions: data.dimensions,
      shippingCost: data.shippingCost,
      shippingInfo: data.shippingInfo,
      description: data.description,
      rawData: (result.rawData ?? {}) as object,
      normalizedData: data as unknown as object,
      status: "ANALYZED",
      images: {
        create: data.images.map((img, i) => ({ url: img.url, isMain: img.isMain, isSelected: true, position: i })),
      },
      variations: { create: data.variations.map((v) => ({ type: v.type, value: v.value, priceDelta: v.priceDelta })) },
      specifications: { create: data.specifications.map((s) => ({ key: s.key, value: s.value, source: "EXTRACTED" })) },
    },
    include: { images: true, variations: true, specifications: true },
  });

  return NextResponse.json({ product, isDemoData: data.isDemoData });
}

