import { z } from "zod";

export const calendarEventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(160),
    startAt: z.string().trim().min(1, "Start date & time is required."),
    endAt: z.string().trim().min(1, "End date & time is required."),
  })
  .refine((data) => new Date(data.endAt) >= new Date(data.startAt), {
    message: "End must be on or after start.",
    path: ["endAt"],
  });

export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
