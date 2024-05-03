import { CheckIcon, DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons'
import { memo, useEffect, useState } from 'react'
import { useFetcher } from '@remix-run/react'

import { brl, percentage } from '~/lib/formatting'
import { cn } from '~/lib/utils'

import { AssetWithPrice } from '~/services/assetService/index.server'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { PopoverItem } from '~/components/ui/popover'
import { EasyTooltip } from '~/components/ui/tooltip'
import Loader from '~/components/Loader'

export type BrStockRowProps = {
  stock: AssetWithPrice
}

export const BrStockRow = memo(({ stock }: BrStockRowProps) => {
  const fetcher = useFetcher({ key: stock.id })

  return (
    <div
      className={cn(
        'mb-2 grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_auto] gap-x-2 rounded-lg bg-gray-700 p-1 pl-2 last:mb-0',
        '@md:grid-cols-[auto_repeat(4,1fr)_auto] @md:grid-rows-1 @md:place-items-center',
      )}
    >
      <fetcher.Form className="hidden justify-center @md:flex " method="DELETE">
        <button type="submit" name="assetId" value={stock.id}>
          {fetcher.state === 'idle' ? (
            <TrashIcon className="size-5 transition hover:scale-110 hover:text-red-500" />
          ) : (
            <Loader className="size-5" />
          )}
        </button>
      </fetcher.Form>
      <span className="flex items-center  gap-2 font-display text-lg text-primary-100 @md:text-base @md:font-normal @md:text-gray-50">
        {stock.name}
        <Popover>
          <PopoverTrigger className="@md:hidden">
            <DotsVerticalIcon className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="w-fit">
            <PopoverItem
              title="Excluir"
              icon={<TrashIcon className="size-5 text-red-500" />}
              onClick={() => alert('Não implementado...')}
            />
          </PopoverContent>
        </Popover>
      </span>

      <EasyTooltip label="Quantidade">
        <AmountInput asset={stock} />
      </EasyTooltip>

      {/* small screens, span 2 cols */}
      <span className="col-span-2 flex items-end gap-4 @md:hidden">
        <EasyTooltip label="Preço atual">{brl(stock.price)}</EasyTooltip>
        <EasyTooltip label="Valor total">
          <span className="text-sm">
            <span className="mr-1 @md:hidden">Total:</span>
            {brl(stock.totalValue)}
          </span>
        </EasyTooltip>
      </span>

      {/* bigger screens, span 1 col each */}
      <EasyTooltip label="Preço atual">
        <span className="hidden @md:inline">{brl(stock.price)}</span>
      </EasyTooltip>
      <EasyTooltip label="Valor total">
        <span className="hidden text-sm @md:inline">
          {brl(stock.totalValue)}
        </span>
      </EasyTooltip>

      <span className="col-start-3 row-span-2 row-start-1 flex h-full items-center justify-center rounded-md bg-white bg-opacity-20 px-2 @md:col-start-6 @md:w-[4.5rem]">
        {percentage(stock.percentage)}
      </span>
    </div>
  )
})

function AmountInput({ asset }: { asset: AssetWithPrice }) {
  const fetcher = useFetcher({ key: asset.id + 'PATCH' })

  const [value, setValue] = useState(asset.amount)

  const changed = value !== asset.amount

  useEffect(() => {
    if (asset.amount !== value) {
      setValue(asset.amount)
    }
  }, [asset.amount])

  return (
    <fetcher.Form className="relative min-w-20" method="PATCH">
      <input type="hidden" aria-hidden name="assetId" value={asset.id} />
      <label htmlFor="amount" className="hidden">
        Quantidade
      </label>
      <input
        id="amount"
        className={cn(
          'w-full rounded-md bg-white bg-opacity-10 px-2 text-center transition hover:bg-opacity-25 ',
          'outline-2 outline-offset-1 outline-primary-300 focus:bg-opacity-25 focus:outline',
        )}
        value={value}
        onChange={(e) => {
          const val = e.target.valueAsNumber
          if (!isNaN(val)) setValue(val)
        }}
        onFocus={(e) => e.target.select()}
        type="number"
        name="amount"
      />
      {changed && (
        <button
          id="submit"
          type="submit"
          className="absolute inset-0 left-auto grid aspect-square h-full place-items-center rounded-md p-0.5 transition hover:bg-primary-500/50"
        >
          {fetcher.state === 'idle' ? (
            <CheckIcon className="h-full w-full" />
          ) : (
            <Loader className="h-full w-full" />
          )}
        </button>
      )}
    </fetcher.Form>
  )
}
