import { createApp } from "./app.js";
import { connectDb, disconnectDb, safeUri } from "./config/db.js";
import { assertProductionConfig, env } from "./config/env.js";
import { seedIfEmpty } from "./seed/seed.js";

/*
 * Entry point.
 *
 * Order jaan-boojh kar aisa hai: config check → DB connect → seed → listen.
 * DB ke bina server up hona sabse bura case hai (har request 500 deti hai aur
 * frontend ko lagta hai backend chal raha hai), isliye connect fail hote hi
 * process exit kar jaata hai.
 */

async function main() {
  assertProductionConfig();

  try {
    await connectDb();
  } catch (err) {
    console.error(`\n  MongoDB se connect nahi ho paaya → ${safeUri()}`);
    console.error(`  ${err.message}\n`);
    console.error("  Check karein:");
    console.error("    1. MongoDB chal raha hai? (Windows: Get-Service MongoDB)");
    console.error("    2. .env me MONGODB_URI sahi hai?");
    console.error("    3. Atlas use kar rahe hain to IP whitelist me hai?\n");
    process.exit(1);
  }

  if (env.seedOnStart) {
    const summary = await seedIfEmpty();
    if (Object.keys(summary).length) console.log("[seed]", summary);
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`\n  Indore Dera API → http://localhost:${env.port}`);
    console.log(`  Health           → http://localhost:${env.port}/health`);
    console.log(`  Database         → ${safeUri()}`);
    console.log(`  CORS allowed     → ${env.corsOrigins.join(", ")}`);
    if (!env.isProd) console.log(`  Admin login      → ${env.admin.email} / ${env.admin.password}`);
    console.log("");
  });

  /* Bina iske listen fail hone par Node raw 'error' event throw karta hai aur
     poora stack trace ugal deta hai — jabki asli wajah hamesha ek hi hoti hai:
     purana server abhi bhi chal raha hai. */
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n  Port ${env.port} pehle se use me hai — purana server abhi chal raha hai.\n`);
      console.error("  Use band karne ke liye (PowerShell):");
      console.error(
        `    Get-NetTCPConnection -LocalPort ${env.port} -State Listen | ` +
          "ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n",
      );
      console.error(`  Ya doosre port par chalayein:  PORT=4001 npm run dev\n`);
    } else {
      console.error("\n  Server start nahi ho paaya:", err.message, "\n");
    }
    void disconnectDb().finally(() => process.exit(1));
  });

  /* Graceful shutdown — nahi karein to nodemon/--watch restart par purana
     process port pakde rehta hai aur "EADDRINUSE" aata hai. */
  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} — band kar rahe hain...`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    // 10 sec me clean band na ho to zabardasti
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("[api] unhandled rejection:", reason);
  });
}

await main();
