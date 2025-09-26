import fs from "fs";
import path from "path";
import sharp from "sharp";

export default function imageOptimizer({ root = "public" } = {}) {
  return async (req, res, next) => {
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
      const quality = fmt === "avif" ? 55 : 70;

      // Choose a target width from client hints (fallback 1200)
      const chWidth = parseInt(req.headers["sec-ch-width"] || "", 10);
      const dpr = parseFloat(req.headers["dpr"] || "1");
      const cssWidth = Number.isFinite(chWidth) && chWidth > 0 ? chWidth : 1200;
      const target = Math.min(1200, Math.ceil(cssWidth * (Number.isFinite(dpr) ? dpr : 1)));

      // Snap to buckets we prewarmed
      const widths = [320, 640, 960, 1200];
      const w = widths.find(x => x >= target) || 1200;

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

      // Set response headers
      res.setHeader("Content-Type", `image/${fmt}`);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Vary", "Accept, DPR, Width");
      res.setHeader("Content-DPR", (Number.isFinite(dpr) ? dpr : 1).toString());

      // Stream the optimized image
      fs.createReadStream(out).pipe(res);
      
    } catch (error) {
      // On error, fall back to normal static handling
      next();
    }
  };
}