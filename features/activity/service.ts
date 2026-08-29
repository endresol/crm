import "server-only";

import { prisma } from "@/lib/prisma";
import type { ActivityEntityTypeValue } from "./constants";

export type RecordActivityInput = {
  workspaceId: string;
  entityType: ActivityEntityTypeValue;
  /** The entire predicate, object included — "created Client Acme Corp",
   * "moved Deal Website Redesign to Closed Won" — composed by the call site
   * (see statusChangeAction for the status-change shape). The feed renders
   * exactly "{actorName} {action}". See the schema comment on ActivityLog
   * for why this isn't a separate verb + entityLabel pair. */
  action: string;
  /** Where the record this entry is about links to, or null/undefined when
   * there's nowhere sensible to send the reader (e.g. a deleted record). */
  url?: string | null;
  /** Null for a portal Contact or an anonymous booking-page guest — actorName
   * is always set (it's the display string), this is just the FK. */
  actorUserId?: string | null;
  actorName: string;
};

/** Appends one row to the workspace's activity feed. Callers await this
 * before any redirect() in the same action, same as every other mutation,
 * so the entry is guaranteed written before the response ends. */
export function recordActivity(input: RecordActivityInput) {
  return prisma.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      entityType: input.entityType,
      action: input.action,
      url: input.url ?? null,
      actorUserId: input.actorUserId ?? null,
      actorName: input.actorName,
    },
  });
}

export function listActivity(
  workspaceId: string,
  { entityType, take = 100 }: { entityType?: ActivityEntityTypeValue; take?: number } = {},
) {
  return prisma.activityLog.findMany({
    where: { workspaceId, ...(entityType ? { entityType } : {}) },
    orderBy: { createdAt: "desc" },
    take,
  });
}

/**
 * Builds the full "{verb} {entityLabel} {preposition} {statusLabel}" action
 * string for a status/stage change — e.g. `statusChangeAction("DRAFT",
 * "PAID", "Invoice Website Retainer", INVOICE_STATUS_LABELS)` →
 * "marked Invoice Website Retainer as Paid". Returns null when
 * prevStatus/nextStatus are the same (a save that didn't touch status) — the
 * caller falls back to a plain "updated {entityLabel}" in that case.
 * `verb`/`preposition` default to Invoice/Proposal/Contract/Questionnaire's
 * vocabulary ("marked … as …"); Deal's stage reads better as "moved … to …",
 * so that call site overrides both.
 */
export function statusChangeAction(
  prevStatus: string,
  nextStatus: string,
  entityLabel: string,
  labels: Record<string, string>,
  { verb = "marked", preposition = "as" }: { verb?: string; preposition?: string } = {},
): string | null {
  if (prevStatus === nextStatus) return null;
  return `${verb} ${entityLabel} ${preposition} ${labels[nextStatus] ?? nextStatus}`;
}
