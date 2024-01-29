import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

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

  const wallet = await WalletService.getWallet(user.uid, params.walletId)

  if (!wallet) {
    throw new Error('wallet not found')
  }

  return json(wallet)
}

export default function WalletPage() {
  const wallet = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-50">
        {wallet.title} - {wallet.totalValue}
      </h1>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
