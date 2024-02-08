import { user, userRelations } from './user.server'
import { wallet, walletRelations } from './wallet.server'
import { stock, stockRelations } from './stock.server'
import { feedback } from './feedback.server'

const schema = {
  user,
  userRelations,
  wallet,
  walletRelations,
  stock,
  stockRelations,
  feedback,
}

export default schema 

export {
  user,
  userRelations,
  wallet,
  walletRelations,
  stock,
  stockRelations,
  feedback,
}
