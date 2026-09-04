import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    include: {
      images: { orderBy: { position: "asc" } },
      variations: true,
      specifications: true,
      analysis: true,
      profitCalcs: { orderBy: { createdAt: "desc" }, take: 1 },
      policyChecks: { orderBy: { createdAt: "desc" }, take: 20 },
      listings: true,
    },
  });

  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product });
}
