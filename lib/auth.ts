import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "dorisbrao_session";
const SESSION_ISSUER = "dorisbrao";
const SESSION_AUDIENCE = "dorisbrao-web";

type SessionClaims = {
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
  nbf?: number;
};

function decodeSegment(segment: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) return null;
  try {
    const decoded = Buffer.from(segment, "base64url");
    return decoded.toString("base64url") === segment ? decoded : null;
  } catch {
    return null;
  }
}

async function getLegacyAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const secret = process.env.AUTH_SESSION_SECRET;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!secret || !token) return null;

  const segments = token.split(".");
  if (segments.length !== 3) return null;
  const [encodedHeader, encodedClaims, encodedSignature] = segments;
  const headerBytes = decodeSegment(encodedHeader);
  const claimsBytes = decodeSegment(encodedClaims);
  const signature = decodeSegment(encodedSignature);
  if (!headerBytes || !claimsBytes || !signature) return null;

  try {
    const header: unknown = JSON.parse(headerBytes.toString("utf8"));
    const claims: unknown = JSON.parse(claimsBytes.toString("utf8"));
    if (!header || typeof header !== "object" || (header as { alg?: unknown }).alg !== "HS256") return null;
    if (!claims || typeof claims !== "object") return null;

    const session = claims as Partial<SessionClaims>;
    const now = Math.floor(Date.now() / 1000);
    const audienceMatches = Array.isArray(session.aud)
      ? session.aud.includes(SESSION_AUDIENCE)
      : session.aud === SESSION_AUDIENCE;
    if (
      typeof session.sub !== "string" || session.sub.length === 0 ||
      session.iss !== SESSION_ISSUER || !audienceMatches ||
      typeof session.exp !== "number" || !Number.isFinite(session.exp) || session.exp <= now ||
      (session.nbf !== undefined && (typeof session.nbf !== "number" || session.nbf > now))
    ) return null;

    const expected = createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedClaims}`)
      .digest();
    if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
    return session.sub;
  } catch {
    return null;
  }
}

export async function getAuthenticatedAccount() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return null;
  const [{ prisma }, { createSupabaseRequestClient }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/supabase/server"),
  ]);
  const supabase = createSupabaseRequestClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  const authUser = data.user;
  if (error || !authUser?.email || !authUser.email_confirmed_at) return null;

  const displayName = typeof authUser.user_metadata?.full_name === "string"
    ? authUser.user_metadata.full_name.trim().slice(0, 120)
    : "";
  return prisma.user.upsert({
    where: { email: authUser.email.toLowerCase() },
    update: {},
    create: {
      email: authUser.email.toLowerCase(),
      displayName: displayName || authUser.email.split("@")[0],
      role: "CLIENT",
    },
    select: { id: true, email: true, displayName: true, role: true },
  });
}

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const legacyUserId = await getLegacyAuthenticatedUserId(request);
  if (legacyUserId) return legacyUserId;
  const account = await getAuthenticatedAccount();
  return account?.id ?? null;
}
