import { NextResponse } from "next/server";
import { getAuthenticatedAccount } from "@/lib/auth";

export async function GET() {
  try {
    const account = await getAuthenticatedAccount();
    if (!account) return NextResponse.json({ error: "A verified sign-in is required." }, { status: 401 });
    return NextResponse.json({
      id: account.id,
      name: account.displayName ?? account.email.split("@")[0],
      email: account.email,
      role: account.role,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("account profile lookup failed", error);
    return NextResponse.json({ error: "Unable to load your account." }, { status: 503 });
  }
}
