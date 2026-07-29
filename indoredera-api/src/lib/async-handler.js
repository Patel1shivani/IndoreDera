/**
 * Express 4 async route handlers ka rejection khud nahi pakadta — bina iske
 * ek `await` fail hone par request hamesha ke liye hang ho jaati hai.
 *
 * @param {(req, res, next) => Promise<unknown>} fn
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
