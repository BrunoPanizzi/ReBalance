import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react'
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
import { Dialog } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

import { loader as recommendationsLoader } from './recommendations'
import debounce from '~/lib/debounce'
import { useDebouncedState } from '~/hooks/useDebouncedState'
import { z } from 'zod'
import { Result } from '~/types/Result'
import { ErrorT } from '~/context/ErrorContext'
import { Stock } from '~/services/db/schema/stock.server'

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
      <NewStockModal />
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

  const navigate = useNavigate()

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
              onClick={() => navigate('?new')}
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

const StockRow = memo(({ stock }: StockRowProps) => {
  console.log(stock.ticker, 'rerendering')

  return (
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
  )
})

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
        className="rounded-md border border-primary-400/50 p-2 transition-colors hover:border-primary-400"
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

function NewStockModal() {
  const fetcher = useFetcher<typeof recommendationsLoader>({
    key: 'recommendations',
  })

  const [search, setSearch] = useDebouncedState('', 200)

  const [searchParams, setSearchParams] = useSearchParams()

  const shouldOpen = searchParams.get('new')

  useEffect(() => {
    fetcher.submit({ search }, { method: 'GET', action: '/recommendations' })
  }, [search])

  if (shouldOpen === null) return null

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(to) => {
        if (!to) setSearchParams({}, { replace: true })
      }}
    >
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>Buscar um ativo:</Dialog.Title>
        </Dialog.Header>
        <fetcher.Form
          method="GET"
          // TODO: see if this is the best way of doing this, seems jank
          action="/recommendations"
          className="flex w-full gap-2"
        >
          <Input
            name="search"
            autoComplete="off"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
          />
        </fetcher.Form>

        <SuggestionsList />
      </Dialog.Content>
    </Dialog.Root>
  )
}

function SuggestionsList() {
  const fetcher = useFetcher<typeof recommendationsLoader>({
    key: 'recommendations',
  })

  if (!fetcher.data) return null

  const { recommendations, search } = fetcher.data

  if (!recommendations) return 'shit'

  if (recommendations.length > 0) {
    return (
      <Form
        method="POST"
        className={cn('grid w-full grid-flow-row gap-2 text-white', {
          'grid-cols-1': recommendations.length === 1,
          'grid-cols-2': recommendations.length >= 2,
          'grid-cols-3': recommendations.length > 4,
        })}
      >
        {
          // TODO: interactive semantics for acessibility
          recommendations.map((s) => (
            <label
              key={s}
              className="peer rounded-lg border border-gray-500 px-4 py-2 text-xl font-bold text-primary-200 transition hover:-translate-y-0.5 has-[:checked]:border-primary-500"
            >
              <input value={s} name="stock" type="radio" hidden />
              {s}
            </label>
          ))
        }
        <Button className="col-span-full mt-2 hidden w-full peer-has-[:checked]:block">
          Adicionar
        </Button>
      </Form>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-primary-200">
          Ativo não encontrado
        </h2>
        <span className="text-white">
          Não foi encontrado nenhum ativo para{' '}
          <strong className="font-bold text-primary-300">{search}</strong>, você
          tem certeza de que ele existe?
        </span>
      </div>
    )
  }
}

const formSchema = z.object({
  stock: z.string().min(1),
})

export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<TypedResponse<Result<Stock, ErrorT[]>>> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const walletId = params.walletId

  if (!walletId) {
    return json({
      ok: false,
      error: [{ message: 'no wallet id found', type: 'request' }],
    })
  }

  const formData = await request.formData()

  const result = formSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return json({
      ok: false,
      error: result.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  const { stock } = result.data

  const newStock = await WalletService.addStock(user.uid, walletId, {
    amount: 0,
    ticker: stock,
  })

  return json({
    ok: true,
    value: newStock,
  })
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
