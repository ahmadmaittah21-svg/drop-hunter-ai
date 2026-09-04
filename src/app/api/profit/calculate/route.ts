import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { calculateProfit } from "@/lib/profit/profitCalculator";
import { profitCalculationSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const core = profitCalculationSchema.safeParse(body);
  if (!core.success) {
    return NextResponse.json({ error: core.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const result = calculateProfit(core.data);

  const productId = typeof body?.productId === "string" ? body.productId : undefined;
  if (productId) {
    const product = await prisma.product.findFirst({ where: { id: productId, userId } });
    if (product) {
      await prisma.profitCalculation.create({
        data: { productId: product.id, ...core.data, ...result },
      });
    }
  }

  return NextResponse.json({ result });
}
