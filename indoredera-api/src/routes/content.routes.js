import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Banner } from "../models/banner.model.js";
import { Plan } from "../models/plan.model.js";
import { Property } from "../models/property.model.js";
import { SiteContent } from "../models/site-content.model.js";
import { Testimonial } from "../models/testimonial.model.js";
import { heroPatchSchema } from "../validators/schemas.js";

const router = Router();

/**
 * Website ka pehla load — hero, banners, testimonials, listings aur plans ek
 * hi request me. Alag-alag endpoints bhi hain, par home page ko sab kuch ek
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
      banners,
      testimonials,
      listings,
      plans,
      // client ise cache-busting/refresh decide karne ke liye use kar sakta hai
      updatedAt: Date.now(),
    });
  }),
);

router.get(
  "/hero",
  asyncHandler(async (_req, res) => {
    const site = await SiteContent.singleton();
    res.json({ hero: site.hero });
  }),
);

router.patch(
  "/hero",
  requireAuth,
  requireAdmin,
  validateBody(heroPatchSchema),
  asyncHandler(async (req, res) => {
    const site = await SiteContent.singleton();
    // partial patch — jo fields aayi sirf wahi badalti hain
    site.hero.set(req.body);
    await site.save();
    res.json({ hero: site.hero });
  }),
);

export default router;
