import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { omitUndefined } from "../lib/objects.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Plan } from "../models/plan.model.js";
import { planSchema } from "../validators/schemas.js";

const router = Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = req.user?.role === "admin" ? {} : { active: true };
    const items = await Plan.find(filter).sort({ order: 1, price: 1 });
    res.json({ items });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(planSchema),
  asyncHandler(async (req, res) => {
    if (!req.body.id) throw ApiError.badRequest("Plan ki id zaroori hai (jaise \"monthly\").");
    if (await Plan.exists({ id: req.body.id })) {
      throw ApiError.conflict("Is id ka plan pehle se hai.");
    }
    const plan = await Plan.create(req.body);
    res.status(201).json({ plan });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateBody(planSchema),
  asyncHandler(async (req, res) => {
    const plan = await Plan.findOneAndUpdate(
      { id: req.params.id },
      // order/highlight/active admin UI bhejta nahi — unhe reset nahi karna
      omitUndefined({ ...req.body, id: req.params.id }),
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({ plan });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Plan.findOneAndDelete({ id: req.params.id });
    if (!deleted) throw ApiError.notFound("Ye plan nahi mila.");
    res.json({ ok: true });
  }),
);

/**
 * Plan purchase.
 *
 * TODO(payments): abhi koi paisa nahi lagta. Razorpay aane par pehle order
 * banega, signature verify hoga, aur uske baad hi ye activation chalega —
 * baaki logic (snapshot user par chipkana) waisa hi rahega.
 */
router.post(
  "/:id/purchase",
  requireAuth,
  asyncHandler(async (req, res) => {
    const plan = await Plan.findOne({ id: req.params.id, active: true });
    if (!plan) throw ApiError.notFound("Ye plan available nahi hai.");

    const user = req.user;
    /* Plan ka snapshot user par chipakta hai — baad me admin price ya credits
       badal de to purane subscriber ka plan nahi badalta. */
    user.plan = plan.toUserPlan();
    await user.save();

    res.json({ user: user.toJSON(), plan });
  }),
);

export default router;
