import { SQL, and, eq, sql } from 'drizzle-orm'

import { db } from '~/services/db/index.server'

import {
  wallet as walletTable,
  walletSchema,
} from '~/services/db/schema/wallet.server'
import type { Wallet } from '~/services/db/schema/wallet.server'

import StocksService, {
  DomainStock,
  StockWithPrice,
} from '../stockService/index.server'

type PersistanceWallet = Wallet

export type NewWallet = Omit<PersistanceWallet, 'owner' | 'id'>
export type UpdateWallet = Partial<NewWallet>

export type DomainWallet = Omit<PersistanceWallet, 'owner'>

export type WalletWithStocks = DomainWallet & {
  stocks: DomainStock[]
}
export type FullWalletWithStocks = DomainWallet & {
  totalValue: number
  realPercentage: number
  stocks: StockWithPrice[]
}

function toDomain(wallet: PersistanceWallet): DomainWallet {
  return {
    id: wallet.id,
    title: wallet.title,
    color: wallet.color,
    idealPercentage: wallet.idealPercentage,
  }
}

class WalletService {
  async getWallet(uid: string, id: string): Promise<DomainWallet> {
    const [wallet] = await db
      .select()
      .from(walletTable)
      .where(and(eq(walletTable.id, id), eq(walletTable.owner, uid)))

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    return toDomain(wallet)
  }

  /**
   * Returns a full wallet, with full stocks.
   *
   * The `realPercentage` field is always set to -1, becuase it is not calculated.
   */
  async getFullWallet(uid: string, id: string): Promise<FullWalletWithStocks> {
    const wallet = await this.getWallet(uid, id)

    const stocks = await StocksService.getStocksByWalletWithPrices(uid, id)

    const totalValue = stocks.reduce((a, s) => a + s.totalValue, 0)

    return { ...wallet, stocks, totalValue, realPercentage: -1 }
  }

  async getWallets(uid: string): Promise<DomainWallet[]> {
    const wallets = await db
      .select()
      .from(walletTable)
      .where(eq(walletTable.owner, uid))
      .orderBy(walletTable.title)

    return wallets.map(toDomain)
  }

  async getFullWallets(uid: string): Promise<FullWalletWithStocks[]> {
    const wallets = await this.getWallets(uid)

    // fills total value and stocks, missign realPercentage
    const walletsWithStocks = await Promise.all(
      wallets.map((w) =>
        StocksService.getStocksByWalletWithPrices(uid, w.id).then((stocks) => ({
          ...w,
          totalValue: stocks.reduce((a, s) => a + s.totalValue, 0),
          stocks,
        })),
      ),
    )

    const totalTotalValue = walletsWithStocks.reduce(
      (a, w) => a + w.totalValue,
      0,
    )

    // add realPercentage
    return walletsWithStocks.map((w) => ({
      ...w,
      realPercentage: w.totalValue / totalTotalValue,
    }))
  }

  async createWallet(uid: string, wallet: NewWallet): Promise<DomainWallet> {
    const [newWallet] = await db
      .insert(walletTable)
      .values({
        ...wallet,
        owner: uid,
      })
      .returning()

    return toDomain(newWallet)
  }

  async update(
    uid: string,
    walletId: string,
    updateFields: UpdateWallet,
  ): Promise<DomainWallet> {
    const [updated] = await db
      .update(walletTable)
      .set({
        color: updateFields.color,
        idealPercentage: updateFields.idealPercentage,
        title: updateFields.title,
      })
      .where(and(eq(walletTable.owner, uid), eq(walletTable.id, walletId)))
      .returning()

    return updated
  }

  async updateIdealPercentages(
    uid: string,
    updateWallets: Pick<DomainWallet, 'id' | 'idealPercentage'>[],
  ): Promise<DomainWallet[]> {
    const sqlChunks: SQL[] = []
    const idsChunks: SQL[] = []

    updateWallets.forEach((w) => {
      idsChunks.push(sql`${w.id}`)
    })

    const finalIds = sql.join(idsChunks, sql.raw(','))

    sqlChunks.push(sql`update ${walletTable} set "ideal_percentage"`)

    sqlChunks.push(sql`= case`)

    updateWallets.forEach((w) => {
      sqlChunks.push(
        sql`when "id" = ${w.id} and "owner" = ${uid} then ${w.idealPercentage}`,
      )
    })

    sqlChunks.push(sql`else "ideal_percentage"`)
    sqlChunks.push(sql`end`)

    sqlChunks.push(sql`where "id" in (${finalIds})`)

    sqlChunks.push(sql`returning *, ideal_percentage as "idealPercentage"`)

    const finalSql = sql.join(sqlChunks, sql.raw(' '))

    const res = await db.execute(finalSql)

    console.log(res)

    return res.map((w) => toDomain(walletSchema.parse(w)))
  }

  async deleteWallet(uid: string, walletId: string): Promise<void> {
    await StocksService.deleteStocksFromWallet(uid, walletId)
    await db
      .delete(walletTable)
      .where(and(eq(walletTable.owner, uid), eq(walletTable.id, walletId)))
  }
}

export default new WalletService()
