import { z } from "zod";
import { QUESTIONNAIRE_STATUSES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined));

const optionalId = optionalText(120);

export const questionnaireSchema = z.object({
  clientId: z.string().trim().min(1, "Select a client."),
  contactId: optionalId,
  templateId: optionalId,
  name: z.string().trim().min(1, "Questionnaire name is required.").max(160),
  status: z.enum(QUESTIONNAIRE_STATUSES).default("DRAFT"),
});

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;

export const questionnaireQuestionSchema = z.object({
  prompt: z.string().trim().min(1, "Question is required.").max(500),
  answer: optionalText(5000),
});

export type QuestionnaireQuestionInput = z.infer<typeof questionnaireQuestionSchema>;
