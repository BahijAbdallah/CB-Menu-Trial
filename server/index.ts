import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createReadStream, existsSync, statSync } from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./init-db";

const memoryStore = MemoryStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// On-the-fly image optimization middleware (BEFORE static middleware)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only handle .jpg/.jpeg/.png requests
    if (!/\.(jpe?g|png)$/i.test(req.path)) {
      return next();
    }

    const originalAbs = path.join(process.cwd(), "public", req.path);
    
    // Check if original file exists, let static middleware handle 404
    if (!existsSync(originalAbs)) {
      return next();
    }

    // Decide output format via Accept header
    const accept = req.headers.accept || "";
    const fmt = accept.includes("image/avif") ? "avif" : "webp";
    const quality = fmt === "avif" ? 55 : 70;
    const maxWidth = 1200;

    // Build cache key using file mtime
    const stat = statSync(originalAbs);
    const cacheKey = [
      originalAbs,
      Math.floor(stat.mtimeMs),
      fmt,
      quality,
      `w${maxWidth}`
    ].join("|");

    const cacheDir = path.join(process.cwd(), ".img-cache");
    await fs.mkdir(cacheDir, { recursive: true });
    
    const cacheName = Buffer.from(cacheKey).toString("hex") + "." + fmt;
    const outAbs = path.join(cacheDir, cacheName);

    // Generate optimized version if not cached
    if (!existsSync(outAbs)) {
      let pipeline = sharp(originalAbs)
        .rotate() // auto-orient
        .resize({
          width: maxWidth,
          withoutEnlargement: true
        });
        
      pipeline = fmt === "avif"
        ? pipeline.avif({ quality })
        : pipeline.webp({ quality });
        
      await pipeline.toFile(outAbs);
    }

    // Serve optimized version
    res.setHeader("Content-Type", `image/${fmt}`);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Vary", "Accept");

    createReadStream(outAbs).pipe(res);
    
  } catch (error) {
    // On error, fall back to normal static handling
    next();
  }
});

// Serve static files from public directory with caching for images
app.use(express.static('public', {
  setHeaders: (res: Response, path: string) => {
    // Add caching headers for all image files
    if (path.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Serve static files from attached_assets directory
app.use('/attached_assets', express.static('attached_assets'));


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: true,
  saveUninitialized: true,
  store: new memoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  },
  name: 'sessionId'
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
