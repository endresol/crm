import { z } from "zod";

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Enter a color as a 6-digit hex code, e.g. #732AFF.");

export const workspaceSettingsSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required.").max(120),
  timezone: z.string().trim().min(1).max(80),
  currency: z.string().trim().toUpperCase().min(3).max(3),
  dateFormat: z.string().trim().min(1).max(20),
  backgroundColor: hexColor,
  accentColor: hexColor,
});

export type WorkspaceSettingsInput = z.infer<typeof workspaceSettingsSchema>;
