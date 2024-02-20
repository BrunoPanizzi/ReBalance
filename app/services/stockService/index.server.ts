import { and, eq } from 'drizzle-orm'

import { db } from '../db/index.server'
import { stock, stock as stockTable } from '../db/schema/stock.server'
import type { Stock, UpdateStocks } from '../db/schema/stock.server'

import MarketService from '../maketService/index.server'

type PersistanceStock = Stock

export type DomainStock = Omit<PersistanceStock, 'owner'>
export type NewStock = Omit<DomainStock, 'id' | 'walletId'>

export type StockWithPrice = DomainStock & {
  price: number
  totalValue: number
  percentage: number
}

function toDomain(stock: PersistanceStock): DomainStock {
  return {
    id: stock.id,
    ticker: stock.ticker,
    amount: stock.amount,
    walletId: stock.walletId,
  }
}

class StockService {
  async getStocksByWallet(
    uid: string,
    walletId: string,
  ): Promise<DomainStock[]> {
    const stocks = await db
      .select()
      .from(stockTable)
      .where(and(eq(stockTable.owner, uid), eq(stockTable.walletId, walletId)))

    return stocks.map(toDomain)
  }

  async getStocksByWalletWithPrices(
    uid: string,
    walletId: string,
  ): Promise<StockWithPrice[]> {
    const stocks = await this.getStocksByWallet(uid, walletId)

    const stocksWithPrices = await Promise.all(
      stocks.map((s) =>
        MarketService.getStockData(s.ticker).then(({ regularMarketPrice }) => ({
          ...s,
          price: regularMarketPrice,
          totalValue: s.amount * regularMarketPrice,
        })),
      ),
    )

    const totalValue = stocksWithPrices.reduce((a, s) => a + s.totalValue, 0)

    const stocksWithPricesAndPercentages: StockWithPrice[] =
      stocksWithPrices.map((s) => ({
        ...s,
        percentage: s.totalValue / totalValue,
      }))

    return stocksWithPricesAndPercentages
  }

  async createStock(
    uid: string,
    walletId: string,
    newStock: NewStock,
  ): Promise<DomainStock> {
    const walletStocks = await this.getStocksByWallet(uid, walletId)

    const sameTicker = walletStocks.find((s) => s.ticker === newStock.ticker)

    if (sameTicker) {
      throw new Error('Ticker already in use for this wallet')
    }

    const [created] = await db
      .insert(stockTable)
      .values({
        owner: uid,
        walletId,
        ticker: newStock.ticker,
        amount: newStock.amount,
      })
      .returning()

    return toDomain(created)
  }

  async updateAmount(
    uid: string,
    walletId: string,
    stockId: string,
    amount: number,
  ): Promise<DomainStock> {
    const [updated] = await db
      .update(stockTable)
      .set({
        amount,
      })
      .where(
        and(
          eq(stockTable.owner, uid),
          eq(stockTable.walletId, walletId),
          eq(stockTable.id, stockId),
        ),
      )
      .returning()

    return toDomain(updated)
  }

  async deleteStock(
    uid: string,
    walletId: string,
    stockId: string,
  ): Promise<void> {
    await db
      .delete(stockTable)
      .where(
        and(
          eq(stockTable.owner, uid),
          eq(stockTable.walletId, walletId),
          eq(stockTable.id, stockId),
        ),
      )
  }

  // removes all the stocks from the table
  async deleteStocksFromWallet(uid: string, walletId: string): Promise<void> {
    await db
      .delete(stockTable)
      .where(and(eq(stockTable.owner, uid), eq(stockTable.walletId, walletId)))
  }
}

export default new StockService()
