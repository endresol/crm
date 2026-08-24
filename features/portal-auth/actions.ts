"use server";

import { redirect } from "next/navigation";
import { PortalAuthError, portalLogIn, portalLogOut } from "./service";
import { portalLogInSchema } from "./schemas";

export type PortalAuthActionState = {
  error?: string;
};

export async function portalLogInAction(
  _prevState: PortalAuthActionState,
  formData: FormData,
): Promise<PortalAuthActionState> {
  const parsed = portalLogInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await portalLogIn(parsed.data);
  } catch (error) {
    if (error instanceof PortalAuthError) return { error: error.message };
    throw error;
  }

  redirect("/portal/dashboard");
}

export async function portalLogOutAction() {
  await portalLogOut();
  redirect("/portal/login");
}
