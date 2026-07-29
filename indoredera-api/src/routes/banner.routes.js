import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { omitUndefined } from "../lib/objects.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Banner } from "../models/banner.model.js";
import { bannerSchema } from "../validators/schemas.js";

const router = Router();

/** Public ko sirf active banners dikhte hain; admin ko sab (inactive bhi). */
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = req.user?.role === "admin" ? {} : { active: true };
    const items = await Banner.find(filter).sort({ audience: 1, order: 1, createdAt: 1 });
    res.json({ items });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(bannerSchema),
  asyncHandler(async (req, res) => {
    const banner = await Banner.create(req.body);
    res.status(201).json({ banner });
  }),
);

/**
 * Upsert — admin UI ek hi "save" button se naya banner banata hai aur purana
 * update karta hai, isliye PUT dono kaam karta hai.
 */
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateBody(bannerSchema),
  asyncHandler(async (req, res) => {
    const banner = await Banner.findOneAndUpdate(
      { id: req.params.id },
      // jo field body me nahi aayi wo waisi hi rehni chahiye (order/active)
      omitUndefined({ ...req.body, id: req.params.id }),
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({ banner });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Banner.findOneAndDelete({ id: req.params.id });
    if (!deleted) throw ApiError.notFound("Ye banner nahi mila.");
    res.json({ ok: true });
  }),
);

export default router;
