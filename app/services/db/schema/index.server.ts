import { user, userRelations } from './user.server'
import { wallet, walletRelations } from './wallet.server'
import { stock, stockRelations } from './stock.server'
import { feedback } from './feedback.server'

export const schema = {
  user,
  userRelations,
  wallet,
  walletRelations,
  stock,
  stockRelations,
  feedback,
}
