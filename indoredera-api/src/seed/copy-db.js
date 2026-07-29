import mongoose from "mongoose";
import { env } from "../config/env.js";
import { safeUri } from "../config/db.js";

/*
 * Ek database ka poora data doosre me copy karta hai — mainly local mongod se
 * MongoDB Atlas par shift karne ke liye.
 *
 *   npm run db:copy -- --from "mongodb://127.0.0.1:27017/indoredera"
 *   npm run db:copy -- --from "mongodb://127.0.0.1:27017/indoredera" --to "mongodb+srv://..."
 *   npm run db:copy -- --from "..." --drop      # target collections pehle khaali kar dein
 *
 * `--to` na dein to .env ka MONGODB_URI target banta hai (yaani aapka naya Atlas
 * cluster). Copy `_id` par upsert hota hai, isliye dobara chalane par duplicate
 * nahi bante — sirf update hota hai.
 *
 * Mongoose models jaan-boojh kar use nahi kiye: ye raw copy hai, taaki validation
 * ya defaults purane documents ko badal na dein.
 */

const { MongoClient } = mongoose.mongo;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const fromUri = arg("from");
const toUri = arg("to") ?? env.mongoUri;
const drop = process.argv.includes("--drop");

if (!fromUri) {
  console.error('\n  --from chahiye. Example:\n    npm run db:copy -- --from "mongodb://127.0.0.1:27017/indoredera"\n');
  process.exit(1);
}

if (fromUri === toUri) {
  console.error("\n  --from aur --to ek hi database hai — copy ka koi matlab nahi.\n");
  process.exit(1);
}

const source = new MongoClient(fromUri, { serverSelectionTimeoutMS: 10000 });
const target = new MongoClient(toUri, { serverSelectionTimeoutMS: 15000 });

try {
  await source.connect();
  await target.connect();

  const srcDb = source.db();
  const dstDb = target.db();

  console.log(`\n  From → ${safeUri(fromUri)} (db: ${srcDb.databaseName})`);
  console.log(`  To   → ${safeUri(toUri)} (db: ${dstDb.databaseName})\n`);

  // system.* collections chhod dete hain — wo MongoDB ki apni hain
  const collections = (await srcDb.listCollections().toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."));

  if (!collections.length) {
    console.log("  Source database khaali hai — copy karne ko kuch nahi.\n");
  }

  for (const name of collections) {
    const docs = await srcDb.collection(name).find({}).toArray();
    if (drop) await dstDb.collection(name).deleteMany({});

    if (!docs.length) {
      console.log(`  ${name.padEnd(16)} 0 documents`);
      continue;
    }

    const ops = docs.map((doc) => ({
      replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
    }));
    const res = await dstDb.collection(name).bulkWrite(ops, { ordered: false });
    const written = (res.upsertedCount ?? 0) + (res.modifiedCount ?? 0);
    console.log(`  ${name.padEnd(16)} ${String(docs.length).padStart(5)} copy → ${written} likhe gaye`);
  }

  /* Indexes bhi le aate hain — inke bina unique email/phone jaise rules naye
     database par lagoo nahi honge. _id ka default index chhod dete hain. */
  for (const name of collections) {
    const indexes = await srcDb.collection(name).indexes();
    for (const idx of indexes) {
      if (idx.name === "_id_") continue;
      const { key, name: idxName, v, ...options } = idx;
      try {
        await dstDb.collection(name).createIndex(key, { name: idxName, ...options });
      } catch (err) {
        console.warn(`  ! index ${name}.${idxName}: ${err.message}`);
      }
    }
  }

  console.log("\n  Ho gaya. Verify karne ke liye: npm run db:check\n");
} catch (err) {
  console.error("\n[db:copy] fail:", err.message, "\n");
  process.exitCode = 1;
} finally {
  await source.close().catch(() => {});
  await target.close().catch(() => {});
}
