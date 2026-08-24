"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentContact } from "@/lib/auth/portal-session";
import { portalAnswerSchema } from "./schemas";
import { answerQuestion, markQuestionnaireCompleted } from "./service";

export type PortalQuestionnaireActionState = {
  error?: string;
  success?: boolean;
};

// One <form> per questionnaire page covers every question at once — each
// textarea is named `answer-<questionId>`, so a single submit saves the
// whole page rather than round-tripping per question.
export async function saveAnswersAction(
  questionnaireId: string,
  _prevState: PortalQuestionnaireActionState,
  formData: FormData,
): Promise<PortalQuestionnaireActionState> {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("answer-")) continue;
    const questionId = key.slice("answer-".length);

    const parsed = portalAnswerSchema.safeParse({ answer: value });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Please check your answers and try again." };
    }
    await answerQuestion(contact.clientId, questionId, parsed.data.answer);
  }

  revalidatePath(`/portal/questionnaires/${questionnaireId}`);
  return { success: true };
}

export async function submitQuestionnaireAction(questionnaireId: string): Promise<void> {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");

  await markQuestionnaireCompleted(contact.clientId, questionnaireId);
  revalidatePath(`/portal/questionnaires/${questionnaireId}`);
  revalidatePath("/portal/questionnaires");
  revalidatePath("/portal/dashboard");
}
