import { memo } from 'react'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { DotsVerticalIcon, TrashIcon } from '@radix-ui/react-icons'

import { cn } from '~/lib/utils'
import { brl, percentage } from '~/lib/formatting'

import { StockWithPrice } from '~/services/stockService/index.server'

import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from '~/components/ui/popover'
import Loader from '~/components/Loader'

import { loader } from './loader'
import { useSortContext } from './SortContext'

export function StocksList() {
  const baseStocks = useLoaderData<typeof loader>()

  const { sort } = useSortContext()

  const sortedStocks = baseStocks.stocks.sort((a, b) => {
    if (sort.ascending) {
      return b[sort.by] < a[sort.by] ? 1 : -1
    }
    return b[sort.by] > a[sort.by] ? 1 : -1
  })

  return sortedStocks.map((s) => <StockRow key={s.id} stock={s} />)
}

type StockRowProps = {
  stock: StockWithPrice
}

const StockRow = memo(({ stock }: StockRowProps) => {
  const fetcher = useFetcher({ key: stock.id })

  return (
    <div
      className={cn(
        'mb-2 grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_auto] gap-x-2 rounded-lg bg-gray-700 p-1 pl-2 last:mb-0',
        '@md:grid-cols-[auto_repeat(4,1fr)_auto] @md:grid-rows-1 @md:place-items-center',
      )}
    >
      <fetcher.Form className="hidden justify-center @md:flex " method="DELETE">
        <button type="submit" name="stockId" value={stock.id}>
          {fetcher.state === 'idle' ? (
            <TrashIcon className="size-5 transition hover:scale-110 hover:text-red-500" />
          ) : (
            <Loader className="size-5" />
          )}
        </button>
      </fetcher.Form>
      <span className="flex items-center  gap-2 font-display text-lg text-primary-100 @md:text-base @md:font-normal @md:text-gray-50">
        {stock.ticker}
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
      <span className="min-w-20 ">
        <input
          className="w-full rounded-md bg-white bg-opacity-10 px-2 text-center transition-all hover:bg-opacity-25 focus:rounded-xl focus:bg-opacity-25 focus:outline-0"
          defaultValue={stock.amount}
        />
      </span>

      {/* small screens, span 2 cols */}
      <span className="col-span-2 flex items-end gap-4 @md:hidden">
        <span>{brl(stock.price)}</span>
        <span className="text-sm">
          <span className="mr-1 @md:hidden">Total:</span>
          {brl(stock.totalValue)}
        </span>
      </span>

      {/* bigger screens, span 1 col each */}
      <span className="hidden @md:inline">{brl(stock.price)}</span>
      <span className="hidden text-sm @md:inline">{brl(stock.totalValue)}</span>

      <span className="col-start-3 row-span-2 row-start-1 flex h-full items-center justify-center rounded-md bg-white bg-opacity-20 px-2 @md:col-start-6 @md:w-[4.5rem]">
        {percentage(stock.percentage)}
      </span>
    </div>
  )
})
