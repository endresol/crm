"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { DAY_LABELS } from "../constants";
import { setAvailabilityRulesAction, type RulesActionState } from "../actions";

type Rule = { dayOfWeek: number; startMinute: number; endMinute: number };

const initialState: RulesActionState = {};

function minuteToTimeInput(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function timeInputToMinute(value: string) {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function AvailabilityRulesEditor({
  scheduleId,
  initialRules,
  timezone,
}: {
  scheduleId: string;
  initialRules: Rule[];
  timezone: string;
}) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const boundAction = setAvailabilityRulesAction.bind(null, scheduleId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formId = useId();

  function addRule(dayOfWeek: number) {
    setRules((prev) => [...prev, { dayOfWeek, startMinute: 540, endMinute: 1020 }]);
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRule(index: number, patch: Partial<Rule>) {
    setRules((prev) => prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  }

  return (
    <div>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
        Weekly availability, in your workspace&apos;s timezone ({timezone}).
      </p>

      <form id={formId} action={formAction}>
        <input type="hidden" name="rules" value={JSON.stringify(rules)} />
      </form>

      {state.error && (
        <div
          style={{
            background: "var(--color-danger-soft)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            fontSize: "var(--text-sm)",
            marginBottom: "var(--space-4)",
          }}
        >
          {state.error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {DAY_LABELS.map((label, dayOfWeek) => {
          const dayRules = rules
            .map((rule, index) => ({ rule, index }))
            .filter(({ rule }) => rule.dayOfWeek === dayOfWeek);

          return (
            <div
              key={dayOfWeek}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-4)",
                paddingBottom: "var(--space-3)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div style={{ width: 100, fontWeight: 600, fontSize: "var(--text-sm)", paddingTop: "var(--space-2)" }}>
                {label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
                {dayRules.length === 0 && (
                  <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-sm)", paddingTop: "var(--space-2)" }}>
                    Unavailable
                  </span>
                )}
                {dayRules.map(({ rule, index }) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <input
                      type="time"
                      value={minuteToTimeInput(rule.startMinute)}
                      onChange={(e) => updateRule(index, { startMinute: timeInputToMinute(e.target.value) })}
                      style={{
                        padding: "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border-strong)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                      }}
                    />
                    <span style={{ color: "var(--color-text-muted)" }}>to</span>
                    <input
                      type="time"
                      value={minuteToTimeInput(rule.endMinute)}
                      onChange={(e) => updateRule(index, { endMinute: timeInputToMinute(e.target.value) })}
                      style={{
                        padding: "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border-strong)",
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                      }}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeRule(index)}>
                      <TrashIcon width={14} height={14} />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addRule(dayOfWeek)}>
                  <PlusIcon width={12} height={12} />
                  Add hours
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-5)" }}>
        <Button type="submit" form={formId} disabled={pending}>
          {pending ? "Saving…" : "Save availability"}
        </Button>
        {state.success && (
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Saved</span>
        )}
      </div>
    </div>
  );
}
