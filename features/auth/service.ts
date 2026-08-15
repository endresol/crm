import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import type { z } from "zod";
import type { logInSchema, signUpSchema } from "./schemas";

export class AuthError extends Error {}

/** Creates a new Workspace + its first (Master Admin) User, then signs them in. */
export async function signUp(input: z.infer<typeof signUpSchema>) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { name: input.workspaceName },
    });

    return tx.user.create({
      data: {
        workspaceId: workspace.id,
        name: input.name,
        email: input.email,
        passwordHash,
        role: "MASTER_ADMIN",
      },
    });
  });

  await createSession(user.id);
}

export async function logIn(input: z.infer<typeof logInSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthError("Incorrect email or password.");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthError("Incorrect email or password.");
  }

  await createSession(user.id);
}

export async function logOut() {
  await destroySession();
}
