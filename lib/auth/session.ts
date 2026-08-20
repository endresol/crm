import "server-only";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "./constants";

export { SESSION_COOKIE_NAME };
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type SessionUser = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  workspaceName: string;
  workspaceLogoUrl: string | null;
  workspaceBackgroundColor: string;
  workspaceAccentColor: string;
  workspaceTimezone: string;
  workspaceDateFormat: string;
  workspaceCurrency: string;
};

/** Creates a DB-backed session for `userId` and sets the httpOnly cookie. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { id: token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Reads the session cookie and returns the authenticated user, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: { include: { workspace: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: token } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    workspaceId: session.user.workspaceId,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    avatarUrl: session.user.avatarUrl,
    workspaceName: session.user.workspace.name,
    workspaceLogoUrl: session.user.workspace.logoUrl,
    workspaceBackgroundColor: session.user.workspace.backgroundColor,
    workspaceAccentColor: session.user.workspace.accentColor,
    workspaceTimezone: session.user.workspace.timezone,
    workspaceDateFormat: session.user.workspace.dateFormat,
    workspaceCurrency: session.user.workspace.currency,
  };
}

/** Deletes the current session (DB row + cookie). Safe to call when logged out. */
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.delete({ where: { id: token } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
