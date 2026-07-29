import mongoose from "mongoose";
import { jsonOptions, publicId } from "./shared.js";

/*
 * Customer feedback. Koi bhi bhej sakta hai — "pending" me jaata hai aur admin
 * approve kare tabhi website par dikhta hai.
 */
const testimonialSchema = new mongoose.Schema(
  {
    id: publicId,
    name: { type: String, required: true, trim: true, maxlength: 80 },
    locality: { type: String, default: "", trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    status: { type: String, enum: ["pending", "approved"], default: "pending", index: true },
    /** Kisne bheja (logged-in ho to) — moderation ke liye. */
    authorId: { type: String, default: null },
    /** epoch ms — website isi format me sort/display karti hai. */
    createdAt: { type: Number, default: () => Date.now() },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: jsonOptions(["authorId"]),
    toObject: jsonOptions(),
  },
);

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
