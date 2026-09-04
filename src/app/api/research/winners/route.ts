export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const winners = await prisma.product.findMany({
    where: { userId, analysis: { winningScore: { gte: 60 } } },
    include: { images: { where: { isMain: true }, take: 1 }, analysis: true },
    orderBy: { analysis: { winningScore: "desc" } },
    take: 50,
  });

  return NextResponse.json({ winners });
}

