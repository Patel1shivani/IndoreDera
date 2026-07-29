/**
 * `undefined` values hata deta hai.
 *
 * Upsert me `$set: { order: undefined }` bhejne se Mongoose us field ko chhoo
 * leta hai. Jo field request me aayi hi nahi (kyunki client use bhejta hi nahi),
 * use waisa hi rehna chahiye jaisa database me hai — reset nahi hona chahiye.
 */
export const omitUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
