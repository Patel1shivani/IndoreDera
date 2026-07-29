import mongoose from "mongoose";
import { connectDb, disconnectDb, safeUri } from "../config/db.js";

/*
 * Ek nazar me batata hai ki .env wala MONGODB_URI kis database par ja raha hai
 * aur usme abhi kitna data hai — `npm run db:check`.
 *
 * Sabse aam confusion isi se hal hota hai: "data store nahi ho raha" aksar iska
 * matlab hota hai ki app kisi doosre database (local vs Atlas) par likh raha hai.
 */

const KNOWN = ["users", "properties", "testimonials", "banners", "plans", "sitecontents"];

try {
  await connectDb();

  const db = mongoose.connection.db;
  const present = (await db.listCollections().toArray()).map((c) => c.name);
  const names = [...new Set([...KNOWN, ...present])].sort();

  console.log(`\n  Database → ${safeUri()}`);
  console.log(`  Name     → ${mongoose.connection.name}\n`);

  let total = 0;
  for (const name of names) {
    const count = present.includes(name) ? await db.collection(name).countDocuments() : 0;
    total += count;
    const mark = present.includes(name) ? " " : "!"; // ! = collection abhi bani hi nahi
    console.log(`  ${mark} ${name.padEnd(16)} ${String(count).padStart(5)}`);
  }

  console.log(
    total === 0
      ? "\n  Database khaali hai — API ek baar chala dein (SEED_ON_START=true seed kar dega).\n"
      : `\n  Kul ${total} documents.\n`,
  );
} catch (err) {
  console.error("[db:check] connect nahi ho paaya:", err.message);
  process.exitCode = 1;
} finally {
  await disconnectDb();
}
