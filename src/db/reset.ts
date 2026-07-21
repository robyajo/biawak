import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { config } from "../config/drizzle.js";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { seed } from "./seed.js";
import fs from "node:fs";

async function reset() {
  console.log("🔄 Resetting MySQL database...");

  try {
    console.log("🗑️ Resetting MySQL database...");
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
    await db.execute(sql`DROP DATABASE IF EXISTS \`${sql.raw(config.DB_NAME)}\`;`);
    await db.execute(sql`CREATE DATABASE \`${sql.raw(config.DB_NAME)}\`;`);
    await db.execute(sql`USE \`${sql.raw(config.DB_NAME)}\`;`);
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
    console.log("✅ Database reset successfully!");

    // Run migrations if migrations folder exists
    if (fs.existsSync("./src/db/drizzle")) {
      console.log("🔄 Running migrations...");
      await migrate(db, { migrationsFolder: "./src/db/drizzle" });
      console.log("✅ Migrations completed successfully!");
    } else {
      console.log("ℹ️ No migrations folder found, skipping migration step.");
    }

    // Check if --seed argument is passed
    const shouldSeed = process.argv.includes("--seed");
    if (shouldSeed) {
      console.log("🌱 --seed flag detected. Starting seeding...");
      await seed();
    }
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

reset().then(() => process.exit(0));
