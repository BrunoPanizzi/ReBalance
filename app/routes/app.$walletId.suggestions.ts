import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'

import { sessionStorage } from '~/services/cookies/session.server'
import StocksService from '~/services/stockService/index.server'

import { Result, typedError, typedOk } from '~/types/Result'

type Purchases = Record<string, number>

type LoaderResponse = Result<
  {
    totalAmount: number
    investedAmount: number
    change: number
    stocksBought: number
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

  const userStocks = await StocksService.getStocksByWalletWithPrices(
    user.uid,
    walletId,
  )

  if (userStocks.length === 0) {
    return typedError('Wallet has no stocks')
  }

  let stocks = userStocks.map((s) => ({ ...s }))

  const purchases: Purchases = {}

  let remainingAmount = amount

  while (true) {
    const smallestTotalValue = stocks.reduce(
      (a, s) => (s.totalValue < a.totalValue ? s : a),
      stocks[0],
    )

    if (smallestTotalValue.price > remainingAmount) {
      break
    }

    if (purchases[smallestTotalValue.ticker]) {
      purchases[smallestTotalValue.ticker]++
    } else {
      purchases[smallestTotalValue.ticker] = 1
    }

    smallestTotalValue.amount++
    smallestTotalValue.totalValue += smallestTotalValue.price
    remainingAmount -= smallestTotalValue.price
  }

  return typedOk({
    totalAmount: amount,
    investedAmount: amount - remainingAmount,
    change: remainingAmount,
    stocksBought: Object.keys(purchases).length, // stocks bought is the number of different tickers
    purchases,
  })
}
