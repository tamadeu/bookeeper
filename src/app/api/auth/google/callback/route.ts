import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  const { access_token } = await tokenRes.json();

  // Get user info
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  const googleUser: { id: string; email: string } = await userInfoRes.json();

  // Find or create user
  let [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.googleId, googleUser.id), eq(users.email, googleUser.email)));

  if (!user) {
    const [created] = await db
      .insert(users)
      .values({ id: randomUUID(), email: googleUser.email, googleId: googleUser.id })
      .returning({ id: users.id });
    user = created;
  } else if (!user) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  await createSession(user.id);

  const response = NextResponse.redirect(`${APP_URL}/`);
  response.cookies.delete("oauth_state");
  return response;
}
