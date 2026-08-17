"use client";

import { useActionState, useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { substituteMergeFields } from "@/features/document-templates/mergeFields";
import { updateContractContentAction, type ContractContentActionState } from "../actions";
import type { Contract } from "@/generated/prisma/client";

const initialState: ContractContentActionState = {};

export function ContractEditor({
  contract,
  client,
  workspaceName,
  template,
}: {
  contract: Contract;
  client: { name: string; email?: string | null };
  workspaceName: string;
  template?: { name: string; content: string } | null;
}) {
  const boundAction = updateContractContentAction.bind(null, contract.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [content, setContent] = useState(contract.content);

  function fillFromTemplate() {
    if (!template) return;
    setContent(
      substituteMergeFields(template.content, {
        client,
        workspace: { name: workspaceName },
        today: new Date().toLocaleDateString("en-US"),
      }),
    );
  }

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-muted)" }}>
          Clauses &amp; terms
        </span>
        {template && (
          <Button type="button" variant="ghost" size="sm" onClick={fillFromTemplate}>
            Fill from template ({template.name})
          </Button>
        )}
      </div>

      <Textarea
        name="content"
        rows={24}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {state.success && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Saved</span>
        )}
      </div>
    </form>
  );
}
