import { Form, useLoaderData } from '@remix-run/react'

import { brl, currencyToNumber } from '~/lib/formatting'

import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

import { loader } from '../loader'

type AmountFormProps = {
  fetcherKey: string
  value: string
  setValue: (value: string) => void
  isSubmitting: boolean
}

export function AmountForm({
  fetcherKey,
  setValue,
  value,
  isSubmitting,
}: AmountFormProps) {
  const { type } = useLoaderData<typeof loader>()

  return (
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
  )
}
