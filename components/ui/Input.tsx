import { type InputHTMLAttributes, forwardRef, useId } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  optional?: boolean;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, optional, error, helpText, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label} {optional && <span className={styles.optional}>(optional)</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[styles.input, error ? styles.hasError : "", className ?? ""]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error ? (
          <span className={styles.errorText}>{error}</span>
        ) : helpText ? (
          <span className={styles.helpText}>{helpText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
