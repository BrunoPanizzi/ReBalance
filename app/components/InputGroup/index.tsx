import { useError } from '~/context/ErrorContext'

import { Label } from '../ui/label'
import { Input } from '../ui/input'
import type { InputProps } from '../ui/input'

export type InputGroupProps = {
  name: string
  label?: string
  input?: InputProps
}

export default function InputGroup({ name, label, input }: InputGroupProps) {
  const errorContext = useError({ validateProvider: false })

  const error = errorContext?.errors.find((error) => error.type === name)
  const hasError = error?.type === name

  return (
    <>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input name={name} data-error={hasError} {...input} />
      {hasError && (
        <Label htmlFor={name} className="-mt-1 mb-1 text-red-400">
          {error.message}
        </Label>
      )}
    </>
  )
}
