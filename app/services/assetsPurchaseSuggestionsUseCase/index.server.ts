import { AssetWithPrice } from '../assetService/index.server'

export type Purchases = Record<string, number>

export class AssetPurchaseSuggestionUseCase {
  // TODO: when type is `fixed-value` don't buy whole assets, buy fractions
  execute(assets: AssetWithPrice[], amount: number) {
    const purchases: Purchases = {}

    let remainingAmount = amount

    while (true) {
      const smallestTotalValue = assets.reduce(
        (a, s) => (s.totalValue < a.totalValue ? s : a),
        assets[0],
      )

      if (smallestTotalValue.price > remainingAmount) {
        break
      }

      if (purchases[smallestTotalValue.name]) {
        purchases[smallestTotalValue.name]++
      } else {
        purchases[smallestTotalValue.name] = 1
      }

      smallestTotalValue.amount++
      smallestTotalValue.totalValue += smallestTotalValue.price
      remainingAmount -= smallestTotalValue.price
    }

    return {
      purchases,
      change: remainingAmount,
    }
  }
}
