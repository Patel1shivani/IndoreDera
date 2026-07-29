import { randomUUID } from "node:crypto";

/*
 * Har model ke paas Mongo ka `_id` to hai hi, par frontend hamesha string `id`
 * use karta hai (aur seed listings ke id "vn-2bhk-01" jaise readable hain).
 * Isliye har document par ek alag `id` field rehti hai jo API se bahar jaati
 * hai — `_id` aur `__v` JSON me kabhi nahi jaate.
 */

export const publicId = {
  type: String,
  default: () => randomUUID(),
  unique: true,
  index: true,
  immutable: true,
};

/**
 * toJSON options — `_id`/`__v` hata deta hai aur extra fields bhi.
 * @param {string[]} [hidden] aur kaunse fields chhupane hain
 */
export const jsonOptions = (hidden = []) => ({
  virtuals: false,
  versionKey: false,
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    for (const key of hidden) delete ret[key];
    return ret;
  },
});

/** Owner ka plan — User ke andar embed hota hai (alag collection ki zaroorat nahi). */
export const userPlanSchema = {
  id: { type: String, required: true },
  label: { type: String, required: true },
  /** null = unlimited listings */
  credits: { type: Number, default: null },
  /** epoch ms; null = kabhi expire nahi hota */
  expiresAt: { type: Number, default: null },
};

export const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "").slice(-10);
export const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
