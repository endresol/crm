import "server-only";

import { del, put } from "@vercel/blob";

/**
 * Image uploads (user avatars, workspace logos) backed by Vercel Blob.
 *
 * Blobs are stored with `access: "public"` deliberately: the URLs are meant to
 * be embedded in generated documents, transactional emails, and the future
 * Client Portal (roadmap #20), none of which can present a session cookie to
 * fetch a private asset. The URLs are unguessable (Blob appends a random
 * suffix), so they're unlisted rather than truly secret — don't put anything
 * confidential behind this helper.
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

/** Human-readable `accept` attribute for file inputs. */
export const IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(",");

export type UploadResult = { url: string } | { error: string };

/**
 * Validates and stores an uploaded image, returning its public URL.
 * `pathPrefix` scopes the blob (e.g. `avatars/<userId>`); Blob adds a random
 * suffix, so re-uploading never collides with — or silently overwrites — an
 * existing file, which is why callers must delete the old URL themselves.
 */
export async function uploadImage(file: File, pathPrefix: string): Promise<UploadResult> {
  if (file.size === 0) {
    return { error: "That file is empty." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Images must be 2MB or smaller." };
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return { error: "Use a PNG, JPEG, WebP, or SVG image." };
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const filename = extension ? `${pathPrefix}.${extension.toLowerCase()}` : pathPrefix;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return { url: blob.url };
  } catch {
    return { error: "Upload failed. Please try again." };
  }
}

/**
 * Best-effort delete of a previously uploaded blob. Never throws: a failed
 * cleanup should not fail the surrounding action, since the DB row has already
 * moved on to the new URL and the stale blob is only wasted storage.
 */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    await del(url);
  } catch {
    // Orphaned blob — acceptable, see above.
  }
}
