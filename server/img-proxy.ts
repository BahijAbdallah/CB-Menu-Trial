import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Request, Response } from "express";

export default function imgProxy() {
  return async (req: Request, res: Response) => {
    try {
      const { src, w } = req.query;
      if (!src || typeof src !== 'string') {
        return res.status(400).send("Missing src");
      }

      // Decide format from Accept header
      const accept = req.headers.accept || "";
      const fmt = accept.includes("image/avif") ? "avif" : "webp";
      const quality = fmt === "avif" ? 55 : 70;

      // Parse and constrain width
      const width = Math.min(1200, Math.max(320, parseInt((w as string) || "720", 10) || 720));

      // Resolve URL - handle both absolute and relative
      const isAbsolute = /^https?:\/\//i.test(src);
      const resolvedUrl = isAbsolute ? src : `${req.protocol}://${req.get("host")}${src}`;

      // Set up cache
      const cacheDir = path.join(process.cwd(), ".img-cache");
      await fs.promises.mkdir(cacheDir, { recursive: true });
      
      const cacheKey = Buffer.from(`${resolvedUrl}|${fmt}|q${quality}|w${width}`).toString("hex");
      const outFile = path.join(cacheDir, `${cacheKey}.${fmt}`);

      // Generate optimized image if not cached
      if (!fs.existsSync(outFile)) {
        let inputBuffer: Buffer;

        // If local file under /public, read from disk (faster, avoids recursion)
        if (!isAbsolute) {
          const publicPath = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
          if (fs.existsSync(publicPath)) {
            inputBuffer = await fs.promises.readFile(publicPath);
          }
        }
        
        // If we don't have the buffer yet, fetch it
        if (!inputBuffer!) {
          const response = await fetch(resolvedUrl);
          if (!response.ok) {
            return res.redirect(resolvedUrl);
          }
          const arrayBuffer = await response.arrayBuffer();
          inputBuffer = Buffer.from(arrayBuffer);
        }

        // Process image with Sharp
        let pipeline = sharp(inputBuffer)
          .rotate() // auto-orient
          .resize({ 
            width, 
            withoutEnlargement: true 
          });
        
        pipeline = fmt === "avif" 
          ? pipeline.avif({ quality }) 
          : pipeline.webp({ quality });
        
        await pipeline.toFile(outFile);
      }

      // Serve the optimized image
      res.setHeader("Content-Type", `image/${fmt}`);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Vary", "Accept");
      
      fs.createReadStream(outFile).pipe(res);
      
    } catch (error) {
      // Fallback to original on any error
      const originalSrc = req.query.src as string;
      if (originalSrc) {
        return res.redirect(originalSrc);
      }
      res.status(500).end();
    }
  };
}