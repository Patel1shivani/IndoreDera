import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Plan } from "../models/plan.model.js";
import { Property } from "../models/property.model.js";
import { User } from "../models/user.model.js";
import { userPlanSchema, userRoleSchema } from "../validators/schemas.js";

/*
 * Admin-only user management. Poora router requireAuth + requireAdmin ke peeche
 * hai — koi bhi route galti se public nahi ho sakta.
 */
const router = Router();
router.use(requireAuth, requireAdmin);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await User.find().sort({ createdAt: -1 });
    res.json({ items });
  }),
);

router.patch(
  "/:id/role",
  validateBody(userRoleSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw ApiError.notFound("Ye user nahi mila.");

    /* Aakhri admin ka role badalna panel se lock-out kar dega, isliye rok dete
       hain. Apna khud ka role bhi yahin se girana isi wajah se band hai. */
    if (user.role === "admin" && req.body.role !== "admin") {
      const admins = await User.countDocuments({ role: "admin" });
      if (admins <= 1) throw ApiError.badRequest("Aakhri admin ka role nahi badla ja sakta.");
      if (user.id === req.user.id) {
        throw ApiError.badRequest("Apna khud ka admin access yahan se nahi hata sakte.");
      }
    }

    user.role = req.body.role;
    await user.save();
    res.json({ user: user.toJSON() });
  }),
);

router.patch(
  "/:id/plan",
  validateBody(userPlanSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw ApiError.notFound("Ye user nahi mila.");

    if (req.body.planId === null) {
      user.plan = null;
    } else {
      const plan = await Plan.findOne({ id: req.body.planId });
      if (!plan) throw ApiError.notFound("Ye plan nahi mila.");
      user.plan = plan.toUserPlan();
    }

    await user.save();
    res.json({ user: user.toJSON() });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if (!user) throw ApiError.notFound("Ye user nahi mila.");
    if (user.id === req.user.id) throw ApiError.badRequest("Apna hi account delete nahi kar sakte.");
    if (user.role === "admin") {
      const admins = await User.countDocuments({ role: "admin" });
      if (admins <= 1) throw ApiError.badRequest("Aakhri admin ko delete nahi kiya ja sakta.");
    }

    /* User ke saath uski listings bhi jaati hain — warna owner-less listings
       reh jaati hain jinka phone number kisi ka nahi hota. */
    const { deletedCount } = await Property.deleteMany({ ownerId: user.id });
    await user.deleteOne();

    res.json({ ok: true, deletedListings: deletedCount });
  }),
);

export default router;
