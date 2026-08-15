import { type ReactNode } from "react";
import styles from "./Table.module.css";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function TableRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr className={onClick ? styles.clickable : ""} onClick={onClick}>
      {children}
    </tr>
  );
}

export function TableEmptyState({
  colSpan,
  title,
  description,
  action,
}: {
  colSpan: number;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.empty}>
        <div className={styles.emptyTitle}>{title}</div>
        {description && <div>{description}</div>}
        {action && <div style={{ marginTop: "var(--space-5)" }}>{action}</div>}
      </td>
    </tr>
  );
}
