"use client";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { removeClientLogoAction, uploadClientLogoAction } from "../actions";

export function ClientLogoUpload({
  clientId,
  clientName,
  logoUrl,
  accept,
}: {
  clientId: string;
  clientName: string;
  logoUrl: string | null;
  accept: string;
}) {
  return (
    <ImageUpload
      name="logo"
      currentUrl={logoUrl}
      alt={clientName}
      shape="circle"
      accept={accept}
      uploadAction={uploadClientLogoAction.bind(null, clientId)}
      removeAction={removeClientLogoAction.bind(null, clientId)}
      helpText="PNG, JPEG, WebP or SVG. Max 2MB."
    />
  );
}
