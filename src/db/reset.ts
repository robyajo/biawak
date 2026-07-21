import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { config } from "../config/drizzle.js";
import { seed } from "./seed.js";
import fs from "node:fs";

async function reset() {
  console.log(`🔄 Resetting ${config.DB_DRIVER.toUpperCase()} database...`);

  try {
    if (config.DB_DRIVER === "mysql") {
      console.log("🗑️ Resetting MySQL database...");
      await (db as any).execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
      await (db as any).execute(sql`DROP DATABASE IF EXISTS \`${sql.raw(config.DB_NAME)}\`;`);
      await (db as any).execute(sql`CREATE DATABASE \`${sql.raw(config.DB_NAME)}\`;`);
      await (db as any).execute(sql`USE \`${sql.raw(config.DB_NAME)}\`;`);
      await (db as any).execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
      console.log("✅ Database reset successfully!");
    } else {
      console.log(`🗑️ Resetting SQLite database (${config.DB_FILE_NAME})...`);
      if (fs.existsSync(config.DB_FILE_NAME)) {
        fs.unlinkSync(config.DB_FILE_NAME);
        console.log(`✅ Removed existing ${config.DB_FILE_NAME}`);
      }
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
