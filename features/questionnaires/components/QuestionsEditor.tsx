"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { PlusIcon } from "@/components/ui/icons";
import {
  addQuestionAction,
  deleteQuestionAction,
  fillQuestionsFromTemplateAction,
  updateQuestionAction,
} from "../actions";
import { QuestionForm } from "./QuestionForm";
import type { QuestionnaireQuestion } from "@/generated/prisma/client";

function FillFromTemplateButton({ questionnaireId, templateName }: { questionnaireId: string; templateName: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(undefined);
          startTransition(async () => {
            const result = await fillQuestionsFromTemplateAction(questionnaireId);
            if (result.error) setError(result.error);
          });
        }}
      >
        {pending ? "Filling…" : `Fill from template (${templateName})`}
      </Button>
      {error && <span style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)" }}>{error}</span>}
    </div>
  );
}

export function QuestionsEditor({
  questionnaireId,
  questions,
  template,
}: {
  questionnaireId: string;
  questions: QuestionnaireQuestion[];
  template?: { name: string } | null;
}) {
  const [editing, setEditing] = useState<QuestionnaireQuestion | "new" | null>(null);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-3)",
        }}
      >
        {template && questions.length === 0 ? (
          <FillFromTemplateButton questionnaireId={questionnaireId} templateName={template.name} />
        ) : (
          <span />
        )}
        <Button size="sm" onClick={() => setEditing("new")}>
          <PlusIcon width={14} height={14} />
          Add question
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <TableEmptyState
              colSpan={2}
              title="No questions yet"
              description="Add a question, or fill the list from a template."
            />
          ) : (
            questions.map((question) => (
              <TableRow key={question.id} onClick={() => setEditing(question)}>
                <td style={{ fontWeight: 600 }}>{question.prompt}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{question.answer || "—"}</td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add question" : "Edit question"}
      >
        {editing === "new" ? (
          <QuestionForm
            action={addQuestionAction.bind(null, questionnaireId)}
            submitLabel="Add question"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <QuestionForm
            action={updateQuestionAction.bind(null, editing.id, questionnaireId)}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteQuestionAction(editing.id, questionnaireId);
                  setEditing(null);
                }}
              >
                <Button type="submit" variant="danger" size="sm">
                  Delete
                </Button>
              </form>
            }
          />
        ) : null}
      </Drawer>
    </div>
  );
}
