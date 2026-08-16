import { type InputHTMLAttributes, forwardRef } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className={styles.wrapper}>
        <input
          ref={ref}
          type="checkbox"
          className={[styles.input, className ?? ""].filter(Boolean).join(" ")}
          {...props}
        />
        {label}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
