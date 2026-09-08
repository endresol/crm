"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { PlusIcon } from "@/components/ui/icons";
import { LogTimeForm, type ClientForLogging } from "./LogTimeForm";
import { StartPomodoroForm } from "./StartPomodoroForm";
import styles from "./LogTimeButton.module.css";

type Mode = "log" | "pomodoro";

export function LogTimeButton({
  clients,
  fixedClientId,
  fixedProjectId,
  label = "Log time",
}: {
  clients: ClientForLogging[];
  fixedClientId?: string;
  fixedProjectId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("log");

  function close() {
    setOpen(false);
    setMode("log");
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon width={16} height={16} />
        {label}
      </Button>
      <Drawer open={open} onClose={close} title={mode === "log" ? "Log time" : "Start a Pomodoro timer"}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={[styles.tab, mode === "log" ? styles.tabActive : ""].join(" ")}
            onClick={() => setMode("log")}
          >
            Log time
          </button>
          <button
            type="button"
            className={[styles.tab, mode === "pomodoro" ? styles.tabActive : ""].join(" ")}
            onClick={() => setMode("pomodoro")}
          >
            Start Pomodoro
          </button>
        </div>

        {mode === "log" ? (
          <LogTimeForm
            clients={clients}
            fixedClientId={fixedClientId}
            fixedProjectId={fixedProjectId}
            onSaved={close}
            onCancel={close}
          />
        ) : (
          <StartPomodoroForm
            clients={clients}
            fixedClientId={fixedClientId}
            fixedProjectId={fixedProjectId}
            onSaved={close}
            onCancel={close}
          />
        )}
      </Drawer>
    </>
  );
}
