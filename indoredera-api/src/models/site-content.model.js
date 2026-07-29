import mongoose from "mongoose";
import { jsonOptions } from "./shared.js";

/*
 * Hero/landing ka editable text. Ye singleton hai — collection me hamesha ek hi
 * document rehta hai (`key: "site"`), isliye admin ko kabhi id yaad nahi rakhni.
 */

const heroSchema = new mongoose.Schema(
  {
    logoText: { type: String, default: "Indore Dera" },
    logoTagline: { type: String, default: "अपना घर, अपना शहर" },
    badge: { type: String, default: "" },
    titleStart: { type: String, default: "" },
    titleHighlight: { type: String, default: "" },
    titleEnd: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    searchCta: { type: String, default: "Search" },
    ownerCta: { type: String, default: "" },
    /** Logged-out visitors ko dikhne wala gate. */
    lockedTitle: { type: String, default: "" },
    lockedSubtitle: { type: String, default: "" },
  },
  { _id: false },
);

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true, immutable: true },
    hero: { type: heroSchema, default: () => ({}) },
  },
  { timestamps: true, toJSON: jsonOptions(["key"]), toObject: jsonOptions() },
);

/** Document na ho to bana deta hai — pehle request par crash na ho. */
siteContentSchema.statics.singleton = async function singleton() {
  return this.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: { key: "site" } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);
export { heroSchema };
