import { user, userRelations } from './user.server'
import { pgColorEnum } from './color.server'
import { wallet, walletRelations } from './wallet.server'
import { asset, assetRelations, assetTypeEnum } from './asset.server'
import { feedback } from './feedback.server'

const schema = {
  user,
  userRelations,
  pgColorEnum,
  wallet,
  walletRelations,
  asset,
  assetTypeEnum,
  assetRelations,
  feedback,
}

export default schema

export {
  user,
  userRelations,
  pgColorEnum,
  wallet,
  walletRelations,
  asset,
  assetTypeEnum,
  assetRelations,
  feedback,
}
