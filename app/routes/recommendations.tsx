import type { Route } from './+types/recommendations'

import MarketService from '~/services/maketService/index.server'

export const loader = async ({ request }: Route.LoaderArgs) => {
  console.log('getting recommendations')

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''

  const recommendations = await MarketService.getSuggestions(search)

  return {
    search,
    recommendations,
  }
}
