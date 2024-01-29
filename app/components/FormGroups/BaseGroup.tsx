import { Label } from '~/components/ui/label'

import { useError } from '~/context/ErrorContext'

export type GroupProps = {
  name: string
  label?: string
  children: React.ReactNode
}

export default function BaseGroup({ name, label, children }: GroupProps) {
  const errorContext = useError({ validateProvider: false })

  const error = errorContext?.errors.find((error) => error.type === name)
  const hasError = error?.type === name

  return (
    <>
      {label && <Label htmlFor={name}>{label}</Label>}
      {children}
      {hasError && (
        <Label htmlFor={name} className="-mt-1 mb-1 text-red-400">
          {error.message}
        </Label>
      )}
    </>
  )
}
