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

function TypeSelect() {
  return (
    <BaseGroup name="type" label="Tipo da carteira">
      <Select.Root name="type">
        <Select.Trigger>
          <Select.Value placeholder="Selecione o tipo..." />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>🇧🇷 Brasil</Select.Label>
            <Select.Item value="br-stock">Ações</Select.Item>
            <Select.Item value="br-bond" disabled>
              Renda fixa
            </Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>🇺🇸 Exterior</Select.Label>
            <Select.Item value="usa-stock" disabled>
              Ações americanas
            </Select.Item>
            <Select.Item value="usa-bond" disabled>
              Renda fixa americana
            </Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>Outros</Select.Label>
            <Select.Item value="fixed-value">Valor fixo</Select.Item>
          </Select.Group>
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
