"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { saveAnswersAction, submitQuestionnaireAction, type PortalQuestionnaireActionState } from "../portal-actions";

const initialState: PortalQuestionnaireActionState = {};

export function PortalQuestionnaireForm({
  questionnaireId,
  questions,
  completed,
}: {
  questionnaireId: string;
  questions: { id: string; prompt: string; answer: string | null }[];
  completed: boolean;
}) {
  const boundAction = saveAnswersAction.bind(null, questionnaireId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    // Two sibling <form>s, not one nested inside the other (forms can't
    // nest) — Save answers posts every textarea in one shot; Submit
    // questionnaire is its own zero-field form right below it.
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {state.error && (
          <div
            style={{
              background: "var(--color-danger-soft)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-4)",
              fontSize: "var(--text-sm)",
            }}
          >
            {state.error}
          </div>
        )}

        {questions.map((question, index) => (
          <Textarea
            key={question.id}
            name={`answer-${question.id}`}
            label={`${index + 1}. ${question.prompt}`}
            defaultValue={question.answer ?? ""}
            disabled={completed}
            rows={3}
          />
        ))}

        {!completed && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Button type="submit" variant="secondary" disabled={pending}>
              {pending ? "Saving…" : "Save answers"}
            </Button>
            {state.success && (
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Saved</span>
            )}
          </div>
        )}
      </form>

      {!completed && (
        <form action={submitQuestionnaireAction.bind(null, questionnaireId)}>
          <Button type="submit">Submit questionnaire</Button>
        </form>
      )}
    </div>
  );
}
