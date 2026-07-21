import { relations } from "drizzle-orm";
import { user, account, session, refreshToken, sosialMedia } from "./schema/index.js";

export const userRelations = relations(user as any, (helpers: any) => ({
  sessions: helpers.many(session),
  accounts: helpers.many(account),
  refreshTokens: helpers.many(refreshToken),
  sosialMedias: helpers.many(sosialMedia),
}));

export const accountRelations = relations(account as any, (helpers: any) => ({
  user: helpers.one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session as any, (helpers: any) => ({
  user: helpers.one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const refreshTokenRelations = relations(refreshToken as any, (helpers: any) => ({
  user: helpers.one(user, {
    fields: [refreshToken.userId],
    references: [user.id],
  }),
}));

export const sosialMediaRelations = relations(sosialMedia as any, (helpers: any) => ({
  user: helpers.one(user, {
    fields: [sosialMedia.userId],
    references: [user.id],
  }),
}));



