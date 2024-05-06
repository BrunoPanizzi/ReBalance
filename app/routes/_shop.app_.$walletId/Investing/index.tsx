import { Link, useFetcher } from '@remix-run/react'
import { useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'

import { loader as suggestionsLoader } from '~/routes/app.$walletId.suggestions'

import { AmountForm } from './AmountForm'
import { useOnAssetsUpdated } from './useOnAssetsUpdate'
import { Results } from './Results'

export default function Investing() {
  const [value, setValue] = useState('')

  useOnAssetsUpdated(() => setValue(''))

  const fetcherKey = useMemo(() => value + Date.now(), [value])

  const fetcher = useFetcher<typeof suggestionsLoader>({ key: fetcherKey })

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

      <AmountForm {...{ fetcherKey, value, setValue, isSubmitting }} />

      <Results onClear={() => setValue('')} data={fetcher.data} />
    </>
  )
}
