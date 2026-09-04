import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const listing = await prisma.listing.findFirst({
    where: { id: params.id, userId },
    include: { images: true, specifics: true, product: true },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  if (format === "csv") {
    const rows = [
      ["Field", "Value"],
      ["Title", listing.title],
      ["Price", String(listing.sellingPrice ?? "")],
      ["Category", listing.categoryName ?? ""],
      ...listing.specifics.map((s) => [s.name, s.value]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="listing-${listing.id}.csv"` } });
  }

  if (format === "html") {
    return new NextResponse(listing.description, { headers: { "Content-Type": "text/html" } });
  }

  if (format === "txt") {
    const txt = `${listing.title}\n\n${listing.description.replace(/<[^>]+>/g, "")}`;
    return new NextResponse(txt, { headers: { "Content-Type": "text/plain" } });
  }

  return NextResponse.json({ listing });
}
