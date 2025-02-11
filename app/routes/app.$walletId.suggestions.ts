import type { Route } from './+types/app.$walletId.suggestions'
import { redirect } from 'react-router'

import { sessionStorage } from '~/services/cookies/session.server'

import { error, ok, Result } from '~/types/Result'
import walletService from '~/services/walletService/index.server'
import { AssetPurchaseSuggestionUseCase } from '~/services/assetsPurchaseSuggestionsUseCase/index.server'

type Purchases = Record<string, number>

export type LoaderResponse = Result<
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
}: Route.LoaderArgs): Promise<LoaderResponse> => {
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
    return error('Amount should be greater than 0')
  }

  const { assets } = await walletService.getFullWallet(user.uid, walletId)

  if (assets.length === 0) {
    return error('Wallet has no assets')
  }

  const { change, purchases } = new AssetPurchaseSuggestionUseCase().execute(
    assets,
    amount,
  )

  return ok({
    totalAmount: amount,
    investedAmount: amount - change,
    change: change,
    assetsBought: Object.keys(purchases).length, // assets bought is the number of different tickers
    purchases,
  })
}
