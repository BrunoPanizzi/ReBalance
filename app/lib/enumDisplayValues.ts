import type { AssetType } from '~/services/assetService/index.server'

export const assetTypeLabels: Record<AssetType, string> = {
  'br-stock': 'Ações',
  'br-bond': 'Renda Fixa',
  'usa-stock': 'Stocks',
  'usa-bond': 'Bonds',
  'fixed-value': 'Valor Fixo',
}
