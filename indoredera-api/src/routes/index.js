import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Banner } from "../models/banner.model.js";
import { Plan } from "../models/plan.model.js";
import { Property } from "../models/property.model.js";
import { Testimonial } from "../models/testimonial.model.js";
import { User } from "../models/user.model.js";
import { resetToSeed } from "../seed/seed.js";
import authRoutes from "./auth.routes.js";
import bannerRoutes from "./banner.routes.js";
import contentRoutes from "./content.routes.js";
import planRoutes from "./plan.routes.js";
import propertyRoutes from "./property.routes.js";
import testimonialRoutes from "./testimonial.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/content", contentRoutes);
router.use("/properties", propertyRoutes);
router.use("/banners", bannerRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/plans", planRoutes);
router.use("/users", userRoutes);

/** Admin dashboard ke counters — client par saara data ginne se behtar. */
router.get(
  "/admin/stats",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [listings, live, pending, drafts, featured, users, owners, tenants, admins, feedbackPending, banners, plans] =
      await Promise.all([
        Property.countDocuments(),
        Property.countDocuments({ status: "approved" }),
        Property.countDocuments({ status: "pending" }),
        Property.countDocuments({ status: "draft" }),
        Property.countDocuments({ featured: true }),
        User.countDocuments(),
        User.countDocuments({ role: "owner" }),
        User.countDocuments({ role: "tenant" }),
        User.countDocuments({ role: "admin" }),
        Testimonial.countDocuments({ status: "pending" }),
        Banner.countDocuments({ active: true }),
        Plan.countDocuments({ active: true }),
      ]);

    res.json({
      listings: { total: listings, live, pending, drafts, featured },
      users: { total: users, owners, tenants, admins },
      feedback: { pending: feedbackPending },
      banners: { active: banners },
      plans: { active: plans },
    });
  }),
);

/** Sab kuch mita kar default seed content par wapas. */
router.post(
  "/admin/reset",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const summary = await resetToSeed();
    res.json({ ok: true, ...summary });
  }),
);

export default router;
