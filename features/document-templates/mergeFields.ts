// Pure merge-field substitution — no imports, so both server actions and
// client-side live previews (e.g. InvoiceForm filling its notes field as you
// pick a client) can use the exact same logic without pulling in Prisma/pg.
// Kept intentionally small: only fields already available wherever a
// template gets applied (a Client + the Workspace), so substitution never
// needs a server round-trip.

export const MERGE_FIELD_TOKENS: { token: string; description: string }[] = [
  { token: "{{client.name}}", description: "The client's name" },
  { token: "{{client.email}}", description: "The client's email" },
  { token: "{{workspace.name}}", description: "Your workspace's name" },
  { token: "{{today}}", description: "Today's date" },
];

export type MergeFieldContext = {
  client?: { name?: string | null; email?: string | null };
  workspace?: { name?: string | null };
  today?: string;
};

export function substituteMergeFields(content: string, context: MergeFieldContext): string {
  return content
    .replaceAll("{{client.name}}", context.client?.name ?? "")
    .replaceAll("{{client.email}}", context.client?.email ?? "")
    .replaceAll("{{workspace.name}}", context.workspace?.name ?? "")
    .replaceAll("{{today}}", context.today ?? "");
}
