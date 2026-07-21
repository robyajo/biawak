import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { config } from "../config/drizzle.js";
import * as schemaFiles from "./schema/index.js";
import * as relationsFiles from "./relations.js";

export const schema = { ...schemaFiles, ...relationsFiles };

export const connectionPool = mysql.createPool({
  host: config.DB_HOST,
  port: Number(config.DB_PORT),
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Ensure mysql2 PromisePool has config reference for drizzle-orm compatibility
if (!(connectionPool as any).config) {
  (connectionPool as any).config = (connectionPool as any).pool?.config || {};
}

export const db = drizzle({ client: connectionPool, schema } as any);