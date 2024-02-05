import { relations } from 'drizzle-orm'
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { wallet } from './wallet.server'
import { stock } from './stock.server'

export const user = pgTable('user', {
  uid: uuid('uid').primaryKey().defaultRandom().notNull(),
  userName: text('user_name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  wallets: many(wallet),
  stocks: many(stock),
}))

export const userSchema = createSelectSchema(user, {
  email: z.string().min(1).email(),
  password: z.undefined(),
})
export const newUserSchema = createInsertSchema(user, {
  email: z.string().min(1).email(),
  password: z.string().min(1).min(6),
})
export const updateUserSchema = userSchema.omit({
  password: true,
  uid: true,
})

export type User = z.infer<typeof userSchema>
export type NewUser = z.infer<typeof newUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
