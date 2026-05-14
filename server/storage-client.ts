import path from "path";
import fs from "fs";

const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT || path.join(process.cwd(), "uploads"); // root render disk space, fall back uploads folder
const MENU_ITEMS_ROOT = path.join(UPLOAD_ROOT, "menu-items"); // uploads/menu-items

// Ensure directories exist
fs.mkdirSync(MENU_ITEMS_ROOT, { recursive: true });

export function generateImageFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const baseName = path.basename(originalName, path.extname(originalName));
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `menu-items/${safeBaseName}-${timestamp}-${random}.webp`;
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

export async function uploadImage(
  filename: string,
  buffer: Buffer,
): Promise<{ ok: boolean; error?: any }> {
  try {
    // filename is like "menu-items/xxx.jpg"
    const filePath = path.join(UPLOAD_ROOT, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);

    console.log("[LocalStorage] Saved:", filename, `(${buffer.length} bytes)`);

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function getCachedImage(
  filename: string,
): Promise<{ ok: boolean; buffer?: Buffer; error?: any }> {
  try {
    const filePath = path.join(UPLOAD_ROOT, filename); // uploads/<filename>
    const buffer = fs.readFileSync(filePath);

    return { ok: true, buffer };
  } catch (error) {
    return { ok: false, error };
  }
}
