import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { wallet } from './wallet.server'
import { user } from './user.server'

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
