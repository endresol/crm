"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ProjectForm } from "./ProjectForm";
import { updateProjectAction } from "../actions";
import type { Project } from "@/generated/prisma/client";

export function EditProjectButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const boundAction = updateProjectAction.bind(null, project.id);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Edit project">
        <ProjectForm
          action={boundAction}
          fixedClientId={project.clientId}
          defaultValues={project}
          submitLabel="Save changes"
          onCancel={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
