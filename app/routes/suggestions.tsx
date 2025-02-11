import { Route } from './+types/suggestions'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import ShopService from '~/services/shopService'

const searchParamsSchema = z.object({
  amount: z.number(),
  blackListedIds: z.array(z.string()),
})

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')

  if (!user) {
    throw new Error('user not found')
  }

  const searchParams = new URL(request.url).searchParams

  const { amount, blackListedIds } = searchParamsSchema.parse({
    amount: Number(searchParams.get('amount')),
    blackListedIds: searchParams.getAll('blackListedIds'),
  })

  const purchases = await ShopService.getSuggestions(
    user.uid,
    amount,
    blackListedIds,
  )

  return purchases
}
