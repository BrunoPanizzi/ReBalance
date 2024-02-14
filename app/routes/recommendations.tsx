import { LoaderFunctionArgs, json } from '@remix-run/node'

import MarketService from '~/services/maketService/index.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('getting recommendations')

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''

  const recommendations = await MarketService.getSuggestions(search)

  return json({
    search,
    recommendations,
  })
}
