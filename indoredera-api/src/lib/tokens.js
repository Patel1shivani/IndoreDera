import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/*
 * JWT session.
 *
 * Token do jagah jaata hai:
 *  - response body me (`token`) — website aur admin panel isse Authorization
 *    header me bhejte hain. Ye primary raasta hai kyunki dono apps API se alag
 *    origin par chalte hain.
 *  - httpOnly cookie me — same-origin deploy (API + site ek hi domain par) ke
 *    liye, jahan ye XSS ke against zyada safe hai.
 */

export const AUTH_COOKIE = "indoredera_token";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

/** @returns {{sub: string, role: string} | null} */
export function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null; // expired ya tampered — dono ka matlab "logged out"
  }
}

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: env.isProd ? "strict" : "lax",
    secure: env.isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, { path: "/" });
}

/** Authorization header ko cookie par preference milti hai (cross-origin case). */
export function readToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.cookies?.[AUTH_COOKIE] ?? null;
}
