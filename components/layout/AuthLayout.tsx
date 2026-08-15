import { type ReactNode } from "react";
import styles from "./AuthLayout.module.css";

export function AuthLayout({
  heading,
  subheading,
  children,
  footer,
}: {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>CM</span>
          <span className={styles.logoText}>ClientManager</span>
        </div>
        <div className={styles.heading}>{heading}</div>
        <div className={styles.subheading}>{subheading}</div>
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
