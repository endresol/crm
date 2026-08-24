"use client";

import { useActionState } from "react";
import { portalLogInAction, type PortalAuthActionState } from "../actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "@/components/layout/AuthLayout.module.css";

const initialState: PortalAuthActionState = {};

export function PortalLoginForm() {
  const [state, formAction, pending] = useActionState(portalLogInAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.error && <div className={styles.error}>{state.error}</div>}
      <Input name="email" type="email" label="Email" placeholder="you@client.com" required />
      <Input name="password" type="password" label="Password" placeholder="••••••••" required />
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
