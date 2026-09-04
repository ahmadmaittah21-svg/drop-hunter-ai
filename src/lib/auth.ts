import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

/**
 * Minimal, dependency-free session auth.
 * - Passwords hashed with scrypt (salt + hash stored together).
 * - Sessions are a signed cookie: base64(userId).base64(hmac).
 *   No server-side session table needed; revoke by rotating AUTH_SECRET.
 *
 * This is intentionally simple so the app has zero required external
 * auth provider — swap in NextAuth/Clerk/etc. for production hardening
 * without changing anything else in the app (all reads go through
 * getCurrentUserId()).
 */

const COOKIE_NAME = "dha_session";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set.");
  return secret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(attempt));
}

function sign(userId: string): string {
  const hmac = crypto.createHmac("sha256", getSecret()).update(userId).digest("base64url");
  return `${Buffer.from(userId).toString("base64url")}.${hmac}`;
}

function unsign(token: string): string | null {
  const [idB64, sig] = token.split(".");
  if (!idB64 || !sig) return null;
  const userId = Buffer.from(idB64, "base64url").toString("utf8");
  const expected = crypto.createHmac("sha256", getSecret()).update(userId).digest("base64url");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return userId;
}

export async function createSession(userId: string) {
  cookies().set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  cookies().delete(COOKIE_NAME);
}

/**
 * Resolves the current user id. In Demo Mode (default, no DB write needed
 * to browse the app), falls back to a single shared demo user so every
 * page works without a login flow. Real deployments should set
 * DEMO_MODE=false and require sign-in.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    const userId = unsign(token);
    if (userId) return userId;
  }
  if (process.env.DEMO_MODE !== "false") {
    return getOrCreateDemoUserId();
  }
  return null;
}

let cachedDemoUserId: string | null = null;
async function getOrCreateDemoUserId(): Promise<string> {
  if (cachedDemoUserId) return cachedDemoUserId;
  const existing = await prisma.user.findUnique({ where: { email: "demo@drophunter.ai" } });
  if (existing) {
    cachedDemoUserId = existing.id;
    return existing.id;
  }
  const created = await prisma.user.create({
    data: {
      email: "demo@drophunter.ai",
      name: "Demo Seller",
      preferences: { create: {} },
    },
  });
  cachedDemoUserId = created.id;
  return created.id;
}
