import {
  Form,
  useActionData,
  useFetcher,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useEffect } from 'react'

import { cn } from '~/lib/utils'

import { useDebouncedState } from '~/hooks/useDebouncedState'

import { loader as recommendationsLoader } from '~/routes/recommendations'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'

import { action } from './action'

export function NewStockModal() {
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
  const { state } = useNavigation()
  const fetcher = useFetcher<typeof recommendationsLoader>({
    key: 'recommendations',
  })

  const actionData = useActionData<typeof action>()

  const displayMessage = actionData !== undefined && state === 'idle'
  const isError = actionData?.ok === false
  const message = actionData?.ok
    ? `${actionData.value.ticker} adicionado com sucesso!`
    : `Algo deu errado ao adicionar o ativo.`

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
        <div className="col-span-full mt-1 hidden peer-has-[:checked]:block">
          {displayMessage && (
            <span
              className={cn('text-sm', {
                'text-red-300': isError,
                'text-primary-300': !isError,
              })}
            >
              {message}
            </span>
          )}
          <Button disabled={state !== 'idle'} className="mt-1 w-full">
            Adicionar
          </Button>
        </div>
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
