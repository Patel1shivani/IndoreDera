import { z } from "zod";
import { AUDIENCES } from "../models/banner.model.js";
import { FURNISHINGS, LISTING_STATUSES, PROPERTY_TYPES } from "../models/property.model.js";

/*
 * Request validation. Messages wahi hain jo pehle client-side auth me the —
 * ab ye server par enforce hote hain, isliye koi bhi client inhe bypass nahi
 * kar sakta.
 */

const phone = z
  .string()
  .transform((v) => v.replace(/\D/g, "").slice(-10))
  .refine((v) => v.length === 10, "Mobile number 10 digit ka hona chahiye.");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^\S+@\S+\.\S+$/, "Email sahi format me likhein.");

const password = z.string().min(6, "Password kam se kam 6 character ka rakhein.");

const name = z.string().trim().min(2, "Naam kam se kam 2 character ka hona chahiye.").max(80);

export const registerSchema = z.object({
  name,
  phone,
  email,
  password,
  // admin yahan se kabhi nahi ban sakta — wo sirf seed ya kisi aur admin se banta hai
  role: z.enum(["tenant", "owner"]).default("tenant"),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email ya mobile number likhein."),
  password: z.string().min(1, "Password likhein."),
});

export const profileSchema = z.object({ name, phone, email });

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Purana password likhein."),
  next: password,
});

/* ---------------------------------------------------------------- listings */

const imageUrl = z
  .string()
  .min(1)
  .max(8_000_000) // base64 data-URL bhi chalti hai
  .refine((v) => /^https?:\/\//i.test(v) || v.startsWith("data:image/"), "Photo ka link theek nahi hai.");

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(4, "Title kam se kam 4 character ka rakhein.").max(160),
  titleHi: z.string().trim().max(160).optional(),
  type: z.enum(PROPERTY_TYPES),
  locality: z.string().trim().min(1, "Locality chunein."),
  road: z.string().trim().max(160).optional(),
  rent: z.coerce.number().min(0, "Rent 0 se kam nahi ho sakta."),
  deposit: z.coerce.number().min(0).default(0),
  area: z.string().trim().max(60).default(""),
  bhk: z.string().trim().max(20).optional(),
  furnishing: z.enum(FURNISHINGS).default("Unfurnished"),
  preferred: z.string().trim().max(120).default("Anyone"),
  image: imageUrl.optional(),
  images: z.array(imageUrl).max(12, "Zyada se zyada 12 photos add ho sakti hain.").optional(),
  amenities: z.array(z.string().trim()).default([]),
  tags: z.array(z.string().trim()).default([]),
  description: z.string().trim().max(4000).default(""),
  // owner khud sirf draft ya pending bhej sakta hai; approve admin karta hai
  status: z.enum(["draft", "pending"]).default("pending"),
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertyStatusSchema = z.object({ status: z.enum(LISTING_STATUSES) });

export const propertyQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  locality: z.string().trim().optional(),
  minRent: z.coerce.number().optional(),
  maxRent: z.coerce.number().optional(),
  status: z.enum([...LISTING_STATUSES, "all"]).optional(),
  ownerId: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(100),
  page: z.coerce.number().min(1).default(1),
});

/* ---------------------------------------------------------------- banners */

/*
 * `order` aur `active` optional hain, default ke saath nahi.
 *
 * Admin UI banner object me `order` bhejta hi nahi. Agar yahan `.default(0)`
 * hota to har save par ordering 0 par reset ho jaati. Optional rakhne se jo
 * field nahi aayi wo document par chhoo-i hi nahi jaati (aur naye banner par
 * Mongoose schema ka default lag jaata hai).
 */
export const bannerSchema = z.object({
  id: z.string().trim().min(1).optional(),
  audience: z.enum(AUDIENCES),
  title: z.string().trim().min(1, "Banner ka title likhein.").max(120),
  subtitle: z.string().trim().max(300).default(""),
  image: z.string().trim().default(""),
  ctaLabel: z.string().trim().max(60).default(""),
  active: z.boolean().optional(),
  order: z.coerce.number().optional(),
});

/* ----------------------------------------------------------- testimonials */

export const testimonialSchema = z.object({
  name: z.string().trim().min(2, "Naam likhein.").max(80),
  locality: z.string().trim().max(80).default(""),
  rating: z.coerce.number().min(1).max(5),
  message: z.string().trim().min(5, "Thoda vistaar se likhein.").max(1000),
});

export const testimonialStatusSchema = z.object({ status: z.enum(["pending", "approved"]) });

/* ------------------------------------------------------------------ plans */

export const planSchema = z.object({
  id: z.string().trim().min(1).max(40).optional(),
  label: z.string().trim().min(1, "Plan ka naam likhein.").max(60),
  price: z.coerce.number().min(0),
  period: z.string().trim().max(40).default(""),
  credits: z.coerce.number().min(0).nullable().default(null),
  durationDays: z.coerce.number().min(1).nullable().default(null),
  perks: z.array(z.string().trim()).default([]),
  // bannerSchema wali hi wajah — admin ye fields bhejta nahi, to inhe reset
  // nahi karna chahiye
  highlight: z.boolean().optional(),
  order: z.coerce.number().optional(),
  active: z.boolean().optional(),
});

/* ------------------------------------------------------------------- hero */

export const heroPatchSchema = z
  .object({
    logoText: z.string().trim().max(60),
    logoTagline: z.string().trim().max(120),
    badge: z.string().trim().max(120),
    titleStart: z.string().trim().max(120),
    titleHighlight: z.string().trim().max(120),
    titleEnd: z.string().trim().max(120),
    subtitle: z.string().trim().max(400),
    searchCta: z.string().trim().max(60),
    ownerCta: z.string().trim().max(120),
    lockedTitle: z.string().trim().max(160),
    lockedSubtitle: z.string().trim().max(400),
  })
  .partial();

/* ------------------------------------------------------------ admin users */

export const userRoleSchema = z.object({ role: z.enum(["tenant", "owner", "admin"]) });

/** planId null bhejne par user ka plan hata diya jaata hai. */
export const userPlanSchema = z.object({ planId: z.string().trim().min(1).nullable() });
