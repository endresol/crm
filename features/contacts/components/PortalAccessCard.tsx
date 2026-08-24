"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  disablePortalAccessAction,
  setPortalPasswordAction,
  type ContactPortalActionState,
} from "../actions";

const initialState: ContactPortalActionState = {};

/**
 * Admin-side portal access control for a Contact (roadmap #20). The real
 * product emails an activation invite; this clone has no outbound email, so
 * the admin sets the initial (and any reset) password directly — same
 * trimming Contract applies to signatures. Setting a password doubles as
 * "enable" (there's no separate on/off flag — see the schema comment on
 * Contact.portalPasswordHash) and as "reset" (it just overwrites the hash).
 */
export function PortalAccessCard({
  contactId,
  hasPortalAccess,
  hasEmail,
}: {
  contactId: string;
  hasPortalAccess: boolean;
  hasEmail: boolean;
}) {
  const boundSetAction = setPortalPasswordAction.bind(null, contactId);
  const [state, formAction, pending] = useActionState(boundSetAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmingDisable, setConfirmingDisable] = useState(false);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Badge variant={hasPortalAccess ? "success" : "neutral"}>
          {hasPortalAccess ? "Portal access enabled" : "No portal access"}
        </Badge>
        {!hasEmail && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            Add an email address first.
          </span>
        )}
      </div>

      {hasEmail && (
        <form
          ref={formRef}
          action={formAction}
          style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-3)" }}
        >
          <Input
            name="password"
            type="password"
            label={hasPortalAccess ? "Reset password" : "Set a password"}
            autoComplete="new-password"
            helpText="At least 8 characters. The client signs in with this and their email."
            required
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : hasPortalAccess ? "Reset password" : "Enable portal access"}
          </Button>
        </form>
      )}
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
      {state.success && (
        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          {hasPortalAccess ? "Password updated." : "Portal access enabled."}
        </span>
      )}

      {hasPortalAccess && (
        <div>
          {!confirmingDisable ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmingDisable(true)}>
              Disable portal access
            </Button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Sign the client out and remove their login?
              </span>
              <form action={disablePortalAccessAction.bind(null, contactId)}>
                <Button type="submit" variant="danger" size="sm">
                  Yes, disable
                </Button>
              </form>
              <Button variant="secondary" size="sm" onClick={() => setConfirmingDisable(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
