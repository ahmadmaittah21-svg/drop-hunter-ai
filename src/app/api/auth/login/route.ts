export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
export const dynamic = 'force-dynamic';
import { verifyPassword, createSession } from "@/lib/auth";
export const dynamic = 'force-dynamic';
import { z } from "zod";
export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';
const schema = z.object({ email: z.string().email(), password: z.string() });
export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
export const dynamic = 'force-dynamic';
  const body = await req.json().catch(() => null);
export const dynamic = 'force-dynamic';
  const parsed = schema.safeParse(body);
export const dynamic = 'force-dynamic';
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
export const dynamic = 'force-dynamic';
  if (!user || !user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
export const dynamic = 'force-dynamic';
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
export const dynamic = 'force-dynamic';
  }
export const dynamic = 'force-dynamic';

export const dynamic = 'force-dynamic';
  await createSession(user.id);
export const dynamic = 'force-dynamic';
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
export const dynamic = 'force-dynamic';
}
