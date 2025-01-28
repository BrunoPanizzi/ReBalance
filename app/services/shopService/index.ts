import { roundTo } from '~/lib/roundTo'

import WalletService, { FullWalletWithAssets } from '../walletService'

export type ShoppingList = {
  prevTotalValue: number
  newTotalValue: number
  purchases: Purchase[]
}
export type Purchase = {
  wallet: FullWalletWithAssets
  amount: number
}
type ExtraWallet = FullWalletWithAssets & {
  diff: number
  idealTotalValue: number
}

class ShopService {
  async getSuggestions(
    uid: string,
    amount: number,
    blackListedIds: string[] = [],
  ): Promise<ShoppingList> {
    const { fullWallets, partialWallets } =
      await WalletService.getFullWallets(uid)

    // TODO: handle this error in UI
    if (partialWallets.length !== 0) {
      throw new Error('Fix errors in partial wallets')
    }

    const whiteListWallets = fullWallets.filter(
      (w) => !blackListedIds.find((id) => w.id === id),
    )

    const totalValue = fullWallets.reduce((acc, w) => acc + w.totalValue, 0)

    return {
      prevTotalValue: totalValue,
      newTotalValue: totalValue + amount,
      purchases: this.calculate(whiteListWallets, amount),
    }
  }

  calculate(wallets: FullWalletWithAssets[], amount: number): Purchase[] {
    const totalValue =
      wallets.reduce((acc, wallet) => acc + wallet.totalValue, 0) + amount

    const totalIdealPercentage = wallets.reduce(
      (acc, wallet) => acc + wallet.idealPercentage,
      0,
    )

    // adjusts the percentage and add extra fields
    const adjustedWallets: ExtraWallet[] = wallets.map((wallet) => {
      const newIdealPercentage = wallet.idealPercentage / totalIdealPercentage
      const newIdealTotalValue = newIdealPercentage * totalValue
      return {
        ...wallet,
        idealPercentage: newIdealPercentage,
        realPercentage: wallet.totalValue / totalValue,
        idealTotalValue: newIdealTotalValue,
        diff: newIdealTotalValue - wallet.totalValue,
      }
    })

    let purchases: Purchase[] = []

    // the total value is bigger than the ideal total value, so there is no way of investing here
    const noopWallets = adjustedWallets.filter(({ diff }) => diff <= 0)

    // the provided amount is enough to buy every wallet
    if (noopWallets.length === 0) {
      purchases = adjustedWallets.map((w) => ({
        wallet: w,
        amount: roundTo(w.idealTotalValue - w.totalValue, 2),
      }))

      return purchases
    }

    const walletsWithoutNoops = adjustedWallets.filter(({ diff }) => diff > 0)

    // TODO: remove this recursion, this only ever happens once
    return this.calculate(walletsWithoutNoops, amount)
  }
}

export default new ShopService()
