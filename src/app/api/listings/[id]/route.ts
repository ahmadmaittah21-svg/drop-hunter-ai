import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { updateListingSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const listing = await prisma.listing.findFirst({
    where: { id: params.id, userId },
    include: { images: true, specifics: true, product: true, policyChecks: { orderBy: { createdAt: "desc" } } },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateListingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const existing = await prisma.listing.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const listing = await prisma.listing.update({
    where: { id: params.id },
    data: parsed.data,
    include: { images: true, specifics: true },
  });

  return NextResponse.json({ listing });
}
