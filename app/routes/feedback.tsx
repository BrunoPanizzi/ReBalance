import { ActionFunctionArgs, TypedResponse, json } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'

import { Result } from '~/types/Result'

import { options as feedbackOptions } from '~/services/feedbackService/feedbackTypes'
import FeedbackService, {
  DomainFeedback,
} from '~/services/feedbackService/index.server'

import { ErrorProvider, ErrorT } from '~/context/ErrorContext'

import { BaseGroup, InputGroup, TextAreaGroup } from '~/components/FormGroups'
import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Select } from '~/components/ui/select'

const formSchema = z
  .object({
    name: z
      .string()
      .max(100, 'Nome deve ser menor que 100 caracteres.')
      .optional(),
    type: z.enum(feedbackOptions, {
      errorMap: (err) => {
        if (err.code === 'invalid_enum_value') {
          return { message: 'Opção inválida.' }
        }
        return { message: 'Erro desconhecido.' }
      },
    }),
    feedback: z.string().min(30, 'Escreva um pouco mais :)'),
    includeEmail: z.boolean().optional(),
    email: z.string().email('Email inválido.').optional(),
  })
  // ensure that email is included if it should
  .refine((s) => !s.includeEmail || s.email)

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<Result<DomainFeedback, ErrorT[]>>
> => {
  await new Promise((res): any => setTimeout(res, 1000))

  const parsed = formSchema.safeParse(
    Object.fromEntries(await request.formData()),
  )

  if (!parsed.success) {
    return json({
      ok: false,
      error: parsed.error.errors.map((e) => ({
        message: e.message,
        type: e.path.toString(),
      })),
    })
  }

  const { feedback, type, email, name } = parsed.data

  try {
    const createdFeedback = await FeedbackService.createFeedback({
      message: feedback,
      userName: name || undefined,
      type,
      email,
    })

    return json({
      ok: true,
      value: createdFeedback,
    })
  } catch (e) {
    return json({
      ok: false,
      error: [{ message: 'Erro desconhecido', type: 'unknown' }],
    })
  }
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
  const actionData = useActionData<typeof action>()
  const { state } = useNavigation()

  const [includeEmail, setIncludeEmail] = useState(false)

  return (
    <ErrorProvider
      initialErrors={actionData?.ok === false ? actionData.error : []}
    >
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
                  {feedbackOptions.map((o) => (
                    <Select.Item key={o} value={o}>
                      {o}
                    </Select.Item>
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

          <span className="flex-1">
            <InputGroup
              name="email"
              input={{
                disabled: !includeEmail,
                type: 'email',
                placeholder: 'E-mail...',
                className: 'w-full',
              }}
            />
          </span>
        </div>

        <div className="col-span-2 mt-3 flex justify-stretch text-lg font-semibold">
          <Button
            disabled={state === 'submitting'}
            className="w-full"
            type="submit"
          >
            {state === 'submitting' ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </Form>
    </ErrorProvider>
  )
}
