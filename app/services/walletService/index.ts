import { Colors } from '~/constants/availableColors'
import { db } from '../db/index.server'
import { NewWallet, wallet as walletTable } from '../db/schema.server'

export type Wallet = {
  id: string
  title: string
  totalValue: number
  idealPercentage: number
  color: Colors
}

// TODO: return Result type for better error handling
class WalletService {
  async getWallets(uid: string, withStocks?: boolean): Promise<Wallet[]> {
    const wallets = await db.query.wallet.findMany({
      where: (wallet, { eq }) => eq(wallet.owner, uid),
      with: {
        stocks: withStocks ? true : undefined,
      },
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

  async createWallet(uid: string, wallet: NewWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(walletTable).values(wallet).returning()

    return newWallet
  }
}

export default new WalletService()
