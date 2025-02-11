import { motion, AnimatePresence } from 'framer-motion'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useLoaderData } from 'react-router';
import { useState } from 'react'

import { brl } from '~/lib/formatting'

import { AssetWithPrice } from '~/services/assetService/index.server'

import { EasyTooltip } from '~/components/ui/tooltip'

import { loader } from '../loader'

type BarChartProps = {
  purchases: Record<string, number>
}

export function BarChart({ purchases }: BarChartProps) {
  const { assets, color } = useLoaderData<typeof loader>()

  const [selected, setSelected] = useState<string | null>(null)

  const filteredAssets = assets
    .filter((a) => purchases[a.name] !== undefined)
    .sort((a, b) => a.amount * a.price - b.amount * b.price)

  const max = Math.max(
    ...filteredAssets.map(
      (a) => (a.amount + (purchases[a.name] || 0)) * a.price,
    ),
  )

  return (
    <motion.div
      animate={{
        height: selected !== null ? 176 : 96,
      }}
      className="grid max-h-44 min-h-24 w-full grid-cols-[auto_1fr] overflow-hidden rounded-lg border border-gray-700 bg-gray-700/75 p-0.5"
    >
      <SelectedInfo
        asset={assets.find((a) => a.name === selected)!}
        purchasedAmount={purchases[selected || ''] || 0}
        clearSelected={() => setSelected(null)}
        hasSelected={selected !== null}
      />

      <div className="overflow-y-scroll">
        <div className="relative flex h-full w-max gap-1">
          {filteredAssets.map((a) => (
            <EasyTooltip
              open={selected === a.name || undefined} // Js is dumb
              delay={0}
              color={color}
              label={a.name}
              side="bottom"
              key={a.id}
            >
              <div
                onClick={() => setSelected(a.name)}
                className="group relative h-full min-w-8 max-w-12 overflow-hidden rounded-md transition data-[has-selected=true]:opacity-50 data-[selected=true]:opacity-100"
                data-selected={selected === a.name}
                data-has-selected={selected !== null}
              >
                <div
                  className="absolute inset-0 top-auto rounded-t-md bg-primary-600"
                  style={{
                    height:
                      (((purchases[a.name] || 0) * a.price) / max) * 100 + '%',
                    bottom: (a.totalValue / max) * 100 + '%',
                  }}
                />
                <div
                  className="absolute inset-0 top-auto rounded-b-md bg-primary-400"
                  style={{
                    height: (a.totalValue / max) * 100 + '%',
                  }}
                />
              </div>
            </EasyTooltip>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

type SelectedInfoProps = {
  asset: AssetWithPrice
  purchasedAmount: number
  clearSelected: () => void
  hasSelected: boolean
}
function SelectedInfo({
  asset,
  purchasedAmount,
  clearSelected,
  hasSelected,
}: SelectedInfoProps) {
  return (
    <AnimatePresence>
      {hasSelected && (
        <motion.div
          initial={{ width: 0, opacity: 0, padding: 0, marginRight: 0 }}
          animate={{ width: '10rem', opacity: 1, marginRight: 8, padding: 4 }}
          exit={{ width: 0, opacity: 0, marginRight: 0, padding: 0 }}
          className="min-w-0 overflow-hidden rounded-md bg-gray-600"
        >
          <header className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-primary-200">{asset.name}</h4>
            <Cross2Icon
              onClick={clearSelected}
              className="size-4 cursor-pointer"
            />
          </header>
          <div className="text-sm">
            <p>
              Comprar {purchasedAmount} cotas (
              {brl(purchasedAmount * asset.price)})
            </p>
            <p>
              Atual {asset.amount} cotas ({brl(asset.totalValue)})
            </p>
            <p className="mt-1 font-bold text-primary-200">
              Total {asset.amount + purchasedAmount} cotas (
              {brl((asset.amount + purchasedAmount) * asset.price)})
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
