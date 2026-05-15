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
  // Allow same-origin absolute URLs by converting them to local paths.
  // Example:
  // https://menu.chez-beyrouth.com/images/hero.jpg
  // becomes:
  // /images/hero.jpg
  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src);
      return resolveLocalPath(url.pathname + url.search);
    } catch {
      return null;
    }
  }

  // Strip query params before resolving path.
  const srcPath = src.split("?")[0];
  const clean = srcPath.replace(/^\/+/, "").replace(/\.\.(\/|\\|$)/g, "");

  if (clean.startsWith("api/storage/menu-items/")) {
    const filename = path.basename(clean);
    const UPLOAD_ROOT =
      process.env.UPLOAD_ROOT || path.join(process.cwd(), "uploads");
    return path.join(UPLOAD_ROOT, "menu-items", filename);
  }

  const publicPath = path.join(process.cwd(), "public", clean);
  if (fs.existsSync(publicPath)) return publicPath;

  const distPath = path.join(process.cwd(), "dist", "public", clean);
  if (fs.existsSync(distPath)) return distPath;

  return publicPath;
}

export default function imgProxy() {
  return (req: Request, res: Response) => {
    try {
      const src = req.query.src as string;

      if (!src || typeof src !== "string") {
        return res.status(400).send("Missing src");
      }

      const filePath = resolveLocalPath(src);
      if (!filePath) return res.status(403).send("Forbidden");

      if (!fs.existsSync(filePath)) {
        console.warn("[IMG PROXY] Not found:", filePath);
        return res.status(404).send("Not found");
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      // *** FIX FOR ISSUE 3 (very slow image loading): use sendFile instead of createReadStream ***
      // sendFile handles ETags, 304 Not Modified, and range requests automatically.
      // This means repeat visits serve from browser cache with a single 304 round-trip
      // instead of re-streaming the full file every time.
      res.sendFile(filePath, { root: "/" }, (err) => {
        if (err && !res.headersSent) {
          console.error("[IMG PROXY] sendFile error:", err);
          res.status(500).send("Error serving file");
        }
      });
    } catch (err) {
      console.error("[IMG PROXY] Error:", err);
      if (!res.headersSent) res.status(500).send("Error");
    }
  };
}
