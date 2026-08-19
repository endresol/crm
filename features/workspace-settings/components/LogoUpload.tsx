"use client";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { removeWorkspaceLogoAction, uploadWorkspaceLogoAction } from "../actions";

export function LogoUpload({
  workspaceName,
  logoUrl,
  accept,
}: {
  workspaceName: string;
  logoUrl: string | null;
  accept: string;
}) {
  return (
    <ImageUpload
      name="logo"
      currentUrl={logoUrl}
      alt={workspaceName}
      shape="square"
      accept={accept}
      uploadAction={uploadWorkspaceLogoAction}
      removeAction={removeWorkspaceLogoAction}
      helpText="PNG, JPEG, WebP or SVG. Max 2MB. Shown in the sidebar."
    />
  );
}
