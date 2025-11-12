import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { Request, Response, NextFunction } from "express";

export default function imageOptimizer({ root = "public" } = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only handle image requests
      if (!/\.(jpe?g|png)$/i.test(req.path)) {
        return next();
      }

      const abs = path.join(process.cwd(), root, req.path);
      if (!fs.existsSync(abs)) {
        return next();
      }

      // Advertise client hints (works over HTTPS)
      res.setHeader("Accept-CH", "DPR, Width");
      res.setHeader("Vary", "Accept, DPR, Width");

      // Detect format based on Accept header
      const accept = req.headers.accept || "";
      const fmt = accept.includes("image/avif") ? "avif" : "webp";
      const quality = fmt === "avif" ? 75 : 90;

      // Check if high-res is requested via query param
      const highResParam = Array.isArray(req.query.highres) ? req.query.highres[0] : req.query.highres;
      const highRes = highResParam === 'true';
      
      // For high-res images (modal), ALWAYS use maximum resolution regardless of viewport
      let w: number;
      if (highRes) {
        // Force highest resolution for modal images on all devices including mobile
        w = 2400;
      } else {
        // Normal responsive behavior for thumbnails
        const chWidthHeader = req.headers["sec-ch-width"];
        const dprHeader = req.headers["dpr"];
        const chWidthStr = Array.isArray(chWidthHeader) ? chWidthHeader[0] : chWidthHeader;
        const dprStr = Array.isArray(dprHeader) ? dprHeader[0] : dprHeader;
        const chWidth = parseInt(chWidthStr || "", 10);
        const dpr = parseFloat(dprStr || "1");
        const cssWidth = Number.isFinite(chWidth) && chWidth > 0 ? chWidth : 1200;
        const target = Math.min(1200, Math.ceil(cssWidth * (Number.isFinite(dpr) ? dpr : 1)));
        const widths = [320, 640, 960, 1200];
        w = widths.find(x => x >= target) || 1200;
      }

      // Build cache key (same logic as prewarm script)
      const stat = fs.statSync(abs);
      const cacheKey = [
        abs,
        Math.floor(stat.mtimeMs),
        fmt,
        quality,
        `w${w}`
      ].join("|");

      const cacheDir = path.join(process.cwd(), ".img-cache");
      await fs.promises.mkdir(cacheDir, { recursive: true });
      
      const cacheName = Buffer.from(cacheKey).toString("hex") + "." + fmt;
      const out = path.join(cacheDir, cacheName);

      // Generate optimized version if not cached
      if (!fs.existsSync(out)) {
        let pipeline = sharp(abs)
          .rotate() // auto-orient
          .resize({
            width: w,
            withoutEnlargement: true
          });
        
        pipeline = fmt === "avif"
          ? pipeline.avif({ quality })
          : pipeline.webp({ quality });
        
        await pipeline.toFile(out);
      }

      // Set response headers - more flexible caching for development
      res.setHeader("Content-Type", `image/${fmt}`);
      res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
      res.setHeader("Vary", "Accept, DPR, Width");
      res.setHeader("ETag", cacheName);

      // Stream the optimized image
      fs.createReadStream(out).pipe(res);
      
    } catch (error) {
      // On error, fall back to normal static handling
      next();
    }
  };
}