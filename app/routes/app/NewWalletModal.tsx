import { Form, useNavigation, useSearchParams } from '@remix-run/react'
import { useState } from 'react'

import { colorsSchema } from '~/constants/availableColors'

import { percentage } from '~/lib/formatting'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { Slider } from '~/components/ui/slider'

import { BaseGroup, InputGroup } from '~/components/FormGroups'

export default function NewWalletModal() {
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const shouldOpen = searchParams.get('new')

  const isSubmitting = navigation.state === 'submitting'

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
          <Dialog.Title>Nova carteira</Dialog.Title>
        </Dialog.Header>

        <Form
          className="flex flex-col gap-4"
          noValidate
          method="post"
          id="new-wallet"
        >
          <InputGroup
            label="Nome da carteira"
            name="title"
            input={{ placeholder: 'Nome...' }}
          />

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

function ColorSelection() {
  const colors = colorsSchema.options
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {colors.map((c) => (
        <label
          data-color={c}
          className={`aspect-square rounded border-2 border-primary-600 bg-primary-400 bg-opacity-75  has-[:checked]:scale-110 has-[:checked]:bg-opacity-100`}
          key={c}
        >
          <input className="hidden" type="radio" name="color" value={c} />
        </label>
      ))}
    </div>
  )
}