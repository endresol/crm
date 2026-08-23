"use client";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { removeContactAvatarAction, uploadContactAvatarAction } from "../actions";

export function ContactAvatarUpload({
  contactId,
  contactName,
  avatarUrl,
  accept,
}: {
  contactId: string;
  contactName: string;
  avatarUrl: string | null;
  accept: string;
}) {
  return (
    <ImageUpload
      name="avatar"
      currentUrl={avatarUrl}
      alt={contactName}
      shape="circle"
      accept={accept}
      uploadAction={uploadContactAvatarAction.bind(null, contactId)}
      removeAction={removeContactAvatarAction.bind(null, contactId)}
      helpText="PNG, JPEG, WebP or SVG. Max 2MB."
    />
  );
}
