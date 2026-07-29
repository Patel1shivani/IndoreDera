import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { dbStatus } from "./config/db.js";
import { env } from "./config/env.js";
import { ApiError } from "./lib/api-error.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  // proxy ke peeche (Render/Railway/nginx) sahi client IP mile — rate limit isi par chalti hai
  app.set("trust proxy", 1);

  app.use(
    helmet({
      // API JSON deta hai, koi page render nahi hota — CORP default cross-origin
      // images/fetch ko block kar deta hai
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    cors({
      origin(origin, callback) {
        // origin undefined = curl/Postman/server-to-server — inhe rokne ka fayda nahi
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        callback(new ApiError(403, `Origin "${origin}" ko is API ki permission nahi hai.`));
      },
      credentials: true, // httpOnly cookie wale same-origin deploy ke liye
    }),
  );

  app.use(cookieParser());

  /* Listing photos base64 data-URL me aati hain, isliye limit udaar hai.
     TODO(uploads): photos ko S3/Cloudinary par bhejein aur yahan sirf URL rakhein —
     tab ye limit 1mb par aa sakti hai. */
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  if (!env.isProd) app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    const db = dbStatus();
    res.status(db.state === "connected" ? 200 : 503).json({
      ok: db.state === "connected",
      service: "indoredera-api",
      db,
      uptime: Math.round(process.uptime()),
    });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
