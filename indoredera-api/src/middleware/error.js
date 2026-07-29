import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ApiError } from "../lib/api-error.js";

/*
 * Ek hi error shape poore API me:
 *   { error: { message, code?, details? } }
 * Frontend sirf `error.message` padhta hai, isliye har message aisa hona
 * chahiye jo seedha user ko dikhaya ja sake.
 */

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route nahi mila: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars -- Express 4 error handler ke 4 args zaroori hain
export function errorHandler(err, _req, res, _next) {
  const mapped = normalize(err);

  if (mapped.status >= 500) {
    console.error("[api] 500:", err);
  }

  res.status(mapped.status).json({
    error: {
      message: mapped.message,
      ...(mapped.details ? { details: mapped.details } : {}),
      ...(env.isProd ? {} : { stack: err.stack }),
    },
  });
}

function normalize(err) {
  if (err instanceof ApiError) {
    return { status: err.status, message: err.message, details: err.details };
  }

  // Mongoose schema validation — field-wise messages seedha useful hote hain
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
    return { status: 400, message: Object.values(details)[0] ?? "Data theek nahi hai.", details };
  }

  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, message: `"${err.value}" is field ke liye sahi value nahi hai.` };
  }

  // duplicate key — unique index toota (email/phone/plan id)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "value";
    const labels = { email: "Email", phone: "Mobile number", id: "ID" };
    return {
      status: 409,
      message: `${labels[field] ?? field} pehle se registered hai.`,
      details: { [field]: "already exists" },
    };
  }

  // body-parser: payload limit / malformed JSON
  if (err?.type === "entity.too.large") {
    return { status: 413, message: "Photos bahut badi hain — chhoti photos try karein." };
  }
  if (err instanceof SyntaxError && "body" in err) {
    return { status: 400, message: "Request ka JSON theek nahi hai." };
  }

  return {
    status: err?.status ?? 500,
    message: env.isProd ? "Server par kuch galat ho gaya." : (err?.message ?? "Unknown error"),
  };
}
