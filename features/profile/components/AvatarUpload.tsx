"use client";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { removeAvatarAction, uploadAvatarAction } from "../actions";

export function AvatarUpload({
  name,
  avatarUrl,
  accept,
}: {
  name: string;
  avatarUrl: string | null;
  accept: string;
}) {
  return (
    <ImageUpload
      name="avatar"
      currentUrl={avatarUrl}
      alt={name}
      shape="circle"
      accept={accept}
      uploadAction={uploadAvatarAction}
      removeAction={removeAvatarAction}
      helpText="PNG, JPEG, WebP or SVG. Max 2MB."
    />
  );
}
