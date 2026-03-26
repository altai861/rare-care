import "server-only";

import crypto from "node:crypto";

import type { AuthUser } from "@/lib/data/types";
import { getDatabase } from "@/lib/db/client";
import { initializeDatabase } from "@/lib/db/init";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

function toAuthUser(row: Pick<UserRow, "id" | "name" | "email" | "created_at">): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at
  };
}

export function getUserByEmail(email: string) {
  initializeDatabase();
  const db = getDatabase();

  return db
    .prepare(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1"
    )
    .get(email.toLowerCase()) as UserRow | undefined;
}

export function createUser({
  name,
  email,
  passwordHash
}: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  initializeDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: now
  };

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, created_at)
    VALUES (@id, @name, @email, @passwordHash, @createdAt)
  `).run(user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  } satisfies AuthUser;
}

export function createUserSession({
  userId,
  tokenHash,
  expiresAt
}: {
  userId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  initializeDatabase();
  const db = getDatabase();

  db.prepare(`
    INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at)
    VALUES (@id, @userId, @tokenHash, @expiresAt, @createdAt)
  `).run({
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    expiresAt,
    createdAt: new Date().toISOString()
  });
}

export function getUserForSessionToken(tokenHash: string) {
  initializeDatabase();
  const db = getDatabase();
  const now = new Date().toISOString();

  const row = db
    .prepare(`
      SELECT users.id, users.name, users.email, users.created_at
      FROM user_sessions
      INNER JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token_hash = ?
        AND user_sessions.expires_at > ?
      LIMIT 1
    `)
    .get(tokenHash, now) as
    | {
        id: string;
        name: string;
        email: string;
        created_at: string;
      }
    | undefined;

  return row ? toAuthUser(row) : null;
}

export function removeSessionByToken(tokenHash: string) {
  initializeDatabase();
  const db = getDatabase();

  db.prepare("DELETE FROM user_sessions WHERE token_hash = ?").run(tokenHash);
}

export function removeSessionsForUser(userId: string) {
  initializeDatabase();
  const db = getDatabase();

  db.prepare("DELETE FROM user_sessions WHERE user_id = ?").run(userId);
}
