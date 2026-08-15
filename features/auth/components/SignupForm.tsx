"use client";

import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "../actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "@/components/layout/AuthLayout.module.css";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error && <div className={styles.error}>{state.error}</div>}
      <Input name="workspaceName" label="Workspace name" placeholder="Acme Agency" required />
      <Input name="name" label="Your name" placeholder="Jane Doe" required />
      <Input name="email" type="email" label="Email" placeholder="jane@acme.com" required />
      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="At least 8 characters"
        minLength={8}
        required
      />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Creating your workspace…" : "Create workspace"}
      </Button>
    </form>
  );
}
