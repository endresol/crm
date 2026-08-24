import "server-only";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PORTAL_SESSION_COOKIE_NAME } from "./constants";

export { PORTAL_SESSION_COOKIE_NAME };
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — same as lib/auth/session.ts

export type SessionContact = {
  id: string;
  workspaceId: string;
  clientId: string;
  clientName: string;
  fullName: string;
  email: string | null;
  workspaceName: string;
  workspaceLogoUrl: string | null;
  workspaceBackgroundColor: string;
  workspaceAccentColor: string;
  workspaceDateFormat: string;
};

/** Creates a DB-backed portal session for `contactId` and sets the httpOnly cookie. */
export async function createPortalSession(contactId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.portalSession.create({
    data: { id: token, contactId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(PORTAL_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Reads the portal session cookie and returns the authenticated Contact, or
 * null. Also treats a Contact whose portal access has since been disabled
 * (portalPasswordHash cleared — see features/contacts/service.ts) as logged
 * out, even though its PortalSession rows aren't proactively deleted on
 * disable: this check is what actually revokes them.
 */
export async function getCurrentContact(): Promise<SessionContact | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.portalSession.findUnique({
    where: { id: token },
    include: { contact: { include: { client: true, workspace: true } } },
  });

  if (!session || session.expiresAt < new Date() || !session.contact.portalPasswordHash) {
    if (session) await prisma.portalSession.delete({ where: { id: token } }).catch(() => {});
    return null;
  }

  const { contact } = session;
  return {
    id: contact.id,
    workspaceId: contact.workspaceId,
    clientId: contact.clientId,
    clientName: contact.client.name,
    fullName: contact.fullName,
    email: contact.email,
    workspaceName: contact.workspace.name,
    workspaceLogoUrl: contact.workspace.logoUrl,
    workspaceBackgroundColor: contact.workspace.backgroundColor,
    workspaceAccentColor: contact.workspace.accentColor,
    workspaceDateFormat: contact.workspace.dateFormat,
  };
}

/** Deletes the current portal session (DB row + cookie). Safe to call when logged out. */
export async function destroyPortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.portalSession.delete({ where: { id: token } }).catch(() => {});
  }
  cookieStore.delete(PORTAL_SESSION_COOKIE_NAME);
}
