import { ActionFunctionArgs, TypedResponse } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { Result, typedError, typedOk } from '~/types/Result'

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
import { toast } from '~/components/ui/use-toast'

export const meta = () => [{ title: 'Feedback' }]

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
    return typedError(
      parsed.error.errors.map((e) => ({
        message: e.message,
        type: e.path.toString(),
      })),
    )
  }

  const { feedback, type, email, name } = parsed.data

  try {
    const createdFeedback = await FeedbackService.createFeedback({
      message: feedback,
      userName: name || undefined,
      type,
      email,
    })

    return typedOk(createdFeedback)
  } catch (e) {
    return typedError([{ message: 'Erro desconhecido', type: 'unknown' }])
  }
}

function BackgroundDots() {
  const update = () => {
    const c = document.querySelector('#canva') as HTMLCanvasElement
    if (!c) return console.log("Can't get canvas element")

    c.width = c.clientWidth
    c.height = c.clientHeight

    const ctx = c!.getContext('2d')

    if (!ctx) return console.log("Can't get canvas context")

    const radius = Math.max(c.width / 2, c.height / 2, 500)
    const spacing = radius / 50

    const center = {
      x: c.width * 0.5,
      y: c.height * 0.3,
    }

    if (c.clientWidth >= 768) {
      center.x = c.width * 0.2
      center.y = c.height * 0.4
    }

    ctx.clearRect(0, 0, c.width, c.height)
    ctx.fillStyle = 'rgba(255,255,255,.05)'

    for (let y = 0; y < (radius * 2) / spacing; y++) {
      for (let x = 0; x < (radius * 2) / spacing; x++) {
        const pos = {
          x: center.x - radius + x * spacing,
          y: center.y - radius + y * spacing,
        }
        if (y % 2 === 0) pos.x += spacing / 2
        const dst = Math.sqrt((pos.x - center.x) ** 2 + (pos.y - center.y) ** 2)
        const r = (1 - dst / radius) * 4

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, r > 0 ? r : 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
    }
  }, [])

  return <canvas id="canva" className="absolute inset-0 -z-30 h-full w-full" />
}

export default function Feedback() {
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData?.ok) {
      toast({
        title: 'Seu feedback foi enviado!',
        description:
          'Obrigado por ajudar a melhorar o app! Caso necessário, em breve entraremos em contato com você.',
      })
    }
  }, [actionData])

  return (
    <>
      <div className="grid min-h-screen grid-rows-[auto_1fr_auto] items-center">
        <Header title="Feedback" backArrow />
        <Wrapper cols={2} className="items-center gap-y-6">
          <BackgroundDots />
          <div className="text-center md:text-start">
            <h2 className="mb-4 bg-gradient-to-br from-emerald-200 to-emerald-500 bg-clip-text font-display text-3xl font-semibold text-transparent md:mb-8 md:text-5xl/snug">
              O seu feedback é muito importante para nós.
            </h2>
            <p className="text-emerald-50 sm:text-lg md:text-xl">
              Conte um pouco de sua experiência utilizando nosso serviço. Diga o
              que gostou, o que não gostou e o que podemos melhorar.
            </p>
          </div>
          <FeedbackForm />
        </Wrapper>
        <footer className="mt-6 bg-emerald-950 py-6">
          <Wrapper className="flex items-center gap-1">
            <img src="/logo.svg" alt="Logo" className="size-8 sm:size-10" />
            <h3 className="font-display text-xl text-emerald-100">ReBalance</h3>
          </Wrapper>
        </footer>
      </div>
    </>
  )
}

// TODO: add a loader to get the user name and email
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
