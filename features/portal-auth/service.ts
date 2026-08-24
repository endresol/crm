import "server-only";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createPortalSession, destroyPortalSession } from "@/lib/auth/portal-session";
import type { z } from "zod";
import type { portalLogInSchema } from "./schemas";

export class PortalAuthError extends Error {}

/**
 * A Contact logs in with the same "incorrect email or password" message
 * whether the email doesn't exist or portal access was never enabled for
 * it — same reasoning as features/auth's logIn not distinguishing "no
 * account" from "wrong password".
 */
export async function portalLogIn(input: z.infer<typeof portalLogInSchema>) {
  const contact = await prisma.contact.findUnique({ where: { email: input.email } });
  if (!contact || !contact.portalPasswordHash) {
    throw new PortalAuthError("Incorrect email or password.");
  }

  const passwordMatches = await verifyPassword(input.password, contact.portalPasswordHash);
  if (!passwordMatches) {
    throw new PortalAuthError("Incorrect email or password.");
  }

  await createPortalSession(contact.id);
}

export async function portalLogOut() {
  await destroyPortalSession();
}
