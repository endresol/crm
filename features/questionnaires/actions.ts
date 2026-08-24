"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { questionnaireQuestionSchema, questionnaireSchema } from "./schemas";
import {
  addQuestion,
  createQuestionnaire,
  deleteQuestion,
  deleteQuestionnaire,
  fillQuestionsFromTemplate,
  updateQuestion,
  updateQuestionnaire,
} from "./service";

export type QuestionnaireActionState = {
  error?: string;
};

export type QuestionActionState = {
  error?: string;
  success?: boolean;
};

function parseQuestionnaireForm(formData: FormData) {
  return questionnaireSchema.safeParse({
    clientId: formData.get("clientId"),
    contactId: formData.get("contactId"),
    // See the comment on this same line in features/invoices/actions.ts.
    templateId: formData.get("templateId") ?? "",
    name: formData.get("name"),
    status: formData.get("status") || "DRAFT",
  });
}

export async function createQuestionnaireAction(
  _prevState: QuestionnaireActionState,
  formData: FormData,
): Promise<QuestionnaireActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseQuestionnaireForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const questionnaire = await createQuestionnaire(user.workspaceId, parsed.data);
  revalidatePath("/admin/questionnaires");
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/questionnaires/${questionnaire.id}`);
}

export async function updateQuestionnaireAction(
  questionnaireId: string,
  _prevState: QuestionnaireActionState,
  formData: FormData,
): Promise<QuestionnaireActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseQuestionnaireForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateQuestionnaire(user.workspaceId, questionnaireId, parsed.data);
  if (!updated) {
    return { error: "That questionnaire no longer exists." };
  }

  revalidatePath("/admin/questionnaires");
  revalidatePath(`/admin/questionnaires/${questionnaireId}`);
  revalidatePath(`/admin/clients/${parsed.data.clientId}`);
  redirect(`/admin/questionnaires/${questionnaireId}`);
}

export async function deleteQuestionnaireAction(questionnaireId: string, clientId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteQuestionnaire(user.workspaceId, questionnaireId);
  revalidatePath("/admin/questionnaires");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/questionnaires");
}

function parseQuestionForm(formData: FormData) {
  return questionnaireQuestionSchema.safeParse({
    prompt: formData.get("prompt"),
    answer: formData.get("answer"),
  });
}

export async function addQuestionAction(
  questionnaireId: string,
  _prevState: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseQuestionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  await addQuestion(user.workspaceId, questionnaireId, parsed.data);
  revalidatePath(`/admin/questionnaires/${questionnaireId}`);
  return { success: true };
}

export async function updateQuestionAction(
  questionId: string,
  questionnaireId: string,
  _prevState: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = parseQuestionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const updated = await updateQuestion(user.workspaceId, questionId, parsed.data);
  if (!updated) {
    return { error: "That question no longer exists." };
  }

  revalidatePath(`/admin/questionnaires/${questionnaireId}`);
  return { success: true };
}

export async function deleteQuestionAction(questionId: string, questionnaireId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await deleteQuestion(user.workspaceId, questionId);
  revalidatePath(`/admin/questionnaires/${questionnaireId}`);
}

// Not a useActionState action — there's no form data involved, just a
// button click, so the caller drives it with useTransition instead.
export async function fillQuestionsFromTemplateAction(
  questionnaireId: string,
): Promise<QuestionActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await fillQuestionsFromTemplate(user.workspaceId, questionnaireId, user.workspaceName);
  if (!result.ok) return { error: result.reason };

  revalidatePath(`/admin/questionnaires/${questionnaireId}`);
  return { success: true };
}
