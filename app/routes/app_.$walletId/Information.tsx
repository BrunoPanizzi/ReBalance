import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { brl, currencyToNumber } from '~/lib/formatting'
import { loader as suggestionsLoader } from '../app.$walletId.suggestions'
import { loader } from './loader'
import { StockWithPrice } from '~/services/stockService/index.server'
import { Tooltip } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'
import { ArrowRightIcon } from '@radix-ui/react-icons'

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
  const fetcher = useFetcher({ key: 'shopping' })

  const [value, setValue] = useState<string>('')

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
      <fetcher.Form
        action="suggestions"
        method="GET"
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
        <Button type="submit" disabled={fetcher.state === 'loading'}>
          {fetcher.state === 'loading' ? 'Calculando...' : 'Calcular'}
        </Button>
      </fetcher.Form>
      <Result />
    </>
  )
}

function Result() {
  const { stocks } = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof suggestionsLoader>({ key: 'shopping' })

  const data = fetcher.data

  let state = 'initial'
  if (data?.ok) {
    state = data.value.stocksBought === 0 ? 'no-results' : 'results'
  }

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

/*
  return (
    <Switch>
      <Match when={state() === 'results'}>
        <div class="mt-4">
          <h3 class="text-lg">
            Com{' '}
            <strong class="text-secondary-200 font-bold">
              {brl(purchase()!.totalAmount)}
            </strong>
            , você pode comprar:{' '}
          </h3>

          <div class="mt-2 flex flex-wrap gap-2">
            <For each={Object.keys(purchase()!.purchases)}>
              {(item) => {
                const stock = stocks.find((s) => s.ticker === item)!
                return (
                  <StockCard
                    name={item}
                    amountToBuy={purchase()!.purchases[item]}
                    oldStock={stock}
                  />
                )
              }}
            </For>
          </div>

          <span class="mt-4 flex items-center justify-between">
            <p>E com {brl(purchase()!.amountLeft)} de troco!</p>
            <Button onClick={handleApplyAll} size="sm">
              Aplicar sugestões
            </Button>
            <Show when={purchases()}>
              <Button
                onClick={() => {
                  handleInvestAndRecalculate(
                    wallet(),
                    purchase()!.totalAmount - purchase()!.amountLeft,
                  )
                  handleApplyAll()
                }}
                size="sm"
              >
                Investir e recalcular
              </Button>
            </Show>
          </span>
        </div>
      </Match>

      <Match when={state() === 'no-results'}>
        <div class="mt-4">
          <h3 class="text-secondary-100 text-lg font-semibold">
            Quantia insuficiente!
          </h3>
          <p class="mb-1">
            Desculpe, mas com{' '}
            <strong class="text-secondary-200 font-semibold">
              {brl(purchase()!.totalAmount)}
            </strong>{' '}
            não é possível comprar nada.
          </p>
          <p class="mb-1">
            Se acredita que isso seja um engano, verifique-se de que todos os
            ativos estejam com o preço atualizado.
          </p>

          <hr class="border-secondary-400/40 mb-3 mt-4" />

          <p class="mb-1 text-gray-200">
            Para mais informações, veja{' '}
            <a
              class="text-secondary-400 visited:text-secondary-400/75 underline"
              href="/blog"
            >
              como o cálculo é realizado.
            </a>
          </p>
          <a
            class="text-secondary-400 visited:text-secondary-400/75 underline"
            href="/feedback"
          >
            Relatar um problema.
          </a>
        </div>
      </Match>
    </Switch>
  )
  */

function Graph() {
  return 'not implemented'
}
