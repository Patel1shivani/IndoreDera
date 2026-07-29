import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { connectDb, disconnectDb } from "../config/db.js";
import { ROOT_DIR } from "../config/env.js";
import { Banner } from "../models/banner.model.js";
import { Plan } from "../models/plan.model.js";
import { Property } from "../models/property.model.js";
import { SiteContent } from "../models/site-content.model.js";
import { Testimonial } from "../models/testimonial.model.js";
import { User } from "../models/user.model.js";
import { ensureAdmin } from "./seed.js";

/*
 * Purane JSON-file wale server (`data.json`) ka data MongoDB me le aata hai.
 *
 * Ise ek hi baar chalana hota hai: `npm run migrate`. Dobara chalana bhi safe
 * hai — sab kuch id par upsert hota hai, duplicate nahi bante.
 *
 * Passwords SHA-256 me the aur unse bcrypt hash banaya nahi ja sakta, isliye wo
 * `legacyPasswordHash` me jaate hain. User ke agle sahi login par wo apne aap
 * bcrypt me badal jaata hai (dekhein user.model.js → verifyPassword).
 */

const DATA_FILE = path.join(ROOT_DIR, "data.json");

/** `undefined` fields upsert me $set nahi hone chahiye. */
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

async function upsertAll(Model, docs, label) {
  if (!docs.length) return 0;
  const ops = docs.map((doc) => ({
    updateOne: { filter: { id: doc.id }, update: { $set: clean(doc) }, upsert: true },
  }));
  const result = await Model.bulkWrite(ops, { ordered: false });
  const count = (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
  console.log(`[migrate] ${label}: ${docs.length} process hue (${count} likhe gaye)`);
  return count;
}

function toProperty(p) {
  return clean({
    id: p.id,
    title: p.title,
    titleHi: p.titleHi || p.title,
    type: p.type,
    locality: p.locality,
    road: p.road,
    rent: Number(p.rent) || 0,
    deposit: Number(p.deposit) || 0,
    area: p.area ?? "",
    bhk: p.bhk,
    furnishing: p.furnishing ?? "Unfurnished",
    preferred: p.preferred ?? "Anyone",
    image: p.image,
    images: p.images?.length ? p.images : undefined,
    featured: Boolean(p.featured),
    amenities: p.amenities ?? [],
    tags: p.tags ?? [],
    description: p.description ?? "",
    ownerId: p.ownerId,
    ownerName: p.ownerName ?? "Owner",
    ownerPhone: p.ownerPhone,
    status: p.status ?? "approved",
    createdAt: p.createdAt ?? Date.now(),
  });
}

function toUser(u) {
  return clean({
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role ?? "tenant",
    plan: u.plan ?? null,
    // purana sha256 hash — pehle login par bcrypt me upgrade ho jaayega
    legacyPasswordHash: u.passwordHash,
  });
}

async function migrate() {
  if (!existsSync(DATA_FILE)) {
    console.log(`[migrate] ${DATA_FILE} nahi mili — kuch import karne ko nahi hai.`);
    return;
  }

  const state = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const site = state.siteData ?? {};

  if (site.hero) {
    const doc = await SiteContent.singleton();
    doc.hero.set(site.hero);
    await doc.save();
    console.log("[migrate] hero: import ho gaya");
  }

  /* Purane blob me `order` field thi hi nahi — sab kuch array ke sequence par
     chalta tha. Us sequence ko yahin order me badal dete hain, warna sab 0 par
     aa jaate aur banner/plan ka display order random ho jaata. */
  const withOrder = (rows) => rows.map((row, i) => ({ ...row, order: row.order ?? i }));

  await upsertAll(Plan, withOrder(site.plans ?? []), "plans");
  await upsertAll(Banner, withOrder(site.banners ?? []), "banners");
  await upsertAll(Testimonial, site.testimonials ?? [], "testimonials");
  await upsertAll(Property, (site.listings ?? []).map(toProperty), "listings");

  /* Users bulkWrite se nahi jaate — har account par pre-validate aur setters
     chalne chahiye (phone/email normalize), warna aadha-adhoora data ghus jaata. */
  let users = 0;
  for (const raw of state.users ?? []) {
    if (!raw?.email || !raw?.phone) continue;
    const existing = await User.findOne({ id: raw.id }).select("+passwordHash");
    if (existing?.passwordHash) continue; // pehle se migrate ho chuka hai
    await User.findOneAndUpdate(
      { id: raw.id },
      { $set: toUser(raw) },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    users += 1;
  }
  console.log(`[migrate] users: ${users} import hue (passwords legacy hash me)`);

  await ensureAdmin();
}

try {
  await connectDb();
  await migrate();
  console.log("[migrate] ho gaya. Ab data.json ki zaroorat nahi — chahein to hata dein.");
} catch (err) {
  console.error("[migrate] fail:", err.message);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
