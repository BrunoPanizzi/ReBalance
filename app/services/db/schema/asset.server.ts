import {
  integer,
  pgEnum,
  pgTable,
  real,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { wallet } from './wallet.server'
import { user } from './user.server'

export const assetType = [
  'br-stock', //    [✅] everything listed on bovespa
  'br-bond', //     [❌] tesouro direto e renda fixa privada
  'usa-stock', //   [❌] nasdaq, nyse, etc
  'usa-bond', //    [❌] all us bonds, still need research
  'fixed-value', // [❌] just a fixed total value wallet,
] as const

export type AssetType = (typeof assetType)[number]

export const assetTypeEnum = pgEnum('asset_type', assetType)

export const asset = pgTable('asset', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: varchar('name', { length: 10 }).notNull(),
  type: assetTypeEnum('asset_type').notNull(),
  amount: integer('amount').default(0).notNull(),
  price: real('price').default(0),

  walletId: uuid('wallet_id')
    .references(() => wallet.id)
    .notNull(),
  owner: uuid('owner')
    .references(() => user.uid)
    .notNull(),
})

export const assetRelations = relations(asset, ({ one }) => ({
  wallet: one(wallet, {
    fields: [asset.walletId],
    references: [wallet.id],
  }),
  owner: one(user, {
    fields: [asset.owner],
    references: [user.uid],
  }),
}))

export const assetSchema = createSelectSchema(asset, {
  id: z.string().uuid().min(1),
  name: z.string().min(1),
  amount: z.number().int().nonnegative(),
  price: z.number().optional(),
  walletId: z.string().uuid().min(1),
  owner: z.string().uuid().min(1),
})

export const newAssetSchema = createInsertSchema(asset, {
  name: z.string().min(1),
  amount: z.number().int().nonnegative(),
  price: z.number().nonnegative().optional(),
  walletId: z.string().uuid().min(1),
  owner: z.string().uuid().min(1),
})

export const updateAssetSchema = z.object({
  id: z.string().uuid().min(1),
  amount: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
})

export type Asset = z.infer<typeof assetSchema>
export type NewAsset = z.infer<typeof newAssetSchema>
export type UpdateAsset = z.infer<typeof updateAssetSchema>
