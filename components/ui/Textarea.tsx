import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import styles from "./Input.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  optional?: boolean;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, optional, error, id, className, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label} {optional && <span className={styles.optional}>(optional)</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={[styles.input, error ? styles.hasError : "", className ?? ""]
            .filter(Boolean)
            .join(" ")}
          style={{ height: "auto", paddingTop: "var(--space-2)", paddingBottom: "var(--space-2)", resize: "vertical" }}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
