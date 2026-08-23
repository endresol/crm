"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { updateQuestionnaireAction } from "../actions";
import type { Questionnaire } from "@/generated/prisma/client";

export function EditQuestionnaireButton({
  questionnaire,
  contacts,
  templates,
}: {
  questionnaire: Questionnaire;
  contacts: { id: string; fullName: string; clientId: string }[];
  templates: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateQuestionnaireAction.bind(null, questionnaire.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit questionnaire">
        <QuestionnaireForm
          action={boundAction}
          fixedClientId={questionnaire.clientId}
          contacts={contacts}
          templates={templates}
          defaultValues={questionnaire}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
