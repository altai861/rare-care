import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  createSessionToken,
  getSessionExpiryDate,
  hashPassword,
  hashSessionToken,
  setSessionCookie
} from "@/lib/auth/session";
import { createUser, createUserSession, getUserByEmail } from "@/lib/db/auth";
import { registerSchema } from "@/lib/validation/forms";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid registration data." },
      { status: 400 }
    );
  }

  const existingUser = getUserByEmail(parsed.data.email);

  if (existingUser) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash
  });
  const sessionToken = createSessionToken();
  const expiresAt = getSessionExpiryDate();

  createUserSession({
    userId: user.id,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt: expiresAt.toISOString()
  });

  const response = NextResponse.json({
    message: "Registration successful.",
    user
  });

  clearSessionCookie(response);
  setSessionCookie(response, sessionToken, expiresAt);

  return response;
}
