import { z } from 'zod'

const TOKEN = process.env.BRAPI_TOKEN

if (!TOKEN) {
  throw new Error('BRAPI_TOKEN should be defined in .env file.')
}

const BASE_URL = 'https://brapi.dev/api'

const responseSchema = z.object({
  results: z.array(
    z.object({
      currency: z.string(),
      shortName: z.string(),
      longName: z.string(),
      symbol: z.string(),
      logourl: z.string(),
      regularMarketPrice: z.number(),
    }),
  ),
  requestedAt: z.string(),
})

const stockDataSchema = z.object({
  currency: z.string(),
  shortName: z.string(),
  longName: z.string(),
  symbol: z.string(),
  logourl: z.string(),
  regularMarketPrice: z.number(),
})

type StockData = z.infer<typeof stockDataSchema>

class MarketService {
  async getStockData(symbol: string): Promise<StockData> {
    const response = await fetch(`${BASE_URL}/quote/${symbol}?token=${TOKEN}`)

    if (!response.ok) {
      throw new Error('Failed to fetch stock data. Error: ' + response.status)
    }

    const parsedResponse = responseSchema.parse(await response.json())

    const result = parsedResponse.results[0]

    if (result.symbol !== symbol) {
      throw new Error('Failed to fetch stock data. Symbol mismatch.')
    }

    return result
  }

  async getManyStocksData(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map((symbol) => this.getStockData(symbol))

    const responses = await Promise.all(promises)

    return responses
  }

  async getSuggestions(searchTerm: string, max: number = 6): Promise<string[]> {
    const response = await fetch(
      `${BASE_URL}/available?search=${searchTerm}&token=${TOKEN}`,
    )

    if (!response.ok) {
      throw new Error(
        'Failed to get stock suggestions. Error: ' + response.status,
      )
    }

    const parsedSuggestions = suggestionsSchema.parse(await response.json())

    return parsedSuggestions.stocks.slice(0, max)
  }
}

const suggestionsSchema = z.object({
  indexes: z.array(z.string()),
  stocks: z.array(z.string()),
})

export default new MarketService()
