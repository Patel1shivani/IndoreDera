import mongoose from "mongoose";
import { jsonOptions } from "./shared.js";

/*
 * Plan catalog. Ye admin ka editable price list hai — user ke paas jo plan hai
 * wo User document me embed hota hai (`user.plan`), taaki price badalne par
 * purane subscribers ka plan na badle.
 *
 * Yahan `id` random UUID nahi hai — "one-time"/"monthly"/"yearly" jaise
 * readable slugs hain jo purchase URLs me dikhte hain.
 */
const planSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    price: { type: Number, required: true, min: 0 },
    /** Price ke aage dikhne wala text — "/ month", "ek listing". */
    period: { type: String, default: "", trim: true, maxlength: 40 },
    /** null = unlimited listings */
    credits: { type: Number, default: null },
    /** null = expire nahi hota */
    durationDays: { type: Number, default: null },
    perks: { type: [String], default: [] },
    highlight: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: jsonOptions(), toObject: jsonOptions() },
);

/** Plan kharidne par user par jo snapshot chipkta hai. */
planSchema.methods.toUserPlan = function toUserPlan() {
  return {
    id: this.id,
    label: this.label,
    credits: this.credits,
    expiresAt: this.durationDays ? Date.now() + this.durationDays * 86_400_000 : null,
  };
};

export const Plan = mongoose.model("Plan", planSchema);
