import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Testimonial } from "../models/testimonial.model.js";
import { testimonialSchema, testimonialStatusSchema } from "../validators/schemas.js";

const router = Router();

/** Public ko sirf approved; admin ko pending bhi (moderation queue). */
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = req.user?.role === "admin" ? {} : { status: "approved" };
    const items = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  }),
);

/**
 * Feedback koi bhi bhej sakta hai (login zaroori nahi) — par wo hamesha
 * "pending" me jaata hai. Status client se kabhi accept nahi hota.
 */
router.post(
  "/",
  optionalAuth,
  validateBody(testimonialSchema),
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.create({
      ...req.body,
      status: "pending",
      authorId: req.user?.id ?? null,
      createdAt: Date.now(),
    });
    res.status(201).json({ testimonial });
  }),
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validateBody(testimonialStatusSchema),
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    if (!testimonial) throw ApiError.notFound("Ye feedback nahi mila.");
    res.json({ testimonial });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Testimonial.findOneAndDelete({ id: req.params.id });
    if (!deleted) throw ApiError.notFound("Ye feedback nahi mila.");
    res.json({ ok: true });
  }),
);

export default router;
