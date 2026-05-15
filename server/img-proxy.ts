import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function resolveLocalPath(src: string): string | null {
  // Block anything that looks external
  if (/^https?:\/\//i.test(src)) return null;

  // Normalize: remove leading slashes, block path traversal
  const clean = src.replace(/^\/+/, "").replace(/\.\.(\/|\\|$)/g, "");

  // Route 1: /api/storage/menu-items/<filename> → Render Disk
  const storagePrefix = "api/storage/menu-items/";
  if (clean.startsWith(storagePrefix)) {
    const filename = path.basename(clean); // extra safety
    const UPLOAD_ROOT =
      process.env.UPLOAD_ROOT || path.join(process.cwd(), "uploads");
    return path.join(UPLOAD_ROOT, "menu-items", filename);
  }

  // Route 2: everything else → public/ directory
  return path.join(process.cwd(), "public", clean);
}

export default function imgProxy() {
  return (req: Request, res: Response) => {
    try {
      const src = req.query.src as string;

      if (!src || typeof src !== "string") {
        return res.status(400).send("Missing src");
      }

      const filePath = resolveLocalPath(src);

      if (!filePath) {
        return res.status(403).send("External URLs not allowed");
      }

      if (!fs.existsSync(filePath)) {
        console.warn("[IMG PROXY] Not found:", filePath);
        return res.status(404).send("Not found");
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      // Stream directly — no sharp, no buffering, no memory spike
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      console.error("[IMG PROXY] Error:", err);
      if (!res.headersSent) res.status(500).send("Error");
    }
  };
}
