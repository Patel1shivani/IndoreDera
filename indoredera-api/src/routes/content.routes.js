import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { ApiError } from "../lib/api-error.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Banner } from "../models/banner.model.js";
import { Plan } from "../models/plan.model.js";
import { Property } from "../models/property.model.js";
import { SiteContent } from "../models/site-content.model.js";
import { Testimonial } from "../models/testimonial.model.js";
import {
  aboutPatchSchema,
  contactPatchSchema,
  heroPatchSchema,
  homePatchSchema,
  legalPageParam,
  legalPatchSchema,
} from "../validators/schemas.js";

const router = Router();

/**
 * Website ka pehla load — site text, banners, testimonials, listings aur plans
 * ek hi request me. Alag-alag endpoints bhi hain, par home page ko sab kuch ek
 * saath chahiye hota hai aur 5 round-trips waterfall bana dete hain.
 *
 * Jawab caller ke hisaab se badalta hai:
 *   - guest/tenant : approved listings, approved feedback, active banners
 *   - owner        : upar wala + apni saari listings (draft/pending samet)
 *   - admin        : sab kuch
 */
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const admin = user?.role === "admin";

    const listingFilter = admin
      ? {}
      : user
        ? { $or: [{ status: "approved" }, { ownerId: user.id }] }
        : { status: "approved" };

    const [site, banners, testimonials, listings, plans] = await Promise.all([
      SiteContent.singleton(),
      Banner.find(admin ? {} : { active: true }).sort({ audience: 1, order: 1, createdAt: 1 }),
      Testimonial.find(admin ? {} : { status: "approved" }).sort({ createdAt: -1 }),
      Property.find(listingFilter).sort({ featured: -1, createdAt: -1 }),
      Plan.find(admin ? {} : { active: true }).sort({ order: 1, price: 1 }),
    ]);

    res.json({
      hero: site.hero,
      contact: site.contact,
      about: site.about,
      home: site.home,
      legal: site.legal,
      banners,
      testimonials,
      listings,
      plans,
      // client ise cache-busting/refresh decide karne ke liye use kar sakta hai
      updatedAt: Date.now(),
    });
  }),
);

/*
 * Har section ka apna GET + PATCH.
 *
 * Sab ek hi singleton document ke andar hain, par endpoints alag rakhe hain
 * taaki do admin ek saath About aur Terms edit karein to ek doosre ka kaam na
 * mite — PATCH sirf apne section ko chhoota hai.
 */

/** Ek section ka partial patch laga kar naya section wapas bhejta hai. */
async function patchSection(path, body) {
  const site = await SiteContent.singleton();
  // subdocument par set() — jo fields aayi sirf wahi badalti hain
  site.get(path).set(body);
  await site.save();
  return site.get(path);
}

const section = (name, schema) => {
  router.get(
    `/${name}`,
    asyncHandler(async (_req, res) => {
      const site = await SiteContent.singleton();
      res.json({ [name]: site[name] });
    }),
  );

  router.patch(
    `/${name}`,
    requireAuth,
    requireAdmin,
    validateBody(schema),
    asyncHandler(async (req, res) => {
      res.json({ [name]: await patchSection(name, req.body) });
    }),
  );
};

section("hero", heroPatchSchema);
section("contact", contactPatchSchema);
section("about", aboutPatchSchema);
section("home", homePatchSchema);

/* Legal ke do page ek hi shape ke hain, isliye page name URL me aata hai. */

router.get(
  "/legal/:page",
  asyncHandler(async (req, res) => {
    const page = legalPageParam.safeParse(req.params.page);
    if (!page.success) throw new ApiError(404, "Aisa koi legal page nahi hai.");

    const site = await SiteContent.singleton();
    res.json({ page: page.data, doc: site.legal[page.data] });
  }),
);

router.patch(
  "/legal/:page",
  requireAuth,
  requireAdmin,
  validateBody(legalPatchSchema),
  asyncHandler(async (req, res) => {
    const page = legalPageParam.safeParse(req.params.page);
    if (!page.success) throw new ApiError(404, "Aisa koi legal page nahi hai.");

    const doc = await patchSection(`legal.${page.data}`, req.body);
    res.json({ page: page.data, doc });
  }),
);

export default router;
