import { useLoaderData } from 'react-router';

import { loader } from '../loader'
import { useSortContext } from '../SortContext'
import { BrStockRow } from './BrStockRow'
import { FixedValueRow } from './FixedValueRow'

export function AssetList() {
  const { assets: baseAssets, type } = useLoaderData<typeof loader>()

  const { sort } = useSortContext()

  const sortedAssets = baseAssets.sort((a, b) => {
    if (sort.ascending) {
      return b[sort.by] < a[sort.by] ? 1 : -1
    }
    return b[sort.by] > a[sort.by] ? 1 : -1
  })

  return sortedAssets.map((a) => {
    if (type === 'br-stock') {
      return <BrStockRow key={a.id} stock={a} />
    } else if (type === 'fixed-value') {
      return <FixedValueRow key={a.id} asset={a} />
    } else {
      throw new Error(`Wallet of type ${type} is not currently supported`)
    }
  })
}
