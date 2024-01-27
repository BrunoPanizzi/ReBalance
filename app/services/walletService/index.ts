export type Wallet = {
  id: string
  title: string
  totalValue: number
  idealPercentage: number
  color: string
}

const baseUrl = 'http://localhost:5123'
const userToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJmMmRiMTFiMy01YjM0LTQzMDktOTc4Ni0xN2YxZjcwZjI1ZmUiLCJ1c2VyTmFtZSI6IkJydW5vIiwiZW1haWwiOiJicnVub3Bhbml6emlxQGdtYWlsLmNvbSIsImlhdCI6MTcwNjE0NzYyMywiZXhwIjoxNzA2NzUyNDIzfQ.PFqUzkxkM9JucjEmxogiM1Wto5OQiEyYEAX3Bv9lA2Y'

class WalletService {
  async getWallets(token: string, withStocks?: boolean): Promise<Wallet[]> {
    const response = await fetch(`${baseUrl}/wallet?withStocks=${withStocks}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    if (response.status !== 200) {
      throw new Error('Error fetching wallets')
    }

    const wallets = await response.json()

    return wallets
  }

  async getWallet(id: string): Promise<Wallet> {
    const response = await fetch(`${baseUrl}/wallet/${id}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })

    if (response.status !== 200) {
      throw new Error('Error fetching wallet')
    }

    const wallet = await response.json()

    return wallet
  }
}

export default new WalletService()
