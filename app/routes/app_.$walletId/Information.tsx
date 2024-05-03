import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useRevalidator,
} from '@remix-run/react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRightIcon, Cross2Icon } from '@radix-ui/react-icons'
import colors from 'tailwindcss/colors.js'
import { AnimatePresence, motion } from 'framer-motion'

import { brl, currencyToNumber } from '~/lib/formatting'

import { AssetWithPrice } from '~/services/assetService/index.server'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { EasyTooltip, Tooltip } from '~/components/ui/tooltip'
import { toast } from '~/components/ui/use-toast'

import Graph from '~/components/Graph'

import { loader as suggestionsLoader } from '../app.$walletId.suggestions'

import { loader } from './loader'
import { action, extractValue } from './action'

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
        {selected === 'graph' && <PieChart />}
      </main>
    </div>
  )
}

function Shopping() {
  const { type } = useLoaderData<typeof loader>()
  const [value, setValue] = useState('')

  const fetcherKey = useMemo(() => value + Date.now(), [value])

  const fetcher = useFetcher({ key: fetcherKey })

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
        fetcherKey={fetcherKey}
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
        <input type="hidden" name="type" value={type} />
        <Input
          value={value}
          onChange={(e) => setValue(brl(currencyToNumber(e.target.value)))}
          placeholder="R$ 0,00"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Calculando...' : 'Calcular'}
        </Button>
      </Form>

      <Result fetcherKey={fetcherKey} onClear={() => setValue('')} />
    </>
  )
}

type ResultProps = {
  fetcherKey: string
  // ideally we shoudn't rely on this method of clearing the suggestions
  // the best approach would be to reset the loader, as in this discussion
  // https://github.com/remix-run/remix/discussions/2749
  onClear: () => void
}
function Result({ fetcherKey, onClear }: ResultProps) {
  const { assets } = useLoaderData<typeof loader>()
  const { revalidate } = useRevalidator()
  const fetcher = useFetcher<typeof suggestionsLoader>({
    key: fetcherKey,
  })

  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'PUT')

  const data = fetcher.data

  useEffect(() => {
    if (actionResult === undefined) return

    if (actionResult.ok) {
      onClear()
      toast({
        title: 'Seus ativos foram atualizados!',
      })
      revalidate()
    } else {
      toast({
        title: 'Algo deu errado',
        variant: 'destructive',
      })
    }
  }, [actionResult])

  if (!data || !data.ok) {
    return null
  }
  if (data.value.assetsBought === 0) {
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

  const newAssets = assets.map((s) => {
    const amountToBuy = data.value.purchases[s.name] || 0
    return {
      id: s.id,
      name: s.name,
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
        <PurchasesCards purchases={data.value.purchases} />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <BarChart purchases={data.value.purchases} />
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onClear} variant="outline">
          Limpar
        </Button>
        <Form method="PUT">
          <Button name="assets" value={JSON.stringify(newAssets)}>
            Invesitr
          </Button>
        </Form>
      </div>
    </div>
  )
}

type PurchasesCardsProps = {
  purchases: Record<string, number>
}

function PurchasesCards({ purchases }: PurchasesCardsProps) {
  const { assets } = useLoaderData<typeof loader>()

  return Object.entries(purchases).map(([name, amount]) => {
    const asset = assets.find((s) => s.name === name)!
    return (
      <AssetCard key={name} name={name} amountToBuy={amount} oldAsset={asset} />
    )
  })
}

type AssetCardProps = {
  name: string
  amountToBuy: number
  oldAsset: AssetWithPrice
}

function AssetCard({ amountToBuy, name, oldAsset }: AssetCardProps) {
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
            {oldAsset.amount} <ArrowRightIcon className="inline size-4" />{' '}
            <p className="inline font-bold text-primary-200">
              {oldAsset.amount + amountToBuy}
            </p>
          </div>
          <div>
            <p>Valor total:</p>
            {brl(oldAsset.totalValue)}{' '}
            <ArrowRightIcon className="inline size-4" />{' '}
            <p className="inline font-bold text-primary-200">
              {brl(oldAsset.price * (oldAsset.amount + amountToBuy))}
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </>
  )
}

type BarChartProps = {
  purchases: Record<string, number>
}

function BarChart({ purchases }: BarChartProps) {
  const { assets, color } = useLoaderData<typeof loader>()

  const [selected, setSelected] = useState<string | null>(null)

  const filteredAssets = assets
    .filter((a) => purchases[a.name] !== undefined)
    .sort((a, b) => a.amount * a.price - b.amount * b.price)

  const max = Math.max(
    ...filteredAssets.map(
      (a) => (a.amount + (purchases[a.name] || 0)) * a.price,
    ),
  )

  return (
    <motion.div
      animate={{
        height: selected !== null ? 176 : 96,
      }}
      className="grid max-h-44 min-h-24 w-full grid-cols-[auto_1fr] overflow-hidden rounded-lg border border-gray-700 bg-gray-700/75 p-0.5"
    >
      <SelectedInfo
        asset={assets.find((a) => a.name === selected)!}
        purchasedAmount={purchases[selected || ''] || 0}
        clearSelected={() => setSelected(null)}
        hasSelected={selected !== null}
      />

      <div className="overflow-y-scroll">
        <div className="relative flex h-full w-max gap-1">
          {filteredAssets.map((a) => (
            <EasyTooltip
              open={selected === a.name || undefined} // Js is dumb
              delay={0}
              color={color}
              label={a.name}
              side="bottom"
              key={a.id}
            >
              <div
                onClick={() => setSelected(a.name)}
                className="group relative h-full min-w-8 max-w-12 overflow-hidden rounded-md transition data-[has-selected=true]:opacity-50 data-[selected=true]:opacity-100"
                data-selected={selected === a.name}
                data-has-selected={selected !== null}
              >
                <div
                  className="absolute inset-0 top-auto rounded-t-md bg-primary-600"
                  style={{
                    height:
                      (((purchases[a.name] || 0) * a.price) / max) * 100 + '%',
                    bottom: (a.totalValue / max) * 100 + '%',
                  }}
                />
                <div
                  className="absolute inset-0 top-auto rounded-b-md bg-primary-400"
                  style={{
                    height: (a.totalValue / max) * 100 + '%',
                  }}
                />
              </div>
            </EasyTooltip>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

type SelectedInfoProps = {
  asset: AssetWithPrice
  purchasedAmount: number
  clearSelected: () => void
  hasSelected: boolean
}
function SelectedInfo({
  asset,
  purchasedAmount,
  clearSelected,
  hasSelected,
}: SelectedInfoProps) {
  return (
    <AnimatePresence>
      {hasSelected && (
        <motion.div
          initial={{ width: 0, opacity: 0, padding: 0, marginRight: 0 }}
          animate={{ width: '10rem', opacity: 1, marginRight: 8, padding: 4 }}
          exit={{ width: 0, opacity: 0, marginRight: 0, padding: 0 }}
          className="min-w-0 overflow-hidden rounded-md bg-gray-600"
        >
          <header className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-primary-200">{asset.name}</h4>
            <Cross2Icon
              onClick={clearSelected}
              className="size-4 cursor-pointer"
            />
          </header>
          <div className="text-sm">
            <p>
              Comprar {purchasedAmount} cotas (
              {brl(purchasedAmount * asset.price)})
            </p>
            <p>
              Atual {asset.amount} cotas ({brl(asset.totalValue)})
            </p>
            <p className="mt-1 font-bold text-primary-200">
              Total {asset.amount + purchasedAmount} cotas (
              {brl((asset.amount + purchasedAmount) * asset.price)})
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PieChart() {
  const { assets, color } = useLoaderData<typeof loader>()

  return (
    <Graph
      data={assets}
      value="totalValue"
      name="name"
      colorStops={[colors[color][200], colors[color][700]]}
      h={50}
    />
  )
}
