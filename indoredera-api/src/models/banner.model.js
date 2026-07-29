import mongoose from "mongoose";
import { jsonOptions, publicId } from "./shared.js";

export const AUDIENCES = ["guest", "user", "owner"];

/*
 * Home page ke promo strips. Har banner ek audience ka hota hai —
 * logged-out visitor, logged-in tenant, ya owner.
 */
const bannerSchema = new mongoose.Schema(
  {
    id: publicId,
    audience: { type: String, enum: AUDIENCES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: "", trim: true, maxlength: 300 },
    image: { type: String, default: "" },
    ctaLabel: { type: String, default: "", trim: true, maxlength: 60 },
    active: { type: Boolean, default: true, index: true },
    /** Ek audience ke andar order — chhota number pehle. */
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: jsonOptions(), toObject: jsonOptions() },
);

export const Banner = mongoose.model("Banner", bannerSchema);
