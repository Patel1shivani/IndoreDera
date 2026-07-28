import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

/*
 * Indore Dera — shared data server.
 *
 * Site (localhost:8080) aur admin panel (localhost:5174) alag origin par chalte
 * hain, isliye unka localStorage alag hota hai. Ye server beech me rehta hai
 * taaki dono ek hi data dekhein.
 *
 * Ye jaan-boojh kar minimal hai — poora state ek JSON file me rehta hai aur
 * "last write wins" chalta hai. Ye asli backend nahi hai.
 *
 * TODO(backend): ise Express + Mongoose se replace karein — alag models
 * (User, Property, Testimonial, Banner, Plan, SiteContent), JWT auth aur
 * per-resource routes. Yahan ke field names wahi hain jo frontend use karta hai.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data.json");
const PORT = Number(process.env.PORT) || 4000;

/*
 * Demo admin yahin seed hota hai — website ko admin ke baare me kuch pata nahi
 * hona chahiye. Password hash wahi formula use karta hai jo dono frontends
 * karte hain: sha256("indoredera:" + password).
 *
 * TODO(backend): asli app me ye seed script se banega aur password bcrypt se
 * hash hoga. Demo credentials production me kabhi nahi jaane chahiye.
 */
const DEMO_ADMIN = {
  name: "Indore Dera Admin",
  email: "admin@indoredera.in",
  phone: "9826000001",
  password: "admin123",
};

function hashPassword(password) {
  return createHash("sha256").update(`indoredera:${password}`).digest("hex");
}

function makeDemoAdmin() {
  return {
    id: randomUUID(),
    name: DEMO_ADMIN.name,
    phone: DEMO_ADMIN.phone,
    email: DEMO_ADMIN.email,
    role: "admin",
    plan: null,
    passwordHash: hashPassword(DEMO_ADMIN.password),
  };
}

const emptyState = () => ({ siteData: null, users: [makeDemoAdmin()], updatedAt: 0 });

/** Admin account hamesha rehna chahiye, warna admin panel me ghusa hi nahi ja sakta. */
function ensureAdmin(state) {
  if (!Array.isArray(state.users)) state.users = [];
  if (!state.users.some((u) => u.role === "admin")) state.users.push(makeDemoAdmin());
  return state;
}

async function readState() {
  if (!existsSync(DATA_FILE)) return emptyState();
  try {
    return ensureAdmin(JSON.parse(await readFile(DATA_FILE, "utf8")));
  } catch {
    console.warn("data.json padha nahi ja saka — khaali state se shuru kar rahe hain");
    return emptyState();
  }
}

async function writeState(state) {
  await writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
}

const app = express();
app.use(cors());
// listing photos base64 data-URL me aati hain, isliye limit udaar rakhi hai
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

/** Dono apps load par yahi call karte hain. */
app.get("/api/state", async (_req, res) => {
  res.json(await readState());
});

/** Site content, banners, testimonials, listings, plans — sab ek saath. */
app.put("/api/site-data", async (req, res) => {
  const state = await readState();
  state.siteData = req.body;
  state.updatedAt = Date.now();
  await writeState(state);
  res.json({ ok: true, updatedAt: state.updatedAt });
});

/** Registered users (password hash ke saath — demo hai, production me kabhi nahi). */
app.put("/api/users", async (req, res) => {
  const state = await readState();
  state.users = Array.isArray(req.body) ? req.body : [];
  ensureAdmin(state);
  state.updatedAt = Date.now();
  await writeState(state);
  res.json({ ok: true, updatedAt: state.updatedAt });
});

/** Sab kuch mita kar defaults par wapas. */
app.delete("/api/state", async (_req, res) => {
  await writeState(emptyState());
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\n  Indore Dera data server → http://localhost:${PORT}`);
  console.log(`  Data file: ${DATA_FILE}`);
  console.log(`  Admin login: ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}\n`);
});
