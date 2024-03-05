import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'

import { sessionStorage } from '~/services/cookies/session.server'
import AssetService, {
  AssetType,
  assetType,
} from '~/services/assetService/index.server'

import { Result, typedError, typedOk } from '~/types/Result'

type Purchases = Record<string, number>

type LoaderResponse = Result<
  {
    totalAmount: number
    investedAmount: number
    change: number
    assetsBought: number
    purchases: Purchases
  },
  string
>

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderResponse>> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const walletId = params.walletId

  if (!walletId) {
    throw new Error('Unreachable')
  }

  const { searchParams } = new URL(request.url)
  const amount = Number(searchParams.get('amount'))

  if (isNaN(amount) || amount < 0) {
    return typedError('Amount should be greater than 0')
  }

  const walletType = searchParams.get('type')

  if (!walletType || !assetType.find((a) => a === walletType)) {
    return typedError('invalir type')
  }

  const userAssets = await AssetService.getAssetsByWalletWithPrices(
    user.uid,
    walletId,
    walletType as AssetType,
  )

  if (userAssets.length === 0) {
    return typedError('Wallet has no assets')
  }

  let assets = userAssets.map((s) => ({ ...s }))

  const purchases: Purchases = {}

  let remainingAmount = amount

  // TODO: when type is `fixed-value` don't buy whole assets, buy fractions
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

  return typedOk({
    totalAmount: amount,
    investedAmount: amount - remainingAmount,
    change: remainingAmount,
    assetsBought: Object.keys(purchases).length, // assets bought is the number of different tickers
    purchases,
  })
}
