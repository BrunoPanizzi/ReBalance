import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import { useEffect, useMemo, useState } from 'react'

import { brl, currencyToNumber } from '~/lib/formatting'

import { Button } from '~/components/ui/button'
import { AmountForm } from '~/components/AmountForm'

import { loader as suggestionsLoader } from '~/routes/app.$walletId.suggestions'

import { loader } from '../loader'

import { useOnAssetsUpdated } from './useOnAssetsUpdate'
import { Results } from './Results'

export default function Investing() {
  const { type } = useLoaderData<typeof loader>()

  const [searchParams] = useSearchParams()
  const hasAmount = searchParams.has('amount')
  const initialAmount = hasAmount
    ? brl(parseInt(searchParams.get('amount')!))
    : ''

  const [value, setValue] = useState(initialAmount)

  const fetcherKey = useMemo(() => value + Date.now(), [value])
  const fetcher = useFetcher<typeof suggestionsLoader>({ key: fetcherKey })

  const isSubmitting = fetcher.state !== 'idle'

  const handleSubmit = () => {
    fetcher.submit(
      {
        type,
        amount: currencyToNumber(value),
      },
      {
        method: 'GET',
        navigate: false,
        action: 'suggestions',
      },
    )
  }

  useOnAssetsUpdated(() => setValue(''))

  useEffect(() => {
    if (hasAmount && !fetcher.data && !isSubmitting) {
      handleSubmit()
    }
  }, [])

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

      <AmountForm {...{ value, setValue, isSubmitting, handleSubmit }} />

      <Results onClear={() => setValue('')} data={fetcher.data} />
    </>
  )
}
