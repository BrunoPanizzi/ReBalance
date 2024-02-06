import { db } from '~/services/db/index.server'

import { wallet as walletTable } from '~/services/db/schema/wallet.server'
import type {
  NewWallet,
  Wallet,
  WalletWithStocks,
} from '~/services/db/schema/wallet.server'
import { Stock } from '../db/schema/stock.server'

import MarketService from '~/services/maketService/index.server'

export type StockWithPrice = Stock & {
  price: number
  totalValue: number
  percentage: number
}

export type WalletWithStocksAndPrices = Wallet & {
  stocks: StockWithPrice[]
}

// TODO: return Result type for better error handling
class WalletService {
  async getWallets(uid: string): Promise<Wallet[]> {
    const wallets = await db.query.wallet.findMany({
      where: (wallet, { eq }) => eq(wallet.owner, uid),
    })

    return wallets
  }

  async getWallet(uid: string, id: string): Promise<Wallet | undefined> {
    const wallet = await db.query.wallet.findFirst({
      where: (wallet, { and, eq }) =>
        and(eq(wallet.owner, uid), eq(wallet.id, id)),
    })

    return wallet
  }

  async getWalletWithStocks(
    uid: string,
    id: string,
  ): Promise<WalletWithStocks | undefined> {
    const wallet = await db.query.wallet.findFirst({
      where: (wallet, { eq, and }) =>
        and(eq(wallet.owner, uid), eq(wallet.id, id)),
      with: { stocks: true },
    })

    return wallet
  }

  async getWalletWithStocksAndPrices(
    uid: string,
    id: string,
  ): Promise<WalletWithStocksAndPrices | undefined> {
    const wallet = await this.getWalletWithStocks(uid, id)

    if (!wallet) return undefined

    const marketData = await MarketService.getManyStocksData(
      wallet.stocks.map((stock) => stock.ticker),
    )

    const stocksWithPrices = wallet.stocks.map((stock) => {
      const stockData = marketData.find((data) => data.symbol === stock.ticker)

      if (!stockData) {
        // should not happen, but just to make typescript happy
        throw new Error(
          `Stock data for ${stock.ticker} is not present in marketData.`,
        )
      }

      const price = stockData.regularMarketPrice
      const totalValue = stock.amount * price

      return {
        ...stock,
        price,
        totalValue,
      }
    })

    const totalValue = stocksWithPrices.reduce(
      (acc, stock) => acc + stock.totalValue,
      0,
    )

    const stocks: StockWithPrice[] = stocksWithPrices.map((stock) => ({
      ...stock,
      percentage: stock.totalValue / totalValue,
    }))

    return {
      ...wallet,
      totalValue,
      stocks,
    }
  }

  async createWallet(uid: string, wallet: NewWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(walletTable).values(wallet).returning()

    return newWallet
  }
}

export default new WalletService()
