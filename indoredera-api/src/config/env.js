import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/*
 * Saari environment reading ek hi jagah — baaki code process.env ko chhoota
 * nahi. Isse galat/missing config startup par hi pakdi jaati hai, request ke
 * beech me nahi.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(here, "..", "..");

dotenv.config({ path: path.join(ROOT_DIR, ".env") });

const bool = (value, fallback) => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const list = (value, fallback) =>
  (value ?? fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT) || 4000,

  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/indoredera",

  jwtSecret: process.env.JWT_SECRET ?? "dev-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  corsOrigins: list(
    process.env.CORS_ORIGINS,
    "http://localhost:8080,http://localhost:5174,http://localhost:5173,http://localhost:3000,https://indoredera.netlify.app",
  ),

  seedOnStart: bool(process.env.SEED_ON_START, true),

  admin: {
    name: process.env.ADMIN_NAME ?? "Indore Dera Admin",
    email: (process.env.ADMIN_EMAIL ?? "admin@indoredera.in").toLowerCase(),
    phone: process.env.ADMIN_PHONE ?? "9826000001",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  },
};

/** Production me chalne se pehle jo cheezein zaroori hain. */
export function assertProductionConfig() {
  if (!env.isProd) return;

  const problems = [];
  if (env.jwtSecret === "dev-only-change-me" || env.jwtSecret.length < 32) {
    problems.push("JWT_SECRET production ke liye bahut kamzor hai (32+ random chars rakhein).");
  }
  if (env.seedOnStart) {
    problems.push("SEED_ON_START production me false hona chahiye.");
  }
  if (env.admin.password === "admin123") {
    problems.push("ADMIN_PASSWORD default hai — ise badlein.");
  }
  if (problems.length) {
    throw new Error(`Config theek nahi hai:\n  - ${problems.join("\n  - ")}`);
  }
}
