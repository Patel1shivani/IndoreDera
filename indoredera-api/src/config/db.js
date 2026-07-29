import mongoose from "mongoose";
import { env } from "./env.js";

/*
 * MongoDB connection.
 *
 * Mongoose khud reconnect karta hai, isliye pehle connect ke baad hum sirf
 * events log karte hain. Pehla connect fail ho to server start hi nahi hota —
 * aadha-chalu server (jo har request par 500 deta hai) usse bura hota hai.
 */

const REDACT = /\/\/([^:]+):([^@]+)@/;

/** URI ko log karne layak banata hai (password chhupa kar). */
export function safeUri(uri = env.mongoUri) {
  return uri.replace(REDACT, "//$1:***@");
}

let listenersBound = false;

function bindListeners() {
  if (listenersBound) return;
  listenersBound = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB se connection toot gaya — reconnect ki koshish jaari hai");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("[db] MongoDB se dobara connect ho gaya");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] MongoDB error:", err.message);
  });
}

export async function connectDb() {
  // strictQuery on = schema me na hone wale filter fields chup-chaap ignore ho
  mongoose.set("strictQuery", true);
  bindListeners();

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 8000,
    // base64 photos wali listings bhari hoti hain, thoda extra time
    socketTimeoutMS: 45000,
    autoIndex: !env.isProd, // production me indexes migration se banate hain
  });

  console.log(`[db] MongoDB connected → ${safeUri()} (db: ${mongoose.connection.name})`);
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.connection.close();
}

/** /health ke liye — 1 = connected. */
export function dbStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return {
    state: states[mongoose.connection.readyState] ?? "unknown",
    name: mongoose.connection.name ?? null,
  };
}
