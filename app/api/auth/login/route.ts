import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  createSessionToken,
  getSessionExpiryDate,
  hashSessionToken,
  setSessionCookie,
  verifyPassword
} from "@/lib/auth/session";
import { createUserSession, getUserByEmail } from "@/lib/db/auth";
import { loginSchema } from "@/lib/validation/forms";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid login data." },
      { status: 400 }
    );
  }

  const user = getUserByEmail(parsed.data.email);

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  }

  const passwordMatches = await verifyPassword(
    parsed.data.password,
    user.password_hash
  );

  if (!passwordMatches) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  }

  const sessionToken = createSessionToken();
  const expiresAt = getSessionExpiryDate();

  createUserSession({
    userId: user.id,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt: expiresAt.toISOString()
  });

  const response = NextResponse.json({
    message: "Login successful.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    }
  });

  clearSessionCookie(response);
  setSessionCookie(response, sessionToken, expiresAt);

  return response;
}
