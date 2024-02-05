import { LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import { sessionStorage } from '~/services/cookies/session.server'
import walletService from '~/services/walletService'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const wallets = await walletService.getWallets(user.uid)

  return json({ user, wallets })
}
