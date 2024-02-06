import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { createContext, memo, useContext, useEffect, useState } from 'react'
import {
  ArrowDownIcon,
  DotsVerticalIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons'

import { brl, percentage } from '~/lib/formatting'
import { cn } from '~/lib/utils'

import { sessionStorage } from '~/services/cookies/session.server'
import WalletService, { StockWithPrice } from '~/services/walletService'

import { useColors } from '~/context/ColorsContext'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Select } from '~/components/ui/select'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const user = session.get('user')

  if (!user) {
    throw new Error('user not found')
  }

  if (!params.walletId) {
    throw new Error('no walletId provided')
  }

  const wallet = await WalletService.getWalletWithStocksAndPrices(
    user.uid,
    params.walletId,
  )

  if (!wallet) {
    throw new Error('wallet not found')
  }

  return json(wallet)
}

export default function WalletPage() {
  const wallet = useLoaderData<typeof loader>()
  const { setColor } = useColors()

  useEffect(() => {
    setColor(wallet.color)
    return () => {
      setColor('emerald')
    }
  }, [setColor])

  return (
    <>
      <Header backArrow title={wallet.title} />
      <Wrapper cols={2}>
        <Table />

        <div className="bg-red-300 p-2"></div>
      </Wrapper>
    </>
  )
}

type SortOptions = 'ticker' | 'amount' | 'price' | 'percentage'

type SortContext = {
  sort: {
    ascending: boolean
    by: SortOptions
  }
  setSort: (sort: SortOptions | ((prev: SortOptions) => SortOptions)) => void
  toggleAscending: () => void
}

const sortContext = createContext<SortContext | null>(null)

function useSortContext() {
  const context = useContext(sortContext)
  if (!context) {
    throw new Error('useSortContext must be used within a SortProvider')
  }
  return context
}

function SortProvider({ children }: { children: React.ReactNode }) {
  const [sort, setSort] = useState<SortOptions>('ticker')
  const [ascending, setAscending] = useState(true)

  const toggleAscending = () => setAscending((prev) => !prev)

  return (
    <sortContext.Provider
      value={{
        sort: { by: sort, ascending },
        setSort,
        toggleAscending,
      }}
    >
      {children}
    </sortContext.Provider>
  )
}

function Table() {
  const { stocks } = useLoaderData<typeof loader>()

  return (
    <SortProvider>
      <div>
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-primary-100">
              Seus ativos
            </h1>

            <button
              className="transition-transform hover:scale-125"
              // onClick={handleOpenNewStockModal}
            >
              <PlusIcon className="size-6 text-primary-300 " />
            </button>
          </div>

          <Sort />
        </header>

        {stocks.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-primary-300">Nenhum ativo encontrado</span>
          </div>
        ) : (
          <div className="@container">
            <StocksList />
          </div>
        )}
      </div>
    </SortProvider>
  )
}

function StocksList() {
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

const StockRow = memo(({ stock }: StockRowProps) => (
  <div
    className={cn(
      'mb-2 grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_auto] gap-x-2 rounded-lg bg-gray-700 p-1 pl-2 last:mb-0',
      '@md:grid-cols-[auto_repeat(4,1fr)_auto] @md:grid-rows-1 @md:place-items-center',
    )}
  >
    <button
      className="hidden transition hover:scale-110 hover:text-red-500 @md:block"
      onClick={() => alert('Não implementado...')}
    >
      <TrashIcon className="size-5" />
    </button>
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
))

// TODO: make this responsive
function Sort() {
  const { sort, setSort, toggleAscending } = useSortContext()

  return (
    <div className="flex items-center justify-between gap-1">
      <Select.Root
        defaultValue={sort.by}
        onValueChange={(value) => setSort(value as SortOptions)}
      >
        <Select.Trigger>
          Ordem: <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value="ticker">Ticker</Select.Item>
            <Select.Item value="amount">Quantidade</Select.Item>
            <Select.Item value="price">Preço</Select.Item>
            <Select.Item value="percentage">Porcentagem</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <button
        className="rounded-md border-2 border-primary-400/50 p-2 transition-colors hover:border-primary-400"
        onClick={toggleAscending}
        title={sort.ascending ? 'Menor para maior' : 'Maior para menor'}
      >
        <ArrowDownIcon
          className={cn('size-4 text-primary-400 transition-transform', {
            'rotate-180': !sort.ascending,
          })}
        />
      </button>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
