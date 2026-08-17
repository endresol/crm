import { z } from "zod";

export const TEAM_ROLES = ["MASTER_ADMIN", "MEMBER"] as const;

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
  role: z.enum(TEAM_ROLES).default("MEMBER"),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

export const roleUpdateSchema = z.object({
  role: z.enum(TEAM_ROLES),
});
