"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { PlusIcon } from "@/components/ui/icons";
import {
  createEmailTemplateAction,
  deleteEmailTemplateAction,
  updateEmailTemplateAction,
} from "../actions";
import { EMAIL_TEMPLATE_TYPES, EMAIL_TEMPLATE_TYPE_LABELS } from "../constants";
import type { EmailTemplateTypeValue } from "../constants";
import { EmailTemplateForm } from "./EmailTemplateForm";
import type { EmailTemplate } from "@/generated/prisma/client";

// Filtered by a Select rather than TemplatesPanel's tab bar — nine trigger
// types (vs. DocumentTemplate's four) don't fit a tab row.
export function EmailTemplatesPanel({ templates }: { templates: EmailTemplate[] }) {
  const [typeFilter, setTypeFilter] = useState<EmailTemplateTypeValue | "ALL">("ALL");
  const [editing, setEditing] = useState<EmailTemplate | "new" | null>(null);

  const visible =
    typeFilter === "ALL" ? templates : templates.filter((template) => template.type === typeFilter);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          marginBottom: "var(--space-4)",
        }}
      >
        <Select
          style={{ maxWidth: 220 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EmailTemplateTypeValue | "ALL")}
        >
          <option value="ALL">All triggers</option>
          {EMAIL_TEMPLATE_TYPES.map((type) => (
            <option key={type} value={type}>
              {EMAIL_TEMPLATE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Button onClick={() => setEditing("new")}>
          <PlusIcon width={16} height={16} />
          Create template
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Trigger</th>
            <th>Subject</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <TableEmptyState
              colSpan={3}
              title="No Email Templates Found"
              description="Please create a new template."
            />
          ) : (
            visible.map((template) => (
              <TableRow key={template.id} onClick={() => setEditing(template)}>
                <td style={{ fontWeight: 600 }}>{template.name}</td>
                <td>
                  <Badge variant="neutral">{EMAIL_TEMPLATE_TYPE_LABELS[template.type]}</Badge>
                </td>
                <td>{template.subject}</td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Create email template" : "Edit email template"}
      >
        {editing === "new" ? (
          <EmailTemplateForm
            action={createEmailTemplateAction}
            defaultValues={typeFilter !== "ALL" ? { type: typeFilter } : undefined}
            submitLabel="Create template"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <EmailTemplateForm
            action={updateEmailTemplateAction.bind(null, editing.id)}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteEmailTemplateAction(editing.id);
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
