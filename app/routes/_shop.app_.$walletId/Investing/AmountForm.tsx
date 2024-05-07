import { brl, currencyToNumber } from '~/lib/formatting'

import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

type AmountFormProps = {
  value: string
  setValue: (value: string) => void
  isSubmitting: boolean
  handleSubmit: () => void
}

export function AmountForm({
  setValue,
  value,
  isSubmitting,
  handleSubmit,
}: AmountFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="flex items-start gap-2"
    >
      <Input
        value={value}
        onChange={(e) => setValue(brl(currencyToNumber(e.target.value)))}
        placeholder="R$ 0,00"
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Calculando...' : 'Calcular'}
      </Button>
    </form>
  )
}
