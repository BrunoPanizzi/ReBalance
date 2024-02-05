import { db } from '~/services/db/index.server'

import { wallet as walletTable } from '~/services/db/schema/wallet.server'
import type {
  NewWallet,
  Wallet,
  WalletWithStocks,
} from '~/services/db/schema/wallet.server'

// TODO: return Result type for better error handling
class WalletService {
  async getWallets(uid: string): Promise<Wallet[]> {
    const wallets = await db.query.wallet.findMany({
      where: (wallet, { eq }) => eq(wallet.owner, uid),
    })

    return wallets
  }

  getWallet(
    uid: string,
    id: string,
    withStocks: true,
  ): Promise<WalletWithStocks | undefined>
  getWallet(
    uid: string,
    id: string,
    withStocks?: false,
  ): Promise<Wallet | undefined>
  async getWallet(uid: string, id: string, withStocks: boolean = false) {
    const wallet = await db.query.wallet.findFirst({
      where: (wallet, { and, eq }) =>
        and(eq(wallet.owner, uid), eq(wallet.id, id)),
      with: {
        stocks: withStocks ? true : undefined,
      },
    })

    return wallet
  }

  async createWallet(uid: string, wallet: NewWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(walletTable).values(wallet).returning()

    return newWallet
  }
}

export default new WalletService()
