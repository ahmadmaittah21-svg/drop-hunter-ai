import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { runPolicyCheck } from "@/lib/policy/policyChecker";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const product = await prisma.product.findFirst({ where: { id: params.id, userId }, include: { specifications: true } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const specifics: Record<string, string> = body.itemSpecifics ?? Object.fromEntries(product.specifications.map((s) => [s.key, s.value]));

  const result = runPolicyCheck({
    title: body.title ?? product.title,
    description: body.description ?? product.description ?? "",
    itemSpecifics: specifics,
    brandDeclared: !!(specifics["Brand"] && specifics["Brand"] !== "Not Specified"),
  });

  await prisma.policyCheck.deleteMany({ where: { productId: product.id } });
  if (result.findings.length > 0) {
    await prisma.policyCheck.createMany({
      data: result.findings.map((f) => ({
        productId: product.id,
        level: f.level,
        category: f.category,
        message: f.message,
        fieldRef: f.fieldRef,
      })),
    });
  }

  return NextResponse.json({ result });
}
