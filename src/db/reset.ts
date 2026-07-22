import "dotenv/config";
import { sql } from "drizzle-orm";
import { config } from "../config/drizzle.js";
import fs from "node:fs";

async function reset() {
  console.log(`🔄 Resetting ${config.DB_DRIVER.toUpperCase()} database...`);

  try {
    if (config.DB_DRIVER === "mysql") {
      const { db } = await import("./index.js");
      console.log("🗑️ Resetting MySQL database...");
      await (db as any).execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
      await (db as any).execute(sql`DROP DATABASE IF EXISTS \`${sql.raw(config.DB_NAME)}\`;`);
      await (db as any).execute(sql`CREATE DATABASE \`${sql.raw(config.DB_NAME)}\`;`);
      await (db as any).execute(sql`USE \`${sql.raw(config.DB_NAME)}\`;`);
      await (db as any).execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
      console.log("✅ Database reset successfully!");

      // Run migrations for MySQL programmatically if they exist
      const migrationsFolder = "./src/db/drizzle/mysql";
      const hasMigrations = fs.existsSync(migrationsFolder) && fs.readdirSync(migrationsFolder).some(file => file.endsWith(".sql"));
      if (hasMigrations) {
        console.log("🔄 Running migrations on MySQL database...");
        const { migrate } = await import("drizzle-orm/mysql2/migrator");
        await migrate(db, { migrationsFolder });
        console.log("✅ Migrations completed successfully!");
      } else {
        console.log("ℹ️ No migrations found to run for MySQL.");
      }
    } else {
      console.log(`🗑️ Resetting SQLite database (${config.DB_FILE_NAME})...`);
      if (fs.existsSync(config.DB_FILE_NAME)) {
        fs.unlinkSync(config.DB_FILE_NAME);
        console.log(`✅ Removed existing ${config.DB_FILE_NAME}`);
      }

      // Now import db dynamically so it creates/opens a fresh SQLite file
      const { db } = await import("./index.js");

      // Run migrations for SQLite programmatically if they exist
      const migrationsFolder = "./src/db/drizzle/sqlite";
      const hasMigrations = fs.existsSync(migrationsFolder) && fs.readdirSync(migrationsFolder).some(file => file.endsWith(".sql"));
      if (hasMigrations) {
        console.log("🔄 Running migrations on SQLite database...");
        const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
        await migrate(db, { migrationsFolder });
        console.log("✅ Migrations completed successfully!");
      } else {
        console.log("ℹ️ No migrations found to run for SQLite.");
      }
    }

    // Check if --seed argument is passed
    const shouldSeed = process.argv.includes("--seed");
    if (shouldSeed) {
      console.log("🌱 --seed flag detected. Starting seeding...");
      const { seed } = await import("./seed.js");
      await seed();
    }
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

reset().then(() => process.exit(0));
