import { ZodError } from "zod";
import { ApiError } from "../lib/api-error.js";

/*
 * Zod se body/query validate karte hain aur parsed (typed, trimmed, default-bhara)
 * result wapas usi jagah rakh dete hain — route ke andar raw input kabhi nahi
 * chhua jaata.
 */

/** @param {import("zod").ZodTypeAny} schema */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(zodToApiError(result.error));
  req.body = result.data;
  next();
};

/** @param {import("zod").ZodTypeAny} schema */
export const validateQuery = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) return next(zodToApiError(result.error));
  // Express 5 me req.query getter-only hai — isliye alag jagah rakhte hain
  req.validatedQuery = result.data;
  next();
};

/** Pehla error message user ko dikhate hain, poori list `details` me jaati hai. */
export function zodToApiError(error) {
  const issues = error instanceof ZodError ? error.issues : [];
  const details = Object.fromEntries(
    issues.map((issue) => [issue.path.join(".") || "_", issue.message]),
  );
  return ApiError.badRequest(issues[0]?.message ?? "Bheja gaya data theek nahi hai.", details);
}
