"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { logTimeAction, type TimeEntryActionState } from "../actions";

const initialState: TimeEntryActionState = {};

export type ClientForLogging = {
  id: string;
  name: string;
  projects: {
    id: string;
    name: string;
    tasks: { id: string; title: string }[];
  }[];
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function LogTimeForm({
  clients,
  fixedClientId,
  fixedProjectId,
  onSaved,
  onCancel,
}: {
  clients: ClientForLogging[];
  fixedClientId?: string;
  fixedProjectId?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(logTimeAction, initialState);
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const [projectId, setProjectId] = useState(fixedProjectId ?? "");

  useEffect(() => {
    if (state.success) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  const selectedClient = clients.find((client) => client.id === clientId);
  const projects = selectedClient?.projects ?? [];
  const selectedProject = projects.find((project) => project.id === projectId);
  const tasks = selectedProject?.tasks ?? [];

  return (
    <form action={formAction} style={{ display: "contents" }}>
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

      {fixedClientId ? (
        <input type="hidden" name="clientId" value={fixedClientId} />
      ) : (
        <Select
          name="clientId"
          label="Client"
          defaultValue=""
          required
          onChange={(event) => {
            setClientId(event.target.value);
            setProjectId("");
          }}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      )}

      {fixedProjectId ? (
        <input type="hidden" name="projectId" value={fixedProjectId} />
      ) : (
        <Select
          key={clientId}
          name="projectId"
          label="Project"
          optional
          defaultValue=""
          disabled={!clientId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">{clientId ? "No project" : "Select a client first…"}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      )}

      <Select key={projectId} name="taskId" label="Task" optional defaultValue="" disabled={!projectId}>
        <option value="">{projectId ? "No task" : "Select a project first…"}</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </Select>

      <Input name="date" type="date" label="Date" defaultValue={todayISO()} required />

      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <Input name="hours" type="number" label="Hours" min={0} defaultValue={0} />
        <Input name="minutes" type="number" label="Minutes" min={0} max={59} defaultValue={0} />
      </div>

      <Input name="description" label="Description" optional placeholder="What did you work on?" />

      <Checkbox name="billable" defaultChecked label="Billable" />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Logging…" : "Log time"}
        </Button>
      </div>
    </form>
  );
}
