import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const driver = process.env.DB_DRIVER || "sqlite";

export default defineConfig(
  driver === "mysql"
    ? {
        dialect: "mysql",
        schema: "./src/db/schema/mysql/index.ts",
        out: "./src/db/drizzle/mysql",
        dbCredentials: {
          host: process.env.DB_HOST || "127.0.0.1",
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER || "root",
          password: process.env.DB_PASSWORD || "",
          database: process.env.DB_NAME || "biawak",
        },
      }
    : {
        dialect: "sqlite",
        schema: "./src/db/schema/sqlite/index.ts",
        out: "./src/db/drizzle/sqlite",
        dbCredentials: {
          url: process.env.DB_FILE_NAME || "sqlite.db",
        },
      }
);
