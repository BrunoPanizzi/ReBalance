import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'

import { cn } from '~/lib/utils'
import { brl, currencyToNumber } from '~/lib/formatting'

import { useDebouncedState } from '~/hooks/useDebouncedState'

import { ErrorProvider } from '~/context/ErrorContext'

import { loader as recommendationsLoader } from '~/routes/recommendations'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { toast } from '~/components/ui/use-toast'

import { InputGroup } from '~/components/FormGroups'

import { action, extractValue } from './action'
import { loader } from './loader'

export function NewAssetModal() {
  const [searchParams, setSearchParams] = useSearchParams()

  const shouldOpen = searchParams.get('new')

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
          <Dialog.Title>Novo ativo</Dialog.Title>
        </Dialog.Header>

        <ContentMux />
      </Dialog.Content>
    </Dialog.Root>
  )
}

function ContentMux() {
  const { type } = useLoaderData<typeof loader>()

  if (type === 'br-stock') {
    return <BrStocks />
  } else if (type === 'fixed-value') {
    return <FixedValue />
  }

  throw new Error(
    `New asset creation is not implemented for wallet type ${type}.`,
  )
}

function FixedValue() {
  const { type } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'POST')

  const errors = actionResult?.ok === false && actionResult.error

  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState<number | null>(null)
  const amountAsNumber = Number(amount)

  console.log(amount, amountAsNumber)

  return (
    <Form method="POST" className="flex flex-col gap-2">
      <ErrorProvider initialErrors={errors || []}>
        <input type="hidden" name="type" value={type} />

        <div>
          <InputGroup
            name="name"
            label="Nome do ativo"
            input={{ placeholder: 'Nome...', className: 'w-full' }}
          />
        </div>

        <div>
          <InputGroup
            name="initialAmount"
            label="Quantidade inicial"
            input={{
              placeholder: 'Quantidade...',
              value: amount,
              onChange: (e) => {
                if (
                  !isNaN(Number(e.target.value)) &&
                  Number(e.target.value) < 10e12
                  // a trillion should be enough for everybody right?
                ) {
                  setAmount(e.target.value)
                }
              },
              className: 'w-full',
            }}
          />
        </div>

        <div>
          <InputGroup
            name="price"
            label="Preço atual"
            input={{
              placeholder: 'R$ 0,00',
              value: price ? brl(price) : '',
              onChange: (e) => setPrice(currencyToNumber(e.target.value)),
              className: 'w-full',
            }}
          />
        </div>

        <span className="flex justify-between border-b border-dashed border-gray-400">
          Valor total:
          <span className="font-semibold text-primary-200">
            {brl((price || 0) * amountAsNumber)}
          </span>
        </span>

        <span className="block pt-2">
          <Button className="w-full">Adicionar</Button>
        </span>
      </ErrorProvider>
    </Form>
  )
}

function BrStocks() {
  const fetcher = useFetcher<typeof recommendationsLoader>({
    key: 'recommendations',
  })

  const [search, setSearch] = useDebouncedState('', 200)

  useEffect(() => {
    fetcher.submit({ search }, { method: 'GET', action: '/recommendations' })
  }, [search])

  return (
    <>
      <fetcher.Form
        method="GET"
        action="/recommendations"
        className="flex w-full gap-2"
      >
        <Input
          name="search"
          autoComplete="off"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="w-full"
        />
      </fetcher.Form>

      <SuggestionsList />
    </>
  )
}

function SuggestionsList() {
  const { type } = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const fetcher = useFetcher<typeof recommendationsLoader>({
    key: 'recommendations',
  })

  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'POST')

  const message = actionResult?.ok
    ? `${actionResult.value.name} adicionado com sucesso!`
    : `Algo deu errado ao adicionar o ativo.`

  useEffect(() => {
    if (actionData === undefined) return

    toast({
      title: message,
      variant: actionResult?.ok ? 'default' : 'destructive',
    })
  }, [actionResult, message])

  if (!fetcher.data) return null

  const { recommendations, search } = fetcher.data

  if (!recommendations) return null

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
              className="peer rounded-lg border border-gray-500 px-4 py-2 text-center text-xl font-bold text-primary-200 transition hover:-translate-y-0.5 has-[:checked]:border-primary-500"
            >
              <input value={s} name="name" type="radio" hidden />
              {s}
            </label>
          ))
        }
        <input type="hidden" name="type" value={type} />
        <Button
          disabled={state !== 'idle'}
          className="col-span-full mt-1 hidden w-full peer-has-[:checked]:block"
        >
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
