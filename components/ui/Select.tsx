import { type ReactNode, type SelectHTMLAttributes, forwardRef, useId } from "react";
import styles from "./Input.module.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, optional, error, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label} {optional && <span className={styles.optional}>(optional)</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[styles.input, error ? styles.hasError : "", className ?? ""]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";
