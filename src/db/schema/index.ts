import * as mysqlSchema from "./mysql/index.js";
import * as sqliteSchema from "./sqlite/index.js";

const isMysql = process.env.DB_DRIVER === "mysql";

const activeSchema = isMysql ? mysqlSchema : sqliteSchema;

export const user = activeSchema.user;
export const session = activeSchema.session;
export const account = activeSchema.account;
export const verification = activeSchema.verification;
export const refreshToken = activeSchema.refreshToken;
export const sosialMedia = activeSchema.sosialMedia;
