import { useLoaderData } from '@remix-run/react'
import { ArrowRightIcon } from '@radix-ui/react-icons'

import { brl } from '~/lib/formatting'

import { AssetWithPrice } from '~/services/assetService/index.server'

import { Tooltip } from '~/components/ui/tooltip'

import { loader } from '../loader'

type PurchasesListProps = {
  purchases: Record<string, number>
}

export function PurchasesList({ purchases }: PurchasesListProps) {
  const { assets } = useLoaderData<typeof loader>()

  return Object.entries(purchases).map(([name, amount]) => {
    const asset = assets.find((s) => s.name === name)

    if (!asset) {
      console.warn(
        `Error while rendering "PurchasesList": expected asset "%{name}" to be in wallet assets, which come from this page's loader.`,
      )
      return null
    }

    return (
      <AssetCard key={name} name={name} amountToBuy={amount} oldAsset={asset} />
    )
  })
}

type AssetCardProps = {
  name: string
  amountToBuy: number
  oldAsset: AssetWithPrice
}

function AssetCard({ amountToBuy, name, oldAsset }: AssetCardProps) {
  return (
    <>
      <Tooltip.Root delayDuration={200}>
        <Tooltip.Trigger className="flex justify-between gap-4 rounded-md border border-gray-500 px-2 py-1 transition-colors hover:border-primary-400/50 data-[state=delayed-open]:border-primary-400 ">
          <span>{amountToBuy}</span>
          <span>{name}</span>
        </Tooltip.Trigger>

        <Tooltip.Content className="p-2 text-center">
          <div>
            <p>Quantidade:</p>
            {oldAsset.amount} <ArrowRightIcon className="inline size-4" />{' '}
            <p className="inline font-bold text-primary-200">
              {oldAsset.amount + amountToBuy}
            </p>
          </div>
          <div>
            <p>Valor total:</p>
            {brl(oldAsset.totalValue)}{' '}
            <ArrowRightIcon className="inline size-4" />{' '}
            <p className="inline font-bold text-primary-200">
              {brl(oldAsset.price * (oldAsset.amount + amountToBuy))}
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </>
  )
}
