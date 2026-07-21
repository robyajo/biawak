import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { user } from "./user.js";

export const sosialMedia = mysqlTable("sosial_media", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 100 }).notNull(),
  url: text("url").notNull(),
  username: varchar("username", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
