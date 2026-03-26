import "server-only";

import crypto from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { AuthUser } from "@/lib/data/types";
import { getUserForSessionToken, removeSessionByToken } from "@/lib/db/auth";

const scryptAsync = promisify(crypto.scrypt);

export const SESSION_COOKIE_NAME = "rare_care_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, existingHash] = storedHash.split(":");

  if (!salt || !existingHash) {
    return false;
  }

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const existingBuffer = Buffer.from(existingHash, "hex");

  if (existingBuffer.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(existingBuffer, derivedKey);
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const user = getUserForSessionToken(hashSessionToken(token));

  if (!user) {
    return null;
  }

  return user;
}

export async function getCurrentUserOrClearExpired() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const user = getUserForSessionToken(tokenHash);

  if (user) {
    return user;
  }

  removeSessionByToken(tokenHash);
  return null;
}
