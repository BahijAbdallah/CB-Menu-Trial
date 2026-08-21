export const DEFAULT_ITEM_IMAGE = "/Default.webp";

/**
 * Resolve an item's stored imageUrl to something an <img> can load.
 * Stored filenames may contain characters that need encoding; absolute URLs
 * pass through untouched. Items without an image get the bundled default.
 */
export function resolveItemImage(imageUrl: string | null | undefined): string {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return DEFAULT_ITEM_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("/")) {
    const parts = trimmed.split("/");
    const filename = encodeURIComponent(parts.pop()!);
    return [...parts, filename].join("/");
  }

  return trimmed;
}
