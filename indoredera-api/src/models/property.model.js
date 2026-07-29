import mongoose from "mongoose";
import { jsonOptions, publicId } from "./shared.js";

export const PROPERTY_TYPES = ["flat", "room", "shop", "pg", "land"];
export const FURNISHINGS = ["Furnished", "Semi-Furnished", "Unfurnished"];
export const LISTING_STATUSES = ["draft", "pending", "approved"];

/** "2 din pehle" — createdAt se har baar taaza banta hai, store nahi hota. */
export function relativeTime(epochMs) {
  const days = Math.floor((Date.now() - (epochMs ?? Date.now())) / 86_400_000);
  if (days <= 0) return "abhi";
  if (days === 1) return "1 din pehle";
  if (days < 7) return `${days} din pehle`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 hafta pehle";
  if (weeks < 5) return `${weeks} hafte pehle`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "1 mahina pehle" : `${months} mahine pehle`;
}

/* Frontend `postedAgo` string expect karta hai. Use store karne par wo purana
   pad jaata ("2 din pehle" hamesha ke liye atak jaata), isliye serialize karte
   waqt banate hain. */
function withPostedAgo() {
  const base = jsonOptions();
  return {
    ...base,
    transform(doc, ret) {
      const out = base.transform(doc, ret);
      out.postedAgo = relativeTime(out.createdAt);
      return out;
    },
  };
}

/*
 * Listing. Field names bilkul wahi hain jo website ka `Property` type use karta
 * hai — isse dono taraf ka data bina mapping ke seedha chalta hai.
 */
const propertySchema = new mongoose.Schema(
  {
    id: publicId,
    title: { type: String, required: true, trim: true, maxlength: 160 },
    /** Hindi title — owner form me alag nahi poochha jaata, isliye title ki copy. */
    titleHi: { type: String, default: "", trim: true, maxlength: 160 },
    type: { type: String, enum: PROPERTY_TYPES, required: true, index: true },
    locality: { type: String, required: true, trim: true, index: true },
    road: { type: String, trim: true },
    rent: { type: Number, required: true, min: 0 },
    deposit: { type: Number, default: 0, min: 0 },
    area: { type: String, default: "", trim: true },
    bhk: { type: String, trim: true },
    furnishing: { type: String, enum: FURNISHINGS, default: "Unfurnished" },
    preferred: { type: String, default: "Anyone", trim: true },

    /** Cover photo — card aur og:image me yahi jaati hai. */
    image: { type: String, required: true },
    /** Poori gallery (cover samet). */
    images: { type: [String], default: undefined },

    featured: { type: Boolean, default: false },
    amenities: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    description: { type: String, default: "", maxlength: 4000 },

    /* Owner ka snapshot listing par rakha jaata hai taaki har card ke liye
       users collection join na karna pade. Profile update par sync hota hai. */
    ownerId: { type: String, index: true },
    ownerName: { type: String, default: "Owner" },
    ownerPhone: { type: String },

    status: { type: String, enum: LISTING_STATUSES, default: "pending", index: true },
    /** epoch ms — frontend isi format me sort karta hai. */
    createdAt: { type: Number, default: () => Date.now() },
  },
  {
    // createdAt hum khud epoch ms me rakhte hain, isliye sirf updatedAt Mongoose se
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: withPostedAgo(),
    toObject: withPostedAgo(),
  },
);

/* Universal search — website ka `matchesQuery` client par filter karta hai, par
   list endpoint par bhi text search chahiye jab listings zyada ho jaayein. */
propertySchema.index({
  title: "text",
  titleHi: "text",
  locality: "text",
  road: "text",
  description: "text",
  amenities: "text",
});

/** Public listing feed ke liye — sirf approved, naye pehle. */
propertySchema.statics.publicFeed = function publicFeed(filter = {}) {
  return this.find({ ...filter, status: "approved" }).sort({ createdAt: -1 });
};

export const Property = mongoose.model("Property", propertySchema);
