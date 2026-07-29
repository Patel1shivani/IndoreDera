import { Router } from "express";
import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { Property } from "../models/property.model.js";
import {
  propertyCreateSchema,
  propertyQuerySchema,
  propertyStatusSchema,
  propertyUpdateSchema,
} from "../validators/schemas.js";

const router = Router();

/** Har owner ko itni listings free milti hain — uske baad plan chahiye. */
export const FREE_LISTINGS_PER_OWNER = 1;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=70";

const isAdmin = (user) => user?.role === "admin";

/** Listing dekhne ka haq: approved sabko, baaki sirf owner aur admin ko. */
function canView(property, user) {
  if (property.status === "approved") return true;
  return isAdmin(user) || (!!user && property.ownerId === user.id);
}

function canEdit(property, user) {
  return isAdmin(user) || (!!user && property.ownerId === user.id);
}

/**
 * Owner nayi listing daal sakta hai ya nahi.
 * Pehli listing free — uske baad active plan chahiye.
 */
export async function checkListingQuota(user) {
  const posted = await Property.countDocuments({ ownerId: user.id });
  if (posted < FREE_LISTINGS_PER_OWNER) return { allowed: true, reason: "free" };
  if (user.hasActivePlan()) return { allowed: true, reason: "plan" };
  return { allowed: false, reason: "plan-required" };
}

/* ------------------------------------------------------------------- read */

router.get(
  "/",
  optionalAuth,
  validateQuery(propertyQuerySchema),
  asyncHandler(async (req, res) => {
    const { q, type, locality, minRent, maxRent, status, ownerId, limit, page } =
      req.validatedQuery;
    const filter = {};

    if (type) filter.type = type;
    if (locality) filter.locality = locality;
    if (minRent !== undefined || maxRent !== undefined) {
      filter.rent = {};
      if (minRent !== undefined) filter.rent.$gte = minRent;
      if (maxRent !== undefined) filter.rent.$lte = maxRent;
    }
    if (q) filter.$text = { $search: q };

    /* Status ka default sabke liye alag hai: admin sab dekhta hai, owner apni
       saari listings, baaki sirf approved. */
    const own = ownerId && req.user && ownerId === req.user.id;
    if (isAdmin(req.user)) {
      if (ownerId) filter.ownerId = ownerId;
      if (status && status !== "all") filter.status = status;
    } else if (own) {
      filter.ownerId = ownerId;
      if (status && status !== "all") filter.status = status;
    } else {
      if (ownerId) filter.ownerId = ownerId;
      filter.status = "approved";
    }

    const [items, total] = await Promise.all([
      Property.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    res.json({ items, total, page, limit });
  }),
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) throw ApiError.notFound("Ye listing nahi mili.");
    // pending/draft listing ka existence bhi chhupate hain — 403 se pata chal jaata
    if (!canView(property, req.user)) throw ApiError.notFound("Ye listing nahi mili.");

    res.json({ property });
  }),
);

/* ------------------------------------------------------------------ write */

router.post(
  "/",
  requireAuth,
  validateBody(propertyCreateSchema),
  asyncHandler(async (req, res) => {
    const user = req.user;
    const body = req.body;

    const quota = await checkListingQuota(user);
    if (!quota.allowed) {
      throw ApiError.paymentRequired(
        "Aapki free listing use ho chuki hai. Aur properties post karne ke liye plan lein.",
      );
    }

    const images = body.images?.length ? body.images : undefined;
    const property = await Property.create({
      ...body,
      titleHi: body.titleHi || body.title,
      image: body.image || images?.[0] || FALLBACK_IMAGE,
      images,
      // owner client se nahi aata — hamesha logged-in user hi hota hai
      ownerId: user.id,
      ownerName: user.name,
      ownerPhone: user.phone,
      createdAt: Date.now(),
    });

    /* Draft par credit kharch nahi hota — wo abhi live nahi ja rahi.
       Unlimited plan (credits === null) me bhi kuch ghatana nahi hai. */
    if (quota.reason === "plan" && body.status !== "draft" && user.plan?.credits !== null) {
      user.plan.credits = Math.max(0, user.plan.credits - 1);
      user.markModified("plan");
      await user.save();
    }

    res.status(201).json({ property, user: user.toJSON() });
  }),
);

router.patch(
  "/:id",
  requireAuth,
  validateBody(propertyUpdateSchema),
  asyncHandler(async (req, res) => {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) throw ApiError.notFound("Ye listing nahi mili.");
    if (!canEdit(property, req.user)) throw ApiError.forbidden("Ye listing aapki nahi hai.");

    property.set(req.body);
    /* Owner ke edit karte hi listing dobara review me chali jaati hai — warna
       approve hone ke baad content chupke se badla ja sakta tha. */
    if (!isAdmin(req.user) && property.status === "approved") property.status = "pending";
    await property.save();

    res.json({ property });
  }),
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validateBody(propertyStatusSchema),
  asyncHandler(async (req, res) => {
    const property = await Property.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    if (!property) throw ApiError.notFound("Ye listing nahi mili.");

    res.json({ property });
  }),
);

router.patch(
  "/:id/featured",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const property = await Property.findOneAndUpdate(
      { id: req.params.id },
      { featured: Boolean(req.body?.featured) },
      { new: true },
    );
    if (!property) throw ApiError.notFound("Ye listing nahi mili.");

    res.json({ property });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) throw ApiError.notFound("Ye listing nahi mili.");
    if (!canEdit(property, req.user)) throw ApiError.forbidden("Ye listing aapki nahi hai.");

    await property.deleteOne();
    res.json({ ok: true });
  }),
);

export default router;
