import WalletService, { FullWalletWithAssets } from '../walletService'

type ShoppingList = {
  prevTotalValue: number
  newTotalValue: number
  purchases: Purchase[]
}
type Purchase = {
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
    const wallets = await WalletService.getFullWallets(uid)
    const whiteListWallets = wallets.filter(
      (w) => !blackListedIds.find((id) => w.id === id),
    )

    const totalValue = wallets.reduce((acc, w) => acc + w.totalValue, 0)

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
        amount: w.idealTotalValue - w.totalValue,
      }))

      return purchases
    }

    const walletsWithoutNoops = adjustedWallets.filter(({ diff }) => diff > 0)

    return this.calculate(walletsWithoutNoops, amount)
  }
}

export default new ShopService()
