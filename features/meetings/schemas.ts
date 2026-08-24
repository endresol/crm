import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

export const meetingScheduleSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  description: optionalText(500),
  durationMinutes: z.coerce.number().int().min(5, "At least 5 minutes.").max(480),
  bufferMinutes: z.coerce.number().int().min(0).max(120),
  minNoticeHours: z.coerce.number().int().min(0).max(720),
  maxAdvanceDays: z.coerce.number().int().min(1, "At least 1 day.").max(365),
  active: z.coerce.boolean(),
});

export type MeetingScheduleInput = z.infer<typeof meetingScheduleSchema>;

const availabilityRuleSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startMinute: z.coerce.number().int().min(0).max(1439),
    endMinute: z.coerce.number().int().min(1).max(1440),
  })
  .refine((rule) => rule.endMinute > rule.startMinute, {
    message: "End time must be after start time.",
    path: ["endMinute"],
  });

// The editor manages rows as client-side state and submits the whole set as
// one JSON-encoded field, rather than N dynamically-named inputs — simpler
// to validate as a unit (and to fully replace, see setAvailabilityRules)
// than to reconcile a diff of added/removed/edited rows on the server.
export const availabilityRulesSchema = z.array(availabilityRuleSchema).max(50);

export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;

export const bookingSchema = z.object({
  bookerName: z.string().trim().min(1, "Name is required.").max(120),
  bookerEmail: z.string().trim().toLowerCase().email("Enter a valid email address."),
  startAt: z.string().trim().min(1, "Pick a time."),
  notes: optionalText(1000),
});

export type BookingInput = z.infer<typeof bookingSchema>;
