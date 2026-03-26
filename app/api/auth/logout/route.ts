import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  hashSessionToken,
  SESSION_COOKIE_NAME
} from "@/lib/auth/session";
import { removeSessionByToken } from "@/lib/db/auth";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (token) {
    removeSessionByToken(hashSessionToken(token));
  }

  const response = NextResponse.json({ message: "Logout successful." });
  clearSessionCookie(response);
  return response;
}
