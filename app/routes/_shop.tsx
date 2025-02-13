import { Link, Outlet, useFetcher, useMatches } from 'react-router'
import {
  ArrowRightIcon,
  BackpackIcon,
  CheckIcon,
  ChevronDownIcon,
  Cross1Icon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { AnimatePresence, motion, stagger } from 'framer-motion'

import { cn } from '~/lib/utils'
import { brl, currencyToNumber, percentage } from '~/lib/formatting'

import { FullWalletWithAssets } from '~/services/walletService/index.server'
import { ShoppingList } from '~/services/shopService'

import { loader } from './suggestions'

import Wrapper from '~/components/Wrapper'
import { Button } from '~/components/ui/button'
import { AmountForm } from '~/components/AmountForm'

// TODO: maybe useReducer to simplify the state management?
type ShopContext = {
  isExpanded: boolean
  setIsExpanded: (value: boolean) => void
  step: 'initial' | 'list' | 'final'
  value: string
  setValue: (value: string) => void
  shopRecommendations: ShoppingList | null
  removeRecommendation: (id: string) => void
  fetchRecommendations: () => void
  clearRecommendations: () => void
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

  const [fetcherKey, setFetcherKey] = useState('suggestions' + Math.random())

  const fetcher = useFetcher<typeof loader>({
    key: fetcherKey,
  })
  const [data, setData] = useState<ShoppingList | null>(fetcher.data || null)
  const [step, setStep] = useState<ShopContext['step']>('initial')

  const [isExpanded, setIsExpanded] = useState(false)
  const [value, setValue] = useState('')

  const fetchRecommendations = () => {
    fetcher.submit(
      { amount: currencyToNumber(value), blackListedIds: [] },
      { method: 'GET', action: 'suggestions' },
    )
  }

  const removeRecommendation = (id: string) => {
    if (!data) return

    const recomendation = data.purchases.find((p) => p.wallet.id === id)

    if (!recomendation) {
      console.error(`Recommendation with id ${id} not found`)
      return
    }

    setValue((p) => brl(currencyToNumber(p) - recomendation.amount))

    setData((data) => {
      if (!data) return null
      return {
        ...data,
        purchases: data.purchases.filter((p) => p.wallet.id !== id),
      }
    })

    // 1 because state has not updated
    if (data.purchases.length === 1) {
      setStep('final')
    }
  }

  const clearRecommendations = () => {
    setFetcherKey('suggestions' + Math.random())
    setValue(brl(0))
  }

  const isWalletPage = matches.some(
    (m) => m.id === 'routes/_shop.app_.$walletId',
  )

  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data)
      setStep('list')
      return
    }
    setData(null)
    setStep('initial')
  }, [fetcher.data])

  if (isWalletPage && !isExpanded) {
    return <Outlet />
  }

  return (
    <shopContext.Provider
      value={{
        isExpanded,
        step,
        setIsExpanded,
        value,
        setValue,
        shopRecommendations: data || null,
        fetchRecommendations,
        removeRecommendation,
        clearRecommendations,
        isSubmitting: fetcher.state !== 'idle',
      }}
    >
      <Outlet />
      <Wrapper className="pointer-events-none fixed left-1/2 top-0 block min-h-screen w-full -translate-x-1/2">
        <div
          data-expanded={isExpanded}
          className={cn(
            'pointer-events-auto absolute bottom-0 right-3 rounded-xl border-primary-600 bg-gray-700/75 shadow-md backdrop-blur-md transition-all data-[expanded=false]:bottom-6 data-[expanded=true]:border sm:right-0 data-[expanded=true]:sm:bottom-16',
            'bottom-0 left-0 right-0 rounded-b-none'
              .split(' ')
              .map((c) => 'data-[expanded=true]:max-sm:' + c),
          )}
        >
          {isExpanded ? (
            <ExpandedShop />
          ) : (
            <button
              onClick={() => setIsExpanded(true)}
              className="relative flex size-14 items-center justify-center rounded-xl border-4 border-primary-800 bg-primary-300 "
            >
              <BackpackIcon className="size-7 stroke-primary-800" />
              {data && (
                <span className="absolute bottom-0 right-0 aspect-square translate-x-1/2 translate-y-1/2 rounded-full border-2 border-primary-800 bg-primary-300 px-1 py-0.5 font-bold text-primary-950">
                  {data.purchases.length}
                </span>
              )}
            </button>
          )}
        </div>
      </Wrapper>
    </shopContext.Provider>
  )
}

function ExpandedShop() {
  return (
    <div className=" w-full p-4 sm:w-96">
      <ExpandedShopHeader />

      <AnimatePresence>
        <ExpandedShopContent />
      </AnimatePresence>
    </div>
  )
}

function ExpandedShopHeader() {
  const { step, clearRecommendations, value, setIsExpanded } = useShop()

  let title: string
  let subtitle: JSX.Element | null = null

  switch (step) {
    case 'initial':
      title = 'Área de aporte'
      subtitle = (
        <p className="col-span-2 text-sm">
          Insira o valor que deseja investir e nós te ajudaremos a distribuir
          esse valor entre suas carteiras.
        </p>
      )
      break
    case 'list':
      title = `Investir ${value}`
      break
    case 'final':
      title = 'Aporte concluído!'
      subtitle = (
        <p className="col-span-2">
          Seus investimentos foram distribuídos com sucesso.
        </p>
      )
      break
  }

  return (
    <header className="mb-4 grid grid-cols-[1fr_auto_auto] items-center gap-x-2">
      <h2 className="text-xl font-bold text-primary-200">{title}</h2>
      {step === 'list' && (
        <Button
          onClick={clearRecommendations}
          size="icon"
          className="group"
          variant="ghost"
          title="Limpar"
        >
          <ReloadIcon className="size-4 stroke-gray-400 transition-transform group-hover:rotate-45" />
        </Button>
      )}
      <Button
        onClick={() => setIsExpanded(false)}
        className="group"
        size="icon"
        variant="ghost"
        title={step === 'list' ? 'Minimizar' : 'Fechar'}
      >
        {step === 'list' ? (
          <ChevronDownIcon className="size-4 stroke-gray-400 transition-transform group-hover:translate-y-0.5 " />
        ) : (
          <Cross1Icon className="size-4 stroke-gray-400 transition-colors group-hover:stroke-red-400" />
        )}
      </Button>

      {subtitle}
    </header>
  )
}

function ExpandedShopContent() {
  const {
    step,
    value,
    setValue,
    isSubmitting,
    shopRecommendations,
    fetchRecommendations,
    clearRecommendations,
    setIsExpanded,
  } = useShop()

  switch (step) {
    case 'initial':
      return (
        <AmountForm
          value={value}
          setValue={setValue}
          isSubmitting={isSubmitting}
          handleSubmit={fetchRecommendations}
        />
      )

    case 'list':
      return (
        <motion.div
          transition={{
            type: 'spring',
            stiffness: 75,
            mass: 0.8,
            damping: 14,
          }}
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="max-h-96 overflow-y-scroll"
        >
          <AnimatePresence mode="popLayout">
            {shopRecommendations?.purchases.map((p, i) => (
              <WalletPurchaseCard
                i={i}
                key={p.wallet.id}
                wallet={p.wallet}
                investedAmount={p.amount}
                prevTotalValue={shopRecommendations!.prevTotalValue}
                newTotalValue={shopRecommendations!.newTotalValue}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )

    case 'final':
      return (
        <footer className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              clearRecommendations()
              setIsExpanded(false)
            }}
          >
            Fechar
          </Button>
          <Button onClick={clearRecommendations}>Novo aporte</Button>
        </footer>
      )
  }
}

type WalletPurchaseCardProps = {
  i: number
  wallet: FullWalletWithAssets
  investedAmount: number
  prevTotalValue: number
  newTotalValue: number
}

function WalletPurchaseCard({
  i,
  wallet,
  prevTotalValue,
  newTotalValue,
  investedAmount,
}: WalletPurchaseCardProps) {
  const { removeRecommendation } = useShop()
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      transition={{ type: 'spring', damping: 20, delay: 0.075 * i + 0.1 }}
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{ marginBlockEnd: '0.5rem' }}
      exit={{
        height: 0,
        opacity: 0,
        scale: 0.9,
        marginBlockEnd: 0,
        transition: { duration: 0.2 },
      }}
    >
      <div
        data-color={wallet.color}
        className="rounded-lg border-l-8 border-primary-400 bg-primary-600/25 p-2 pl-4"
      >
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 ">
          <h4 className="text-xl font-semibold text-primary-100">
            {wallet.title}
          </h4>

          <span className="ml-4 text-xl font-semibold text-primary-100">
            +{brl(investedAmount)}
          </span>

          <button
            className="aspect-square rounded bg-primary-400 p-1"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDownIcon
              className={cn(
                'stroke-primary-950 transition-transform delay-75',
                {
                  'rotate-180 transform': expanded,
                },
              )}
            />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-4 flex items-center justify-end gap-2">
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
            className="gap-1 bg-emerald-400 pl-2 text-emerald-950 hover:bg-emerald-500"
            onClick={() => removeRecommendation(wallet.id)}
            size="sm"
          >
            <CheckIcon className="size-5" /> Confirmar compra
          </Button>
        </footer>
      </div>
    </motion.div>
  )
}
