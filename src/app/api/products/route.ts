export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { userId },
    include: { images: { where: { isMain: true }, take: 1 }, analysis: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ products });
}

