import { type ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "neutral" | "primary" | "success" | "danger" | "warning" | "info";

export function Badge({
  children,
  variant = "neutral",
  dot = false,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  return (
    <span className={[styles.badge, styles[variant]].join(" ")}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
