import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../lib/tokens.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Property } from "../models/property.model.js";
import { User } from "../models/user.model.js";
import { normalizeEmail, normalizePhone } from "../models/shared.js";
import {
  changePasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from "../validators/schemas.js";

const router = Router();

/* Password guessing ko dheema karta hai. Dev me itni tight nahi rakhi ki apna
   hi testing block ho jaaye. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProd ? 20 : 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Bahut zyada koshishein — thodi der baad try karein." } },
});

/** Login/register ka common jawab — token body me, cookie bhi set hoti hai. */
function sendSession(res, user, status = 200) {
  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(status).json({ token, user: user.toJSON() });
}

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, email, password, role } = req.body;

    // unique index bhi hai, par yahan check karne se message accha milta hai
    if (await User.exists({ email })) {
      throw ApiError.conflict("Yeh email pehle se registered hai. Login karein.");
    }
    if (await User.exists({ phone })) {
      throw ApiError.conflict("Yeh mobile number pehle se registered hai. Login karein.");
    }

    const user = new User({ name, phone, email, role });
    await user.setPassword(password);
    await user.save();

    sendSession(res, user, 201);
  }),
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdentifier(req.body.identifier);

    // user na mile tab bhi wahi message — warna ye email-enumeration ban jaata hai
    if (!user || !(await user.verifyPassword(req.body.password))) {
      throw ApiError.unauthorized("Email/mobile ya password galat hai.");
    }

    sendSession(res, user);
  }),
);

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toJSON() });
  }),
);

router.patch(
  "/profile",
  requireAuth,
  validateBody(profileSchema),
  asyncHandler(async (req, res) => {
    const { name, phone, email } = req.body;
    const user = req.user;

    if (await User.exists({ email: normalizeEmail(email), id: { $ne: user.id } })) {
      throw ApiError.conflict("Yeh email kisi aur account par registered hai.");
    }
    if (await User.exists({ phone: normalizePhone(phone), id: { $ne: user.id } })) {
      throw ApiError.conflict("Yeh mobile number kisi aur account par registered hai.");
    }

    user.set({ name, phone, email });
    await user.save();

    /* Listings par owner ka snapshot rehta hai (taaki har card ke liye join na
       karna pade) — profile badla to wo bhi sync karna zaroori hai. */
    await Property.updateMany(
      { ownerId: user.id },
      { $set: { ownerName: user.name, ownerPhone: user.phone } },
    );

    res.json({ user: user.toJSON() });
  }),
);

router.post(
  "/change-password",
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    // req.user requireAuth se aaya hai jisme passwordHash select nahi hua
    const user = await User.findOne({ id: req.user.id }).select(
      "+passwordHash +legacyPasswordHash",
    );
    if (!user) throw ApiError.unauthorized("Account nahi mila. Dobara login karein.");

    if (!(await user.verifyPassword(req.body.current))) {
      throw ApiError.badRequest("Purana password galat hai.");
    }

    await user.setPassword(req.body.next);
    await user.save();

    res.json({ ok: true });
  }),
);

export default router;
