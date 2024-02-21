import { Link } from '@remix-run/react'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

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
          className="rounded px-3 py-1 transition-colors hover:bg-primary-400/25 data-[selected=true]:bg-primary-600/50 data-[selected=true]:text-primary-50"
        >
          <button onClick={() => setSelected('invest')}>Investir</button>
        </li>
        <li
          data-selected={selected === 'graph'}
          className="rounded px-3 py-1 transition-colors hover:bg-primary-400/25 data-[selected=true]:bg-primary-600/50 data-[selected=true]:text-primary-50"
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
          className="p-0 text-primary-300"
        >
          <Link to="/help">Como funciona</Link>
        </Button>
      </header>
      <form className="flex items-start gap-2">
        <Input placeholder="R$ 0,00" />
        <Button type="submit">Calcular</Button>
      </form>
      <Result />
    </>
  )
}

function Result() {
  //   const { purchases, handleInvestAndRecalculate } = useGlobalShoppingContext()

  //   const { state, purchase, handleApplyAll } = useShopping()
  //   const { stocks, wallet } = useStocks()
  const state: string = 'initial'

  switch (state) {
    case 'initial':
      return null
    case 'no-results':
      return 'no results found'
    case 'results':
      return 'here are the results'
  }

  return

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
}

function Graph() {
  return 'not implemented'
}
