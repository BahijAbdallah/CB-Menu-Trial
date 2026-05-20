import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
// import imageOptimizer from "./image-optimizer";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const memoryStore = MemoryStore(session);
const port = Number(process.env.PORT) || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// console.log("[STARTUP]", {
//   NODE_ENV: process.env.NODE_ENV,
//   PORT: port,
//   UPLOAD_ROOT: process.env.UPLOAD_ROOT,
//   pid: process.pid,
// });

// setInterval(() => {
//   const memory = process.memoryUsage();
//   console.log("[MEMORY]", {
//     rss: memory.rss,
//     heapTotal: memory.heapTotal,
//     heapUsed: memory.heapUsed,
//     external: memory.external,
//     arrayBuffers: memory.arrayBuffers,
//     uptime: process.uptime(),
//     timestamp: new Date().toISOString(),
//   });
// }, 5000);

process.on("uncaughtException", (error) => {
  console.error("[PROCESS ERROR] uncaughtException", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[PROCESS ERROR] unhandledRejection", reason);
  process.exit(1);
});

process.on("warning", (warning) => {
  console.warn("[PROCESS ERROR] warning", warning);
});

process.on("SIGTERM", () => {
  console.warn("[SIGNAL] SIGTERM", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
  process.exit(143);
});

process.on("SIGINT", () => {
  console.warn("[SIGNAL] SIGINT", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
  process.exit(130);
});

// Image proxy will be registered in routes.ts to ensure it comes before Vite middleware

// Advanced image optimization with client hints support (BEFORE static middleware)
// app.use(imageOptimizer({ root: "public" }));

// Serve static files from public directory with caching for images
app.use(
  express.static("public", {
    setHeaders: (res: Response, path: string) => {
      // Add caching headers for all image files
      if (path.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

// Serve static files from attached_assets directory
app.use("/attached_assets", express.static("attached_assets"));

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: true,
    saveUninitialized: true,
    store: new memoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
    },
    name: "sessionId",
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      log(
        `[API REQUEST] ${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`,
      );
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
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);

    // Baseline memory after startup — should be under 100 MB RSS with NODE_ENV=production
    setTimeout(() => {
      const m = process.memoryUsage();
      console.log("[STARTUP BASELINE]", {
        rss: `${Math.round(m.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(m.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(m.external / 1024 / 1024)}MB`,
        note:
          process.env.NODE_ENV === "production"
            ? "prod mode ✓"
            : "⚠ NOT production mode",
      });
    }, 4000);
  });
})();
