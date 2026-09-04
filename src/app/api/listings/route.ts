export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { createListingSchema } from "@/lib/validation/schemas";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const listings = await prisma.listing.findMany({
    where: { userId },
    include: { images: { where: { isMain: true }, take: 1 }, product: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, userId }, include: { images: true } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const listing = await prisma.listing.create({
    data: {
      userId,
      productId: product.id,
      title: parsed.data.title,
      originalTitle: product.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      categoryName: parsed.data.categoryName,
      sellingPrice: parsed.data.sellingPrice,
      quantity: parsed.data.quantity,
      status: "DRAFT",
      images: {
        create: product.images
          .filter((i) => i.isSelected)
          .map((i, idx) => ({ url: i.url, isMain: i.isMain, position: idx })),
      },
    },
    include: { images: true, specifics: true },
  });

  return NextResponse.json({ listing });
}

