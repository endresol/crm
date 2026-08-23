"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { createQuestionnaireAction } from "../actions";

export function AddQuestionnaireButton({
  clients,
  contacts,
  templates,
  fixedClientId,
  label = "Create Questionnaire",
}: {
  clients?: { id: string; name: string }[];
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string }[];
  fixedClientId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        {label}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Create questionnaire">
        <QuestionnaireForm
          action={createQuestionnaireAction}
          clients={clients}
          contacts={contacts}
          templates={templates}
          fixedClientId={fixedClientId}
          submitLabel="Create questionnaire"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
