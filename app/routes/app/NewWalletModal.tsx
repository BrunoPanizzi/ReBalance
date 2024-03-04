import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'

import { AssetType } from '~/services/assetService/index.server'

import { percentage } from '~/lib/formatting'

import { ErrorProvider } from '~/context/ErrorContext'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { Slider } from '~/components/ui/slider'
import { Select } from '~/components/ui/select'
import { toast } from '~/components/ui/use-toast'

import { BaseGroup, InputGroup } from '~/components/FormGroups'

import { action, extractValue } from './action'
import { ColorSelection } from './ColorSelection'

export default function NewWalletModal() {
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'POST')

  const success = actionResult?.ok
  const errors = !success ? actionResult?.error : []

  const shouldOpen = searchParams.get('new')

  const isSubmitting = navigation.state === 'submitting'

  useEffect(() => {
    if (success) {
      toast({ title: 'Carteira criada com sucesso!' })
    }
  }, [success])

  if (shouldOpen === null) return null

  return (
    <ErrorProvider initialErrors={errors}>
      <Dialog.Root
        defaultOpen
        onOpenChange={(to) => {
          if (!to) setSearchParams({}, { replace: true })
        }}
      >
        <Dialog.Content className="max-w-sm">
          <Dialog.Header>
            <Dialog.Title>Nova carteira</Dialog.Title>
          </Dialog.Header>

          <Form
            className="flex flex-col gap-4"
            autoComplete="on"
            method="post"
            id="new-wallet"
          >
            <InputGroup
              label="Nome da carteira"
              name="title"
              input={{ placeholder: 'Nome...' }}
            />

            <TypeSelect />

            <BaseGroup
              label="Quanto você gostaria de investir?"
              name="idealAmount"
            >
              <SliderWithPreview />
            </BaseGroup>

            <BaseGroup name="color" label="Selecione uma cor">
              <ColorSelection />
            </BaseGroup>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar'}
            </Button>
          </Form>
        </Dialog.Content>
      </Dialog.Root>
    </ErrorProvider>
  )
}

const typeOptions: {
  value: AssetType
  displayName: string
  disabled: boolean
}[] = [
  { value: 'br-stock', displayName: 'Ações', disabled: false },
  { value: 'br-bond', displayName: 'Renda fixa', disabled: true },
  { value: 'usa-stock', displayName: 'Ações americanas', disabled: true },
  { value: 'usa-bond', displayName: 'Renda fixa americana', disabled: true },
  { value: 'fixed-value', displayName: 'Valor fixo', disabled: false },
]

function TypeSelect() {
  return (
    <BaseGroup name="type" label="Tipo da carteira">
      <Select.Root name="type">
        <Select.Trigger className="border-gray-400/25 bg-gray-500/25">
          <Select.Value placeholder="Selecione o tipo..." />
        </Select.Trigger>
        <Select.Content>
          {typeOptions.map((a) => (
            <Select.Item key={a.value} disabled={a.disabled} value={a.value}>
              {a.displayName}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </BaseGroup>
  )
}

function SliderWithPreview() {
  const [value, setValue] = useState(0)

  return (
    <div className="flex items-center gap-2">
      <span className="rounded font-semibold">{percentage(value)}</span>
      <Slider
        min={0}
        max={1}
        step={0.01}
        name="idealAmount"
        onValueChange={([e]) => setValue(e)}
      />
    </div>
  )
}
