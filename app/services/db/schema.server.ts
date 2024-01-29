import { relations } from 'drizzle-orm'
import {
  pgTable,
  real,
  text,
  uuid,
  varchar,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { colorsSchema } from '~/constants/availableColors'

// colors
const pgColorEnum = pgEnum('color', colorsSchema.options)

export { pgColorEnum }

// User
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

// Wallets
export const wallet = pgTable('wallet', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  title: text('title').notNull(),
  totalValue: real('total_value').default(0).notNull(),
  idealPercentage: real('ideal_percentage').default(0).notNull(),
  realPercentage: real('real_percentage').default(0).notNull(),
  color: pgColorEnum('color').notNull(),

  owner: uuid('owner')
    .notNull()
    .references(() => user.uid),
})

export const walletRelations = relations(wallet, ({ one, many }) => ({
  owner: one(user, {
    fields: [wallet.owner],
    references: [user.uid],
  }),
  stocks: many(stock),
}))

export const walletSchema = createSelectSchema(wallet, {
  title: z.string().min(1),
  totalValue: z.number().nonnegative(),
  idealPercentage: z.number().min(0).max(1),
  realPercentage: z.number().min(0).max(1),
  color: colorsSchema,
  id: z.string().uuid(),
  owner: z.string().uuid().min(1),
})

export const newWalletSchema = createInsertSchema(wallet, {
  title: z.string().min(1),
  idealPercentage: z.number().min(0).max(1),
  color: colorsSchema,
  owner: z.string().uuid().min(1),
})

export const updateWalletSchema = walletSchema
  .omit({
    id: true,
    owner: true,
  })
  .partial()

export type Wallet = z.infer<typeof walletSchema>
export type NewWallet = z.infer<typeof newWalletSchema>
export type UpdateWallet = z.infer<typeof updateWalletSchema>

// stocks
export const stock = pgTable('stock', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  ticker: varchar('ticker', { length: 10 }).notNull(),
  amount: integer('amount').default(0).notNull(),

  walletId: uuid('wallet_id')
    .references(() => wallet.id)
    .notNull(),
  owner: uuid('owner')
    .references(() => user.uid)
    .notNull(),
})

export const stockRelations = relations(stock, ({ one }) => ({
  wallet: one(wallet, {
    fields: [stock.walletId],
    references: [wallet.id],
  }),
  owner: one(user, {
    fields: [stock.owner],
    references: [user.uid],
  }),
}))

export const stockSchema = createSelectSchema(stock, {
  id: z.string().uuid().min(1),
  ticker: z.string().min(1),
  amount: z.number().int().nonnegative(),
  walletId: z.string().uuid().min(1),
  owner: z.string().uuid().min(1),
})

export const newStockSchema = createInsertSchema(stock, {
  ticker: z.string().min(1),
  amount: z.number().int().nonnegative(),
  walletId: z.string().uuid().min(1),
  owner: z.string().uuid().min(1),
})

export const updateStocksSchema = z.array(
  z.object({
    id: z.string().uuid().min(1),
    amount: z.number().int().nonnegative(),
  }),
)

export type Stock = z.infer<typeof stockSchema>
export type NewStock = z.infer<typeof newStockSchema>
export type UpdateStocks = z.infer<typeof updateStocksSchema>

export type WalletWithStocks = Wallet & {
  stocks: Stock[]
}

export const walletWithStocksSchema = walletSchema.extend({
  stocks: z.array(stockSchema),
})

// feedbacks

export const feedbackTypeSchema = z.enum([
  'Elogios',
  'Sugestão',
  'Problemas',
  'Outros',
])

export const feedbackType = pgEnum('feedback_type', feedbackTypeSchema.options)

export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  type: feedbackType('type').notNull().default('Outros'),
  message: text('message').notNull(),
  userName: varchar('user_name', { length: 100 }),
  email: varchar('email', { length: 200 }),
})

export const feedbackSchema = createSelectSchema(feedback, {
  id: z.string().uuid().min(1),
  type: feedbackTypeSchema,
  message: z.string().min(1),
  userName: z.string().nullable(),
  email: z.string().email().nullable(),
})

export const newFeedbackSchema = createInsertSchema(feedback, {
  type: feedbackTypeSchema,
  message: z.string().min(1),
  userName: z.string().nullable(),
  email: z.string().email().nullable(),
})

export type Feedback = z.infer<typeof feedbackSchema>
export type NewFeedback = z.infer<typeof newFeedbackSchema>
