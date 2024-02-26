import { ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { useState } from 'react'

import { BaseGroup, InputGroup, TextAreaGroup } from '~/components/FormGroups'
import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Select } from '~/components/ui/select'

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log('Got a request!')
  console.log(Object.fromEntries(await request.formData()))
  return null
}

export default function Feedback() {
  return (
    <>
      <div className="grid min-h-screen grid-rows-[auto_1fr] items-center">
        <Header title="Feedback" backArrow />
        <Wrapper cols={2} className="items-center">
          <div className="text-center md:text-start">
            <h2 className="mb-4 bg-gradient-to-br from-emerald-200 to-emerald-500 bg-clip-text font-display text-3xl font-semibold text-transparent md:mb-8 md:text-5xl/snug">
              O seu feedback é muito importante para nós.
            </h2>
            <p className="text-lg md:text-xl">
              Conte um pouco de sua experiência utilizando nosso serviço. Diga o
              que gostou, o que não gostou e o que podemos melhorar.
            </p>
          </div>
          <FeedbackForm />
        </Wrapper>
      </div>
    </>
  )
}

function FeedbackForm() {
  const [includeEmail, setIncludeEmail] = useState(false)

  return (
    <Form
      method="POST"
      className="mx-auto grid max-w-lg grid-cols-2 grid-rows-[auto_1fr_auto_auto] gap-3"
    >
      <div>
        <InputGroup
          label="Seu nome (opcional)"
          name="name"
          input={{ placeholder: 'Nome...', className: 'w-full' }}
        />
      </div>

      <div>
        <BaseGroup label="Selecione um assunto" name="type">
          <Select.Root name="type">
            <Select.Trigger
              size="md"
              className="border-gray-400/25 bg-gray-500/25"
            >
              <Select.Value placeholder="Selecione..." />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {['Elogios', 'Sugestão', 'Problemas', 'Outros'].map((o) => (
                  <Select.Item value={o}>{o}</Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </BaseGroup>
      </div>

      <div className="col-span-2">
        <TextAreaGroup
          name="feedback"
          textarea={{
            placeholder: 'Escreva aqui seu feedback',
            className: 'w-full',
            rows: 5,
          }}
        />
      </div>

      <div className="col-span-2 flex gap-6">
        <label className="flex items-center gap-2">
          <span>Incluir e-mail</span>
          <Checkbox
            value={String(includeEmail)}
            checked={includeEmail}
            onCheckedChange={() => setIncludeEmail((p) => !p)}
            name="includeEmail"
          />
        </label>

        <InputGroup
          name="email"
          input={{
            disabled: !includeEmail,
            type: 'email',
            placeholder: 'E-mail...',
            className: 'flex-1',
          }}
        ></InputGroup>
      </div>

      <div className="col-span-2 mt-3 flex justify-stretch text-lg font-semibold">
        <Button className="w-full" type="submit">
          Enviar
        </Button>
      </div>
    </Form>
  )
}
