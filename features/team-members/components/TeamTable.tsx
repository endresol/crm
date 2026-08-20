"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableRow } from "@/components/ui/Table";
import { formatDate } from "@/lib/format";
import { deleteTeamMemberAction, updateTeamMemberRoleAction } from "../actions";
import { ROLE_LABELS } from "../constants";
import { TEAM_ROLES } from "../schemas";

type Member = { id: string; name: string; email: string; role: string; createdAt: Date | string };

export function TeamTable({
  members,
  currentUserId,
  dateFormat,
}: {
  members: Member[];
  currentUserId: string;
  dateFormat: string;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Joined</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            isSelf={member.id === currentUserId}
            dateFormat={dateFormat}
          />
        ))}
      </tbody>
    </Table>
  );
}

function MemberRow({
  member,
  isSelf,
  dateFormat,
}: {
  member: Member;
  isSelf: boolean;
  dateFormat: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleRoleChange(role: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateTeamMemberRoleAction(member.id, role);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTeamMemberAction(member.id);
      if (result.error) {
        setError(result.error);
        setConfirmingDelete(false);
      }
    });
  }

  return (
    <TableRow>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Avatar name={member.name} size="sm" />
          <span style={{ fontWeight: 600 }}>{member.name}</span>
          {isSelf && <Badge variant="neutral">You</Badge>}
        </div>
        {error && (
          <div style={{ color: "var(--color-danger)", fontSize: "var(--text-xs)", marginTop: "var(--space-1)" }}>
            {error}
          </div>
        )}
      </td>
      <td>{member.email}</td>
      <td>
        <select
          value={member.role}
          disabled={pending}
          onChange={(e) => handleRoleChange(e.target.value)}
          style={{
            fontSize: "var(--text-sm)",
            padding: "var(--space-1) var(--space-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
          }}
        >
          {TEAM_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </td>
      <td>{formatDate(member.createdAt, dateFormat)}</td>
      <td>
        {isSelf ? null : confirmingDelete ? (
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="danger" size="sm" disabled={pending} onClick={handleDelete}>
              {pending ? "Removing…" : "Confirm"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
            Remove
          </Button>
        )}
      </td>
    </TableRow>
  );
}
