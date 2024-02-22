import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { ArrowRightIcon } from '@radix-ui/react-icons'

import { brl, currencyToNumber } from '~/lib/formatting'

import { StockWithPrice } from '~/services/stockService/index.server'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Tooltip } from '~/components/ui/tooltip'

import { loader as suggestionsLoader } from '../app.$walletId.suggestions'

import { loader } from './loader'
import { action, extractValue } from './action'
import { toast } from '~/components/ui/use-toast'

export default function Information() {
  const [selected, setSelected] = useState<'invest' | 'graph'>('invest')

  return (
    <div className="h-min overflow-hidden rounded-lg bg-gray-700/50">
      <menu
        className="flex justify-center gap-1 bg-gray-700 px-3 py-1"
        type="toolbar"
      >
        <li
          data-selected={selected === 'invest'}
          className="rounded px-3 py-1 transition-colors hover:bg-primary-400/25 data-[selected=true]:bg-primary-600/50 data-[selected=true]:text-primary-50 data-[selected=true]:shadow"
        >
          <button onClick={() => setSelected('invest')}>Investir</button>
        </li>
        <li
          data-selected={selected === 'graph'}
          className="rounded px-3 py-1 transition-colors hover:bg-primary-400/25 data-[selected=true]:bg-primary-600/50 data-[selected=true]:text-primary-50 data-[selected=true]:shadow"
        >
          <button onClick={() => setSelected('graph')}>Gráfico</button>
        </li>
      </menu>

      <main className="p-3">
        {selected === 'invest' && <Shopping />}
        {selected === 'graph' && <Graph />}
      </main>
    </div>
  )
}

function Shopping() {
  const [value, setValue] = useState('')

  const fetcher = useFetcher({ key: 'shopping' + currencyToNumber(value) })

  const isSubmitting = fetcher.state !== 'idle'

  return (
    <>
      <header className="mb-3">
        <p className="text-sm text-gray-200">
          Selecione quanto deseja aportar que nós dizemos em quais ativos
          investir
        </p>
        <Button
          asChild
          variant="link"
          size="sm"
          className="p-0 text-primary-100"
        >
          <Link to="/help">Como funciona</Link>
        </Button>
      </header>
      <Form
        fetcherKey={'shopping' + currencyToNumber(value)}
        action="suggestions"
        method="GET"
        navigate={false}
        className="flex items-start gap-2"
      >
        <input
          type="hidden"
          name="amount"
          value={currencyToNumber(value || '')}
        />
        <Input
          value={value}
          onChange={(e) => setValue(brl(currencyToNumber(e.target.value)))}
          placeholder="R$ 0,00"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Calculando...' : 'Calcular'}
        </Button>
      </Form>

      <Result amount={currencyToNumber(value)} onClear={() => setValue('')} />
    </>
  )
}

type ResultProps = {
  amount: number
  // ideally we shoudn't rely on this method of clearing the suggestions
  // the best approach would be to reset the loader, as in this discussion
  // https://github.com/remix-run/remix/discussions/2749
  onClear: () => void
}
function Result({ amount, onClear }: ResultProps) {
  const { stocks } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()
  const fetcher = useFetcher<typeof suggestionsLoader>({
    key: 'shopping' + amount,
  })

  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'PUT')

  const data = fetcher.data

  useEffect(() => {
    if (actionResult?.ok) {
      onClear()
      toast({
        title: 'Seus ativos foram atualizados!',
      })
      revalidate()
    }
  }, [actionResult])

  if (!data || !data.ok) {
    return null
  }
  if (data.value.stocksBought === 0) {
    return (
      <div className="mt-4">
        <strong className="text-lg font-semibold text-primary-200">
          Não foi possível equilibrar seus invsetimentos {':('}
        </strong>
        <p className="mt-2">
          Com {brl(data.value.totalAmount)} não é possível comprar nenhum ativo
          da sua carteira.
        </p>
        <p className="mt-1">
          Se você acha que isso é um erro ou possui alguma dúvida, veja nossas{' '}
          <Button asChild variant="link" className="p-0 text-primary-100">
            <Link to="/faq">perguntas frequentes</Link>
          </Button>{' '}
          ou{' '}
          <Button asChild variant="link" className="p-0 text-primary-100">
            <Link to="/feedback">envie feedback.</Link>
          </Button>
        </p>
      </div>
    )
  }

  const newStocks = stocks.map((s) => {
    const amountToBuy = data.value.purchases[s.ticker] || 0
    return {
      id: s.id,
      ticker: s.ticker,
      amount: s.amount + amountToBuy,
    }
  })

  return (
    <div className="mt-4">
      <h3 className="text-lg">
        Com{' '}
        <strong className="font-bold text-primary-200">
          {brl(data.value.totalAmount)}
        </strong>
        , você pode comprar:{' '}
      </h3>

      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(data.value.purchases).map(([ticker, amount]) => {
          const stock = stocks.find((s) => s.ticker === ticker)!
          return (
            <StockCard
              key={ticker}
              name={ticker}
              amountToBuy={amount}
              oldStock={stock}
            />
          )
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onClear} variant="outline">
          Limpar
        </Button>
        <Form method="PUT">
          <Button name="stocks" value={JSON.stringify(newStocks)}>
            Invesitr
          </Button>
        </Form>
      </div>
    </div>
  )
}

type StockCardProps = {
  name: string
  amountToBuy: number
  oldStock: StockWithPrice
}

function StockCard({ amountToBuy, name, oldStock }: StockCardProps) {
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
            {oldStock.amount} <ArrowRightIcon className="inline size-4" />{' '}
            <p className="inline font-bold text-primary-200">
              {oldStock.amount + amountToBuy}
            </p>
          </div>
          <div>
            <p>Valor total:</p>
            {brl(oldStock.totalValue)}{' '}
            <ArrowRightIcon className="inline size-4" />{' '}
            <p className="inline font-bold text-primary-200">
              {brl(oldStock.price * (oldStock.amount + amountToBuy))}
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </>
  )
}

function Graph() {
  return 'not implemented'
}
