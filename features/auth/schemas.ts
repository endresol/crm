import { z } from "zod";

export const signUpSchema = z.object({
  workspaceName: z.string().trim().min(2, "Tell us what to call your workspace.").max(80),
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const logInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
