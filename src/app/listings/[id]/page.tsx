import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ListingBuilder } from "@/components/listings/listing-builder";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const listing = await prisma.listing.findFirst({
    where: { id: params.id, userId },
    include: { images: true, specifics: true, product: true, policyChecks: { orderBy: { createdAt: "desc" } } },
  });
  if (!listing) notFound();

  return <ListingBuilder listing={JSON.parse(JSON.stringify(listing))} />;
}
