import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'

import { useColors } from '~/context/ColorsContext'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { sessionStorage } from '~/services/cookies/session.server'

import WalletService, { StockWithPrice } from '~/services/walletService'
import { DotsVerticalIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Stock } from '~/services/db/schema/stock.server'
import { brl, percentage } from '~/lib/formatting'
import { cn } from '~/lib/utils'

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

function Table() {
  const { stocks } = useLoaderData<typeof loader>()

  return (
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

        {/* <Sort /> */}
      </header>

      {stocks.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <span className="text-primary-300">Nenhum ativo encontrado</span>
        </div>
      ) : (
        <div className="@container">
          {stocks.map((s) => (
            <StockRow key={s.id} stock={s} />
          ))}
        </div>
      )}
    </div>
  )
}

type StockRowProps = {
  stock: StockWithPrice
}

function StockRow({ stock }: StockRowProps) {
  return (
    <div
      className={cn(
        'mb-2 grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_auto] gap-x-2 rounded-lg bg-gray-700 p-1 pl-2 last:mb-0',
        '@md:grid-cols-[auto_repeat(4,1fr)_auto] @md:grid-rows-1 @md:place-items-center',
      )}
    >
      <button
        className="hidden transition hover:scale-110 hover:text-red-500 @md:block"
        // onClick={() => setDangerModalVisible(true)}
      >
        <TrashIcon className="size-5" />
      </button>
      <span className="flex items-center  gap-2 font-display text-lg text-primary-100 @md:text-base @md:font-normal @md:text-gray-50">
        {stock.ticker}
        <button>
          <DotsVerticalIcon className="size-4 @md:hidden" />
        </button>
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
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
