"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Copies the full booking URL, built from window.location.origin at click
 * time rather than a stored/env base URL — works the same in local dev,
 * previews, and prod without needing a NEXT_PUBLIC_APP_URL to keep in sync. */
export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${path}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied!" : "Copy link"}
    </Button>
  );
}
