"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import styles from "./ImageUpload.module.css";

type UploadState = { error?: string; success?: boolean };

/**
 * Shared "current image + replace + remove" control, used for both the user
 * avatar and the workspace logo. Submits on file selection rather than behind
 * a separate Save button — there's only one field, so an extra confirm step
 * would be friction with no upside.
 *
 * The preview is a local object URL shown immediately on selection, so the
 * swap feels instant instead of waiting on the round trip.
 */
export function ImageUpload({
  name,
  currentUrl,
  alt,
  shape = "circle",
  accept,
  uploadAction,
  removeAction,
  helpText,
}: {
  /** Form field name the action reads the File from. */
  name: string;
  currentUrl?: string | null;
  alt: string;
  shape?: "circle" | "square";
  accept: string;
  uploadAction: (prevState: UploadState, formData: FormData) => Promise<UploadState>;
  removeAction: () => Promise<void>;
  helpText?: string;
}) {
  const [state, formAction, pending] = useActionState(uploadAction, {} as UploadState);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Drop the local preview once the server has caught up — detected by
  // `currentUrl` arriving changed after revalidation. Adjusting state during
  // render (rather than in an effect) is React's documented pattern for state
  // derived from props, and avoids the extra commit an effect would cause.
  const [lastSeenUrl, setLastSeenUrl] = useState(currentUrl);
  if (currentUrl !== lastSeenUrl) {
    setLastSeenUrl(currentUrl);
    setPreview(null);
  }

  // Object URLs are a manually-managed resource: release each one when it's
  // replaced or the component goes away, or the blob is pinned for the
  // lifetime of the document.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Clear the file input after a successful upload so re-picking the same file
  // still fires onChange (a file input won't re-fire for an unchanged value).
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const shown = preview ?? currentUrl;

  return (
    <div className={styles.wrapper}>
      <form ref={formRef} action={formAction} className={styles.row}>
        <div className={[styles.frame, styles[shape]].join(" ")}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt={alt} className={styles.image} />
          ) : (
            <span className={styles.placeholder}>No image</span>
          )}
        </div>

        <div className={styles.controls}>
          <label className={styles.fileButton}>
            {pending ? "Uploading…" : shown ? "Replace image" : "Upload image"}
            <input
              type="file"
              name={name}
              accept={accept}
              className={styles.fileInput}
              disabled={pending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setPreview(URL.createObjectURL(file));
                formRef.current?.requestSubmit();
              }}
            />
          </label>
          {helpText && <span className={styles.helpText}>{helpText}</span>}
        </div>
      </form>

      {currentUrl && !pending && (
        <form action={removeAction}>
          <Button type="submit" variant="ghost" size="sm">
            Remove
          </Button>
        </form>
      )}

      {state.error && <div className={styles.error}>{state.error}</div>}
    </div>
  );
}
