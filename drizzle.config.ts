import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { config } from "./src/config/drizzle";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/drizzle",
  dbCredentials: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  },
});
