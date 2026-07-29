import { fileURLToPath } from "node:url";
import { connectDb, disconnectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Banner } from "../models/banner.model.js";
import { Plan } from "../models/plan.model.js";
import { Property } from "../models/property.model.js";
import { SiteContent } from "../models/site-content.model.js";
import { Testimonial } from "../models/testimonial.model.js";
import { User } from "../models/user.model.js";
import {
  defaultBanners,
  defaultHero,
  defaultListings,
  defaultPlans,
  defaultTestimonials,
} from "./seed-data.js";

/*
 * Seeding.
 *
 * Default behaviour "sirf khaali collection bharo" hai — server har start par
 * ise chalata hai, isliye ye kabhi kisi ke edit ko overwrite nahi karta.
 * `--fresh` (ya resetToSeed) hi wo jagah hai jahan purana data mitta hai.
 */

/** Admin account hamesha hona chahiye, warna admin panel me ghusa hi nahi ja sakta. */
export async function ensureAdmin() {
  if (await User.exists({ role: "admin" })) return null;

  const existing = await User.findOne({ email: env.admin.email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    return existing;
  }

  const admin = new User({
    name: env.admin.name,
    email: env.admin.email,
    phone: env.admin.phone,
    role: "admin",
  });
  await admin.setPassword(env.admin.password);
  await admin.save();

  console.log(`[seed] Admin account bana: ${admin.email}`);
  return admin;
}

/** Khaali collections bhar deta hai. Jo pehle se bhari hai use haath nahi lagta. */
export async function seedIfEmpty() {
  const summary = {};

  const site = await SiteContent.singleton();
  // hero ka logoText khaali hone ka matlab document abhi bana hi hai
  if (!site.hero?.titleStart) {
    site.hero.set(defaultHero);
    await site.save();
    summary.hero = "seeded";
  }

  if ((await Plan.estimatedDocumentCount()) === 0) {
    await Plan.insertMany(defaultPlans);
    summary.plans = defaultPlans.length;
  }
  if ((await Banner.estimatedDocumentCount()) === 0) {
    await Banner.insertMany(defaultBanners);
    summary.banners = defaultBanners.length;
  }
  if ((await Testimonial.estimatedDocumentCount()) === 0) {
    await Testimonial.insertMany(defaultTestimonials);
    summary.testimonials = defaultTestimonials.length;
  }
  if ((await Property.estimatedDocumentCount()) === 0) {
    const listings = defaultListings();
    await Property.insertMany(listings);
    summary.listings = listings.length;
  }

  const admin = await ensureAdmin();
  if (admin) summary.admin = admin.email;

  return summary;
}

/**
 * Sab kuch mita kar defaults par wapas — admin accounts bache rehte hain,
 * warna reset ke baad panel me wapas nahi aa paayenge.
 */
export async function resetToSeed() {
  await Promise.all([
    Property.deleteMany({}),
    Banner.deleteMany({}),
    Testimonial.deleteMany({}),
    Plan.deleteMany({}),
    SiteContent.deleteMany({}),
    User.deleteMany({ role: { $ne: "admin" } }),
  ]);
  return seedIfEmpty();
}

/* `npm run seed` / `npm run seed:fresh` — server ke bahar bhi chal jaata hai. */
const runDirectly = process.argv[1] === fileURLToPath(import.meta.url);

if (runDirectly) {
  const fresh = process.argv.includes("--fresh");
  try {
    await connectDb();
    const summary = fresh ? await resetToSeed() : await seedIfEmpty();
    console.log(`[seed] ${fresh ? "Fresh seed" : "Seed"} complete:`, summary);
  } catch (err) {
    console.error("[seed] fail:", err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDb();
  }
}
