"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { PlusIcon } from "@/components/ui/icons";
import { createTemplateAction, deleteTemplateAction, updateTemplateAction } from "../actions";
import { DOCUMENT_TEMPLATE_TYPES, DOCUMENT_TEMPLATE_TYPE_LABELS } from "../constants";
import type { DocumentTemplateTypeValue } from "../constants";
import { TemplateForm } from "./TemplateForm";
import styles from "./TemplatesPanel.module.css";
import type { DocumentTemplate } from "@/generated/prisma/client";

export function TemplatesPanel({ templates }: { templates: DocumentTemplate[] }) {
  const [activeType, setActiveType] = useState<DocumentTemplateTypeValue>("INVOICE");
  const [editing, setEditing] = useState<DocumentTemplate | "new" | null>(null);

  const visible = templates.filter((template) => template.type === activeType);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.tabs}>
          {DOCUMENT_TEMPLATE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={[styles.tab, activeType === type ? styles.tabActive : ""].join(" ")}
              onClick={() => setActiveType(type)}
            >
              {DOCUMENT_TEMPLATE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <Button onClick={() => setEditing("new")}>
          <PlusIcon width={16} height={16} />
          Create template
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <TableEmptyState
              colSpan={3}
              title="No Templates Found"
              description="Please create a new template."
            />
          ) : (
            visible.map((template) => (
              <TableRow key={template.id} onClick={() => setEditing(template)}>
                <td style={{ fontWeight: 600 }}>{template.name}</td>
                <td>{template.category || "—"}</td>
                <td>{template.description || "—"}</td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Create template" : "Edit template"}
      >
        {editing === "new" ? (
          <TemplateForm
            action={createTemplateAction}
            type={activeType}
            submitLabel="Create template"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <TemplateForm
            action={updateTemplateAction.bind(null, editing.id)}
            type={editing.type}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteTemplateAction(editing.id);
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
