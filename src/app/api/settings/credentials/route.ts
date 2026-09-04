import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["openai", "ebay", "aliexpress"]),
  label: z.string().optional(),
  value: z.record(z.string(), z.string()), // e.g. { apiKey: "..." } or { clientId, clientSecret }
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const creds = await prisma.apiCredential.findMany({
    where: { userId },
    select: { id: true, provider: true, label: true, isActive: true, createdAt: true }, // never return encryptedValue
  });
  return NextResponse.json({ credentials: creds });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  let encryptedValue: string;
  try {
    encryptedValue = encrypt(JSON.stringify(parsed.data.value));
  } catch (err) {
    return NextResponse.json(
      { error: "Server is missing CREDENTIAL_ENCRYPTION_KEY — set it in your environment to store credentials securely." },
      { status: 500 }
    );
  }

  const cred = await prisma.apiCredential.upsert({
    where: { userId_provider_label: { userId, provider: parsed.data.provider, label: parsed.data.label ?? "" } },
    create: { userId, provider: parsed.data.provider, label: parsed.data.label, encryptedValue },
    update: { encryptedValue, isActive: true },
  });

  return NextResponse.json({ credential: { id: cred.id, provider: cred.provider, label: cred.label } });
}
