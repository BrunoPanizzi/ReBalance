import { LoaderFunctionArgs, json } from '@remix-run/node'

import { sessionStorage } from '~/services/cookies/session.server'
import WalletService from '~/services/walletService'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')

  if (!user) {
    throw new Error('user not found')
  }

  if (!params.walletId) {
    throw new Error('no walletId provided')
  }

  const wallet = await WalletService.getFullWallet(user.uid, params.walletId)

  if (!wallet) {
    throw new Error('wallet not found')
  }

  return json(wallet)
}
