import { relations } from 'drizzle-orm'
import { pgTable, real, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { user } from './user.server'
import { pgColorEnum, colorsSchema } from './color.server'
import { type Stock, stock, stockSchema } from './stock.server'

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

export type WalletWithStocks = Wallet & {
  stocks: Stock[]
}

export const walletWithStocksSchema = walletSchema.extend({
  stocks: z.array(stockSchema),
})
