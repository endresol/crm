import "server-only";

import { prisma } from "@/lib/prisma";
import { substituteMergeFields } from "@/features/document-templates/mergeFields";
import type { QuestionnaireInput, QuestionnaireQuestionInput } from "./schemas";

const withRelations = {
  client: { select: { id: true, name: true, email: true } },
  contact: { select: { id: true, fullName: true } },
  // Just `answer` (not `prompt`) — enough to compute "3 of 5 answered" (see
  // questionnaireProgress in constants.ts) on a list view without pulling in
  // every question's full text.
  questions: { select: { answer: true } },
} as const;

export function listQuestionnaires(workspaceId: string) {
  return prisma.questionnaire.findMany({
    where: { workspaceId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function listQuestionnairesForClient(workspaceId: string, clientId: string) {
  return prisma.questionnaire.findMany({
    where: { workspaceId, clientId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
  });
}

export function getQuestionnaire(workspaceId: string, questionnaireId: string) {
  return prisma.questionnaire.findFirst({
    where: { id: questionnaireId, workspaceId },
    include: {
      ...withRelations,
      template: { select: { id: true, name: true, content: true } },
      questions: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
    },
  });
}

function toData(input: QuestionnaireInput) {
  return {
    clientId: input.clientId,
    contactId: input.contactId ?? null,
    templateId: input.templateId ?? null,
    name: input.name,
    status: input.status,
  };
}

export function createQuestionnaire(workspaceId: string, input: QuestionnaireInput) {
  return prisma.questionnaire.create({
    data: { workspaceId, ...toData(input) },
  });
}

/** Returns the pre-update status (for the activity log's "marked as X" vs.
 * plain "updated" phrasing — see statusChangeAction) or null if not found. */
export async function updateQuestionnaire(
  workspaceId: string,
  questionnaireId: string,
  input: QuestionnaireInput,
) {
  const before = await prisma.questionnaire.findFirst({
    where: { id: questionnaireId, workspaceId },
    select: { status: true },
  });
  if (!before) return null;

  await prisma.questionnaire.update({ where: { id: questionnaireId }, data: toData(input) });
  return { previousStatus: before.status };
}

/** Returns the deleted row (just enough to label an activity log entry) so
 * the caller doesn't need a separate lookup before deleting. */
export async function deleteQuestionnaire(workspaceId: string, questionnaireId: string) {
  const questionnaire = await prisma.questionnaire.findFirst({
    where: { id: questionnaireId, workspaceId },
    select: { id: true, name: true },
  });
  if (!questionnaire) return null;

  await prisma.questionnaire.delete({ where: { id: questionnaireId } });
  return questionnaire;
}

export async function addQuestion(
  workspaceId: string,
  questionnaireId: string,
  input: QuestionnaireQuestionInput,
) {
  const position = await prisma.questionnaireQuestion.count({ where: { questionnaireId } });
  return prisma.questionnaireQuestion.create({
    data: { workspaceId, questionnaireId, position, ...input },
  });
}

export async function updateQuestion(
  workspaceId: string,
  questionId: string,
  input: QuestionnaireQuestionInput,
) {
  const { count } = await prisma.questionnaireQuestion.updateMany({
    where: { id: questionId, workspaceId },
    data: input,
  });
  return count > 0;
}

export async function deleteQuestion(workspaceId: string, questionId: string) {
  const { count } = await prisma.questionnaireQuestion.deleteMany({
    where: { id: questionId, workspaceId },
  });
  return count > 0;
}

/**
 * Seeds the question list from the questionnaire's template — one line of
 * `DocumentTemplate.content` per question, merge-substituted against the
 * questionnaire's Client/Workspace. Only runs against an empty question
 * list: this is a bulk insert, not a merge, so there's no sane way to
 * reconcile it with edits already made — see the schema comment on
 * QuestionnaireQuestion for why `position` (not createdAt) orders the result.
 */
export async function fillQuestionsFromTemplate(
  workspaceId: string,
  questionnaireId: string,
  workspaceName: string,
) {
  const questionnaire = await prisma.questionnaire.findFirst({
    where: { id: questionnaireId, workspaceId },
    include: {
      client: { select: { name: true, email: true } },
      template: { select: { content: true } },
      _count: { select: { questions: true } },
    },
  });
  if (!questionnaire) return { ok: false as const, reason: "That questionnaire no longer exists." };
  if (!questionnaire.template) return { ok: false as const, reason: "This questionnaire has no template." };
  if (questionnaire._count.questions > 0) {
    return { ok: false as const, reason: "Remove the existing questions before filling from a template." };
  }

  const prompts = questionnaire.template.content
    .split("\n")
    .map((line) =>
      substituteMergeFields(line, {
        client: questionnaire.client,
        workspace: { name: workspaceName },
        today: new Date().toLocaleDateString("en-US"),
      }).trim(),
    )
    .filter(Boolean);

  if (prompts.length === 0) {
    return { ok: false as const, reason: "That template has no questions in it." };
  }

  await prisma.questionnaireQuestion.createMany({
    data: prompts.map((prompt, position) => ({
      workspaceId,
      questionnaireId,
      prompt,
      position,
    })),
  });
  return { ok: true as const };
}

// --- Client Portal (roadmap #20) reads/writes below. Scoped by clientId (the
// logged-in Contact's own, trusted from their session) rather than
// workspaceId + an admin session — a Contact never has one of those. Shown
// to the Contact regardless of which specific Contact a Questionnaire is
// assigned to (`contactId` is nullable and not filtered on): a Client's
// contacts are trusted to share visibility into that Client's own
// questionnaires, same as they already share visibility into its Projects.

export function listQuestionnairesForContact(workspaceId: string, clientId: string) {
  return listQuestionnairesForClient(workspaceId, clientId);
}

export async function getQuestionnaireForContact(
  workspaceId: string,
  clientId: string,
  questionnaireId: string,
) {
  const questionnaire = await getQuestionnaire(workspaceId, questionnaireId);
  if (!questionnaire || questionnaire.clientId !== clientId) return null;
  return questionnaire;
}

/** `answer: null` clears it — see schemas.ts's portalAnswerSchema for why. */
export async function answerQuestion(clientId: string, questionId: string, answer: string | null) {
  const question = await prisma.questionnaireQuestion.findFirst({
    where: { id: questionId },
    select: { questionnaire: { select: { clientId: true } } },
  });
  if (!question || question.questionnaire.clientId !== clientId) return false;

  await prisma.questionnaireQuestion.update({ where: { id: questionId }, data: { answer } });
  return true;
}

/** Returns the questionnaire (workspaceId + name, for the activity log entry
 * this submission triggers) or null if it doesn't belong to this Client. */
export async function markQuestionnaireCompleted(clientId: string, questionnaireId: string) {
  const questionnaire = await prisma.questionnaire.findFirst({
    where: { id: questionnaireId, clientId },
    select: { id: true, workspaceId: true, name: true },
  });
  if (!questionnaire) return null;

  await prisma.questionnaire.update({ where: { id: questionnaireId }, data: { status: "COMPLETED" } });
  return questionnaire;
}
