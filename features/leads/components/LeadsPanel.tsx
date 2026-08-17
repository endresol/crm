"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { PlusIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/format";
import { createLeadAction, convertLeadAction, deleteLeadAction, updateLeadAction } from "../actions";
import { LEAD_STATUS_BADGE_VARIANT, LEAD_STATUS_LABELS } from "../constants";
import { LeadForm } from "./LeadForm";
import type { Lead } from "@/generated/prisma/client";

export function LeadsPanel({ leads }: { leads: Lead[] }) {
  const [editing, setEditing] = useState<Lead | "new" | null>(null);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "var(--space-4)",
        }}
      >
        <Button onClick={() => setEditing("new")}>
          <PlusIcon width={16} height={16} />
          Add lead
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Business</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Budget</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <TableEmptyState
              colSpan={7}
              title="No leads yet"
              description="Add a lead to start tracking a pre-client prospect."
            />
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditing(lead)}
                    style={{ fontWeight: 600, color: "var(--color-text)" }}
                  >
                    {lead.name}
                  </button>
                </td>
                <td>{lead.businessName || "—"}</td>
                <td>{lead.email || "—"}</td>
                <td>{lead.phone || "—"}</td>
                <td>{lead.budget != null ? formatCurrency(lead.budget) : "—"}</td>
                <td>{lead.source || "—"}</td>
                <td>
                  {lead.status === "CONVERTED" && lead.convertedClientId ? (
                    <Link href={`/admin/clients/${lead.convertedClientId}`}>
                      <Badge variant={LEAD_STATUS_BADGE_VARIANT[lead.status]}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </Badge>
                    </Link>
                  ) : (
                    <Badge variant={LEAD_STATUS_BADGE_VARIANT[lead.status]}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  )}
                </td>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add lead" : "Edit lead"}
      >
        {editing === "new" ? (
          <LeadForm
            action={createLeadAction}
            submitLabel="Add lead"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <LeadForm
            action={updateLeadAction.bind(null, editing.id)}
            defaultValues={editing}
            submitLabel="Save changes"
            showStatus
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <form
                  action={async () => {
                    await deleteLeadAction(editing.id);
                    setEditing(null);
                  }}
                >
                  <Button type="submit" variant="danger" size="sm">
                    Delete
                  </Button>
                </form>
                {editing.status !== "CONVERTED" && (
                  <form action={convertLeadAction.bind(null, editing.id)}>
                    <Button type="submit" variant="secondary" size="sm">
                      Convert to client
                    </Button>
                  </form>
                )}
              </div>
            }
          />
        ) : null}
      </Drawer>
    </div>
  );
}
