import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  defaultMarketplace: z.string().optional(),
  defaultCurrency: z.string().optional(),
  defaultEbayFeePct: z.number().optional(),
  defaultPaymentFeePct: z.number().optional(),
  defaultShippingCost: z.number().optional(),
  minProfitTarget: z.number().optional(),
  minMarginTarget: z.number().optional(),
  titleCharLimit: z.number().int().optional(),
  aiTone: z.string().optional(),
  theme: z.string().optional(),
  demoMode: z.boolean().optional(),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const prefs = await prisma.userPreference.upsert({ where: { userId }, create: { userId }, update: {} });
  return NextResponse.json({ preferences: prefs });
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const prefs = await prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ preferences: prefs });
}
