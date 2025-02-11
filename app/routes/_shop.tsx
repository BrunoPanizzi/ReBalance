import { Link, Outlet, useFetcher, useMatches } from '@remix-run/react'
import {
  ArrowRightIcon,
  BackpackIcon,
  ChevronDownIcon,
  Cross1Icon,
} from '@radix-ui/react-icons'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { cn } from '~/lib/utils'
import { brl, currencyToNumber, percentage } from '~/lib/formatting'

import { FullWalletWithAssets } from '~/services/walletService/index.server'
import { ShoppingList } from '~/services/shopService'

import { loader } from './suggestions'

import Wrapper from '~/components/Wrapper'
import { Button } from '~/components/ui/button'
import { AmountForm } from '~/components/AmountForm'

type ShopContext = {
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
  value: string
  setValue: (value: string) => void
  shopRecommendations: ShoppingList | null
  removeRecommendation: (id: string) => void
  fetchRecommendations: () => void
  isSubmitting: boolean
}

const shopContext = createContext<ShopContext | null>(null)

export function useShop(): ShopContext {
  const context = useContext(shopContext)
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}

export default function Shop() {
  const matches = useMatches()

  const fetcherKey = useMemo(() => 'suggestions' + Math.random(), [])

  const fetcher = useFetcher<typeof loader>({
    key: fetcherKey,
  })
  const [data, setData] = useState<ShoppingList | null>(fetcher.data || null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [value, setValue] = useState('')

  const fetchRecommendations = () => {
    fetcher.submit(
      { amount: currencyToNumber(value), blackListedIds: [] },
      { method: 'GET', action: 'suggestions' },
    )
  }

  const removeRecommendation = (id: string) => {
    setData((data) => {
      if (!data) return null
      return {
        ...data,
        purchases: data.purchases.filter((p) => p.wallet.id !== id),
      }
    })
  }

  const isWalletPage = matches.some(
    (m) => m.id === 'routes/_shop.app_.$walletId',
  )

  useEffect(() => {
    setData(fetcher.data || null)
  }, [fetcher.data])

  if (isWalletPage && !isExpanded) {
    return <Outlet />
  }

  return (
    <shopContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        value,
        setValue,
        shopRecommendations: data || null,
        fetchRecommendations,
        removeRecommendation,
        isSubmitting: fetcher.state !== 'idle',
      }}
    >
      <Outlet />
      <Wrapper className="pointer-events-none fixed left-1/2 top-0 block min-h-screen w-full -translate-x-1/2">
        <div
          data-expanded={isExpanded}
          className="pointer-events-auto absolute bottom-6 right-3 rounded-xl border border-primary-600 bg-gray-700 shadow-md transition-all data-[expanded=true]:bottom-16 sm:right-0"
        >
          {isExpanded ? (
            <ExpandedShop />
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex size-12 items-center justify-center rounded-xl border-4 border-primary-800 bg-primary-300 "
            >
              <BackpackIcon className="size-7 stroke-primary-800" />
            </button>
          )}
        </div>
      </Wrapper>
    </shopContext.Provider>
  )
}

type ExpandedShopProps = {
  // onClose: () => void
}

function ExpandedShop({}: ExpandedShopProps) {
  const {
    setIsExpanded,
    value,
    setValue,
    isSubmitting,
    shopRecommendations,
    fetchRecommendations,
  } = useShop()

  return (
    <div className="min-w-64 max-w-96 p-4">
      <header className="mb-4 grid grid-cols-[1fr_auto] items-center gap-x-2">
        <h2 className="text-xl font-bold text-primary-200">
          {shopRecommendations ? `Investir ${value}` : 'Área de aporte'}
        </h2>
        <Button
          onClick={() => setIsExpanded(false)}
          className="group"
          size="icon"
          variant="ghost"
        >
          <Cross1Icon className="size-3 stroke-gray-400 transition-colors group-hover:stroke-red-400" />
        </Button>
        {shopRecommendations === undefined && (
          <p className="col-span-2 text-sm">
            Insira quanto você deseja aportar que nós distribuiremos essa
            quantia entre suas carteiras.
          </p>
        )}
      </header>

      {shopRecommendations === null ? (
        <AmountForm
          value={value}
          setValue={setValue}
          isSubmitting={isSubmitting}
          handleSubmit={fetchRecommendations}
        />
      ) : (
        <div className="flex max-h-96 flex-col gap-2 overflow-y-scroll">
          {shopRecommendations.purchases.map((p) => (
            <WalletPurchaseCard
              key={p.wallet.id}
              wallet={p.wallet}
              investedAmount={p.amount}
              prevTotalValue={shopRecommendations.prevTotalValue}
              newTotalValue={shopRecommendations.newTotalValue}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type WalletPurchaseCardProps = {
  wallet: FullWalletWithAssets
  investedAmount: number
  prevTotalValue: number
  newTotalValue: number
}

function WalletPurchaseCard({
  wallet,
  prevTotalValue,
  newTotalValue,
  investedAmount,
}: WalletPurchaseCardProps) {
  const { removeRecommendation } = useShop()
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      data-color={wallet.color}
      className="rounded-lg border-l-8 border-primary-400 bg-primary-600/25 p-2 pl-4"
    >
      <div className="flex items-center justify-between gap-4 ">
        <h4 className="text-xl font-semibold text-primary-100">
          {wallet.title}
        </h4>

        <button
          className="aspect-square rounded bg-primary-400 p-1"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDownIcon
            className={cn('stroke-primary-950 transition-transform delay-75', {
              'rotate-180 transform': expanded,
            })}
          />
        </button>
      </div>

      {expanded && (
        <>
          <div className="mt-2 text-sm/tight">
            <span>Quantidade total:</span>
            <div className="flex items-center gap-2">
              <span className="">{brl(wallet.totalValue)}</span>
              <ArrowRightIcon className="inline size-6" />
              <span>{brl(investedAmount + wallet.totalValue)}</span>
            </div>
          </div>

          <div className="text-sm">
            <span>Porcentagem:</span>
            <div className="flex items-center gap-2">
              <span className="">
                {percentage(wallet.totalValue / prevTotalValue)}
              </span>
              <ArrowRightIcon className="inline size-6" />
              <span>
                {percentage(
                  (wallet.totalValue + investedAmount) / newTotalValue,
                )}
              </span>
            </div>
          </div>
        </>
      )}

      <footer className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
        <span className="mr-4 text-xl font-semibold text-primary-100">
          +{brl(investedAmount)}
        </span>
        <Button size="sm" asChild>
          <Link
            to={{
              pathname: `/app/${wallet.id}`,
              search: `?amount=${investedAmount}`,
            }}
          >
            <span className="flex items-center gap-3 font-semibold text-primary-200">
              Ir <ArrowRightIcon className="size-4 stroke-primary-200" />
            </span>
          </Link>
        </Button>
        <Button
          onClick={() => removeRecommendation(wallet.id)}
          size="sm"
          variant="destructive"
        >
          Remover
        </Button>
      </footer>
    </div>
  )
}
