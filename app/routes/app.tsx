import { useState } from 'react'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import {
  Form,
  Outlet,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import WalletService, { Wallet as W } from '~/services/walletService'

import { colorsSchema } from '~/constants/availableColors'
import { Result } from '~/types/Result'

import { ErrorProvider, ErrorT } from '~/context/ErrorContext'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { Slider } from '~/components/ui/slider'

import Wallet from '~/components/Wallet'
import { BaseGroup, InputGroup } from '~/components/FormGroups'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    console.log('Anonymous user tried to access /app')

    throw redirect('/')
  }

  return json(await WalletService.getWallets(user.uid))
}

const formSchema = z.object({
  title: z.string().min(1, 'Insira um nome para sua carteira'),
  idealAmount: z.coerce
    .number()
    .min(0, 'A porcentagem ideal deve ser maior que 0')
    .max(100, 'A porcentagem ideal deve ser menor que 100'),
  color: z.enum(colorsSchema.options, {
    invalid_type_error: 'Cor inválida',
    required_error: 'Selecione uma cor',
  }),
})

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<TypedResponse<Result<W, ErrorT[]>>> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const formData = await request.formData()

  const result = formSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return json({
      ok: false,
      error: result.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  const wallet = await WalletService.createWallet(user.uid, {
    title: result.data.title,
    idealPercentage: result.data.idealAmount,
    color: result.data.color,
    owner: user.uid,
  })

  return json({
    ok: true,
    value: wallet,
  })
}

export default function App() {
  const wallets = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  console.log(actionData)

  const errors = !actionData?.ok ? actionData?.error : []

  return (
    <>
      <ErrorProvider initialErrors={errors}>
        <NewWalletModal />
      </ErrorProvider>
      <div>
        <header>
          <h1 className="text-2xl font-semibold text-gray-50">
            This is the app
          </h1>
          <Form>
            <Button name="new" value={''}>
              Nova carteira
            </Button>
          </Form>
        </header>

        <hr className="my-3 border-t-2 border-dashed border-gray-600" />

        <div>
          {wallets.map((w) => (
            <Wallet wallet={w} key={w.id} />
          ))}
        </div>

        <Outlet />
      </div>
    </>
  )
}

function NewWalletModal() {
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const shouldOpen = searchParams.get('new')

  const isSubmitting = navigation.state === 'submitting'

  if (shouldOpen === null) return null

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(to) => {
        if (!to) setSearchParams({})
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
      <span className="rounded font-semibold">{value}%</span>
      <Slider
        min={0}
        max={100}
        step={1}
        name="idealAmount"
        onValueChange={([e]) => setValue(e)}
      />
    </div>
  )
}

;('bg-orange-400 bg-amber-400 bg-yellow-400 bg-lime-400 bg-cyan-400 bg-green-400 bg-emerald-400 bg-sky-400 bg-teal-400 bg-blue-400 bg-indigo-400 bg-violet-400 bg-purple-400 bg-fuchsia-400 bg-pink-400 bg-rose-400')
;('border-orange-600 border-amber-600 border-yellow-600 border-lime-600 border-cyan-600 border-green-600 border-emerald-600 border-sky-600 border-teal-600 border-blue-600 border-indigo-600 border-violet-600 border-purple-600 border-fuchsia-600 border-pink-600 border-rose-600')

function ColorSelection() {
  const colors = colorsSchema.options
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {colors.map((c) => (
        <label
          className={`bg-${c}-400 border-2 bg-opacity-75 border-${c}-600 aspect-square rounded  has-[:checked]:scale-110 has-[:checked]:bg-opacity-100`}
          key={c}
        >
          <input className="hidden" type="radio" name="color" value={c} />
        </label>
      ))}
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
