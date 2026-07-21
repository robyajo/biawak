import { config } from "../config/drizzle.js";
import * as schemaFiles from "./schema/index.js";
import * as relationsFiles from "./relations.js";
import { drizzle as drizzleBunSqlite } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { Database } from "bun:sqlite";

export const schema = { ...schemaFiles, ...relationsFiles };

function createDbConnection() {
  if (config.DB_DRIVER === "mysql") {
    const pool = mysql.createPool({
      host: config.DB_HOST,
      port: Number(config.DB_PORT),
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    if (!(pool as any).config) {
      (pool as any).config = (pool as any).pool?.config || {};
    }

    return {
      db: drizzleMysql({ client: pool, schema } as any),
      connectionPool: pool,
    };
  }

  // SQLite (default) using Bun native bun:sqlite
  const sqliteClient = new Database(config.DB_FILE_NAME);
  return {
    db: drizzleBunSqlite({ client: sqliteClient, schema } as any),
    connectionPool: null,
  };
}

const conn = createDbConnection();

export const db: any = conn.db;
export const connectionPool: any = conn.connectionPool;