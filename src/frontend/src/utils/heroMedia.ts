/**
 * Resolution of the hero background media.
 *
 * The admin panel stores a single string for the hero slot. It may be a data
 * URL from an uploaded image, a blob-storage URL for an uploaded video, or
 * empty when the slot has been reset. This decides what element the hero
 * should render for a given value.
 */

/** Shipped default: the looping brand film, used whenever the slot is empty. */
export const DEFAULT_HERO_VIDEO =
  "https://file.garden/aoCNkzJZYxDjRiWz/Overflow%20of%20Joe/Overflow%20of%20Jo%20Hero%20(1).mp4";

/** Still shown under the video while it buffers, and behind older browsers. */
export const DEFAULT_HERO_POSTER = "/assets/generated/hero-bg.dim_1440x900.png";

export type HeroMediaKind = "video" | "image";

export interface HeroMedia {
  kind: HeroMediaKind;
  src: string;
  /** True when nothing is saved and we fell back to the brand film. */
  isDefault: boolean;
}

const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i;

/**
 * Marker appended to stored video URLs.
 *
 * Blob storage hands back extensionless URLs (`/blob/?blob_hash=…`), so an
 * uploaded video is indistinguishable from an uploaded image by its address
 * alone. A fragment is never sent to the server and is ignored by the media
 * element, which makes it a safe place to record the type.
 */
export const VIDEO_MARKER = "#video";

/** Tags a stored URL as video, so it round-trips through the backend. */
export function markAsVideo(url: string): string {
  return isVideoSource(url) ? url : `${url}${VIDEO_MARKER}`;
}

/** True when `value` points at video rather than a still image. */
export function isVideoSource(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.startsWith("data:video/") ||
    trimmed.endsWith(VIDEO_MARKER) ||
    VIDEO_EXTENSION.test(trimmed)
  );
}

export function resolveHeroMedia(saved: string | null | undefined): HeroMedia {
  const value = saved?.trim();
  if (!value) {
    return { kind: "video", src: DEFAULT_HERO_VIDEO, isDefault: true };
  }
  return {
    kind: isVideoSource(value) ? "video" : "image",
    src: value,
    isDefault: false,
  };
}
