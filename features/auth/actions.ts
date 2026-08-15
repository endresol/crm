"use server";

import { redirect } from "next/navigation";
import { AuthError, logIn, logOut, signUp } from "./service";
import { logInSchema, signUpSchema } from "./schemas";

export type AuthActionState = {
  error?: string;
};

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    workspaceName: formData.get("workspaceName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await signUp(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  redirect("/admin/dashboard");
}

export async function logInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = logInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await logIn(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    throw error;
  }

  redirect("/admin/dashboard");
}

export async function logOutAction() {
  await logOut();
  redirect("/login");
}
