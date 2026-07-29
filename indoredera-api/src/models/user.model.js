import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { jsonOptions, normalizeEmail, normalizePhone, publicId, userPlanSchema } from "./shared.js";

const BCRYPT_ROUNDS = 10;

/** Purana demo app browser me yahi formula use karta tha. Sirf migration ke liye. */
const legacyHash = (plain) => createHash("sha256").update(`indoredera:${plain}`).digest("hex");

const userSchema = new mongoose.Schema(
  {
    id: publicId,
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    phone: {
      type: String,
      required: true,
      unique: true,
      set: normalizePhone,
      match: [/^\d{10}$/, "Mobile number 10 digit ka hona chahiye."],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: normalizeEmail,
      match: [/^\S+@\S+\.\S+$/, "Email sahi format me likhein."],
    },
    role: { type: String, enum: ["tenant", "owner", "admin"], default: "tenant", index: true },
    /* select: false — galti se bhi query se bahar na jaaye. Password chahiye to
       .select("+passwordHash") likhna padta hai (sirf login karta hai). */
    passwordHash: { type: String, select: false },
    /* Purane JSON-file wale app se aaye accounts. Inka bcrypt hash bana hi nahi
       ja sakta (plaintext kahin nahi hai), isliye pehle sahi login par upgrade
       hota hai — dekhein verifyPassword(). */
    legacyPasswordHash: { type: String, select: false },
    plan: { type: userPlanSchema, default: null },
  },
  {
    timestamps: true,
    // hash yahan bhi hata rahe hain — select:false sirf query ko rokta hai,
    // login ke baad wale document ko nahi
    toJSON: jsonOptions(["passwordHash", "legacyPasswordHash"]),
    toObject: jsonOptions(["passwordHash", "legacyPasswordHash"]),
  },
);

/*
 * Naye account par password kisi na kisi form me hona hi chahiye.
 *
 * Ye check sirf `isNew` par chalta hai: baaki queries hash ko select nahi karti
 * (select: false), to purane document ko save karte waqt yahan hamesha khaali
 * dikhta — aur profile/plan update jaise saare save fail ho jaate.
 */
userSchema.pre("validate", function requirePassword(next) {
  if (this.isNew && !this.passwordHash && !this.legacyPasswordHash) {
    this.invalidate("passwordHash", "Password set nahi hua.");
  }
  next();
});

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
};

/**
 * Password check — bcrypt pehle. Purane SHA-256 account ke liye ek baar legacy
 * hash se compare hota hai aur sahi nikalne par turant bcrypt me upgrade kar
 * diya jaata hai, taaki purana hash dobara kabhi use na ho.
 */
userSchema.methods.verifyPassword = async function verifyPassword(plain) {
  if (this.passwordHash) return bcrypt.compare(plain, this.passwordHash);

  if (this.legacyPasswordHash) {
    if (legacyHash(plain) !== this.legacyPasswordHash) return false;
    await this.setPassword(plain);
    this.legacyPasswordHash = undefined;
    await this.save();
    return true;
  }

  return false;
};

/** Plan abhi chal raha hai ya nahi — website/admin ke `isPlanActive` se same logic. */
userSchema.methods.hasActivePlan = function hasActivePlan() {
  const plan = this.plan;
  if (!plan) return false;
  if (plan.expiresAt !== null && plan.expiresAt < Date.now()) return false;
  return plan.credits === null || plan.credits > 0;
};

/** Email ya 10-digit mobile — dono se login hota hai. */
userSchema.statics.findByIdentifier = function findByIdentifier(identifier) {
  const email = normalizeEmail(identifier);
  const phone = normalizePhone(identifier);
  const or = [{ email }];
  if (phone.length === 10) or.push({ phone });
  return this.findOne({ $or: or }).select("+passwordHash +legacyPasswordHash");
};

export const User = mongoose.model("User", userSchema);
