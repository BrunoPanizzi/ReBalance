import type { Route } from './+types/route'
import { redirect } from 'react-router'

import { sessionStorage } from '~/services/cookies/session.server'
import WalletService from '~/services/walletService/index.server'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const { partialWallets, fullWallets } = await WalletService.getFullWallets(
    user.uid,
  )
  return { user, partialWallets, fullWallets }
}
