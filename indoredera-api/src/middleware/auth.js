import { ApiError } from "../lib/api-error.js";
import { asyncHandler } from "../lib/async-handler.js";
import { readToken, verifyToken } from "../lib/tokens.js";
import { User } from "../models/user.model.js";

/*
 * Auth middleware.
 *
 * Token se sirf user id nikaalte hain aur user hamesha DB se load karte hain —
 * isse role/plan turant effective hote hain (admin ne role badla to agli
 * request par hi lagu, purana token le kar ghoomna nahi chalta).
 */

/** Token ho to `req.user` bhar deta hai; na ho to bhi request aage jaati hai. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload?.sub) return next();

  req.user = await User.findOne({ id: payload.sub });
  next();
});

/** Login zaroori. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) throw ApiError.unauthorized();

  const payload = verifyToken(token);
  if (!payload?.sub) throw ApiError.unauthorized("Session expire ho gaya. Dobara login karein.");

  const user = await User.findOne({ id: payload.sub });
  if (!user) throw ApiError.unauthorized("Account nahi mila. Dobara login karein.");

  req.user = user;
  next();
});

/** requireAuth ke baad hi lagayein. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Iske liye ${roles.join(" ya ")} access chahiye.`));
    }
    next();
  };
}

export const requireAdmin = requireRole("admin");
