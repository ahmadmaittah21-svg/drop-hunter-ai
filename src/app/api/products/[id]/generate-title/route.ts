import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { generateTitle } from "@/lib/ai/aiService";
import type { NormalizedProductData } from "@/types/product";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const prefs = await prisma.userPreference.findUnique({ where: { userId } });
  const normalized = product.normalizedData as unknown as NormalizedProductData;

  try {
    const result = await generateTitle(normalized, prefs?.titleCharLimit ?? 80);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI generation failed. Your extracted product data is still saved." }, { status: 502 });
  }
}
