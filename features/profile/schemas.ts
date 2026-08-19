import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** Changing your own password requires proving you know the current one —
 * a session cookie alone isn't enough, since an unattended logged-in browser
 * would otherwise be a full account takeover. */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
