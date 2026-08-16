"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Table, TableEmptyState, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { PlusIcon } from "@/components/ui/icons";
import { formatCurrency, formatDate } from "@/lib/format";
import { createDealAction, deleteDealAction, updateDealAction } from "../actions";
import {
  DEAL_PRIORITY_LABELS,
  DEAL_STAGE_BADGE_VARIANT,
  DEAL_STAGE_LABELS,
} from "../constants";
import { DealForm } from "./DealForm";
import { DealBoard } from "./DealBoard";
import styles from "./DealsPanel.module.css";
import type { Deal } from "@/generated/prisma/client";

type DealWithRelations = Deal & {
  client: { id: string; name: string };
  contact: { id: string; fullName: string } | null;
};

type View = "table" | "board";

export function DealsPanel({
  deals,
  clients,
  contacts,
  fixedClientId,
}: {
  deals: DealWithRelations[];
  clients?: { id: string; name: string }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  fixedClientId?: string;
}) {
  const [view, setView] = useState<View>("table");
  const [editing, setEditing] = useState<DealWithRelations | "new" | null>(null);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={[styles.tab, view === "table" ? styles.tabActive : ""].join(" ")}
            onClick={() => setView("table")}
          >
            Table
          </button>
          <button
            type="button"
            className={[styles.tab, view === "board" ? styles.tabActive : ""].join(" ")}
            onClick={() => setView("board")}
          >
            Board
          </button>
        </div>
        <Button onClick={() => setEditing("new")}>
          <PlusIcon width={16} height={16} />
          New deal
        </Button>
      </div>

      {deals.length === 0 ? (
        <Table>
          <thead>
            <tr>
              <th>Deal</th>
            </tr>
          </thead>
          <tbody>
            <TableEmptyState
              colSpan={1}
              title="No deals yet"
              description="Add a deal to start tracking a sales opportunity."
            />
          </tbody>
        </Table>
      ) : view === "board" ? (
        <DealBoard deals={deals} onDealClick={setEditing} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Deal</th>
              <th>Amount</th>
              <th>Stage</th>
              <th>Priority</th>
              {!fixedClientId && <th>Client</th>}
              <th>Contact</th>
              <th>Expected close</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditing(deal)}
                    style={{ fontWeight: 600, color: "var(--color-text)" }}
                  >
                    {deal.name}
                  </button>
                </td>
                <td>{formatCurrency(deal.amount, deal.currency)}</td>
                <td>
                  <Badge variant={DEAL_STAGE_BADGE_VARIANT[deal.stage]}>
                    {DEAL_STAGE_LABELS[deal.stage]}
                  </Badge>
                </td>
                <td>{DEAL_PRIORITY_LABELS[deal.priority]}</td>
                {!fixedClientId && (
                  <td>
                    <Link
                      href={`/admin/clients/${deal.client.id}`}
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {deal.client.name}
                    </Link>
                  </td>
                )}
                <td>{deal.contact?.fullName || "—"}</td>
                <td>{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "—"}</td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New deal" : "Edit deal"}
      >
        {editing === "new" ? (
          <DealForm
            action={createDealAction}
            clients={clients}
            contacts={contacts}
            fixedClientId={fixedClientId}
            submitLabel="Create deal"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : editing ? (
          <DealForm
            action={updateDealAction.bind(null, editing.id)}
            clients={clients}
            contacts={contacts}
            fixedClientId={fixedClientId ?? editing.clientId}
            defaultValues={editing}
            submitLabel="Save changes"
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            footerExtra={
              <form
                action={async () => {
                  await deleteDealAction(editing.id, editing.clientId);
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
