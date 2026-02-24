import path from "path";
import fs from "fs";
import { LRUCache } from "lru-cache";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads"); // root uploads folder
const MENU_ITEMS_ROOT = path.join(UPLOAD_ROOT, "menu-items"); // uploads/menu-items

// Ensure directories exist
fs.mkdirSync(MENU_ITEMS_ROOT, { recursive: true });

const imageCache = new LRUCache<string, Buffer>({
  max: 200,
  maxSize: 100 * 1024 * 1024,
  sizeCalculation: (buffer) => buffer.length,
  ttl: 1000 * 60 * 60, // 1 hour
});

export function generateImageFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName) || ".jpg";
  // keep the same format your app expects
  return `menu-items/${timestamp}-${random}${ext}`;
}

export function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
  };
  return contentTypes[ext] || "image/jpeg";
}

/**
 * NEW: upload to local filesystem.
 * Keep the return shape consistent with your prior style.
 */
export async function uploadImage(
  filename: string,
  buffer: Buffer
): Promise<{ ok: boolean; error?: any }> {
  try {
    // filename is like "menu-items/xxx.jpg"
    const filePath = path.join(UPLOAD_ROOT, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);

    // warm cache
    imageCache.set(filename, buffer);
    console.log("[LocalStorage] Saved:", filename, `(${buffer.length} bytes)`);

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function getCachedImage(
  filename: string
): Promise<{ ok: boolean; buffer?: Buffer; error?: any }> {
  const cached = imageCache.get(filename);
  if (cached) {
    console.log("[Cache] HIT for:", filename);
    return { ok: true, buffer: cached };
  }

  try {
    console.log("[Cache] MISS for:", filename, "- reading from disk");
    const filePath = path.join(UPLOAD_ROOT, filename); // uploads/<filename>
    const buffer = fs.readFileSync(filePath);

    imageCache.set(filename, buffer);
    console.log("[Cache] Stored:", filename, `(${buffer.length} bytes)`);

    return { ok: true, buffer };
  } catch (error) {
    return { ok: false, error };
  }
}