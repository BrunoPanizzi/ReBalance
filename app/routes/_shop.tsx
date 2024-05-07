import { Link, Outlet, useFetcher, useMatches } from '@remix-run/react'
import {
  ArrowRightIcon,
  BackpackIcon,
  ChevronDownIcon,
  Cross1Icon,
} from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'

import { cn } from '~/lib/utils'
import { brl, currencyToNumber, percentage } from '~/lib/formatting'

import { FullWalletWithAssets } from '~/services/walletService'

import { loader } from './suggestions'

import Wrapper from '~/components/Wrapper'
import { Button } from '~/components/ui/button'
import { AmountForm } from '~/components/AmountForm'

export default function Shop() {
  const matches = useMatches()

  const [isExpanded, setIsExpanded] = useState(false)

  const isWalletPage = matches.some(
    (m) => m.id === 'routes/_shop.app_.$walletId',
  )

  if (isWalletPage && !isExpanded) {
    return <Outlet />
  }

  return (
    <>
      <Outlet />
      <Wrapper className="pointer-events-none fixed left-1/2 top-0 block min-h-screen w-full -translate-x-1/2">
        <div
          data-expanded={isExpanded}
          className="pointer-events-auto absolute bottom-6 right-3 rounded-xl border border-primary-600 bg-gray-700 shadow-md transition-all data-[expanded=true]:bottom-16 sm:right-0"
        >
          {isExpanded ? (
            <ExpandedShop onClose={() => setIsExpanded(false)} />
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
    </>
  )
}

type ExpandedShopProps = {
  onClose: () => void
}

function ExpandedShop({ onClose }: ExpandedShopProps) {
  const fetcherKey = useMemo(() => 'suggestions' + Math.random(), [])

  const fetcher = useFetcher<typeof loader>({
    key: fetcherKey,
  })
  const data = fetcher.data

  const [value, setValue] = useState('')

  const isSubmitting = fetcher.state !== 'idle'

  return (
    <div className="min-w-64 max-w-96 p-4">
      <header className="mb-4 grid grid-cols-[1fr_auto] items-center gap-x-2">
        <h2 className="text-xl font-bold text-primary-200">
          {data ? `Investir ${value}` : 'Área de aporte'}
        </h2>
        <Button onClick={onClose} className="group" size="icon" variant="ghost">
          <Cross1Icon className="size-3 stroke-gray-400 transition-colors group-hover:stroke-red-400" />
        </Button>
        {data === undefined && (
          <p className="col-span-2 text-sm">
            Insira quanto você deseja aportar que nós distribuiremos essa
            quantia entre suas carteiras.
          </p>
        )}
      </header>

      {data === undefined ? (
        <AmountForm
          value={value}
          setValue={setValue}
          isSubmitting={isSubmitting}
          handleSubmit={() =>
            fetcher.submit(
              { amount: currencyToNumber(value), blackListedIds: [] },
              { method: 'GET', navigate: false, action: 'suggestions' },
            )
          }
        />
      ) : (
        <div className="flex max-h-96 flex-col gap-2 overflow-y-scroll">
          {data.purchases.map((p) => (
            <WalletPurchaseCard
              key={p.wallet.id}
              wallet={p.wallet}
              investedAmount={p.amount}
              prevTotalValue={data.prevTotalValue}
              newTotalValue={data.newTotalValue}
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
        <Button size="sm" variant="destructive">
          Remover
        </Button>
      </footer>
    </div>
  )
}
