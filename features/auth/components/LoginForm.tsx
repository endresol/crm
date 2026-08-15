"use client";

import { useActionState } from "react";
import { logInAction, type AuthActionState } from "../actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "@/components/layout/AuthLayout.module.css";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logInAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error && <div className={styles.error}>{state.error}</div>}
      <Input name="email" type="email" label="Email" placeholder="jane@acme.com" required />
      <Input name="password" type="password" label="Password" placeholder="••••••••" required />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
