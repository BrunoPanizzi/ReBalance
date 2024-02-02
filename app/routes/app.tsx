import { ReactNode, useState } from 'react'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import {
  Form,
  Link,
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

import { BaseGroup, InputGroup } from '~/components/FormGroups'
import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'
import {
  DotsVerticalIcon,
  HamburgerMenuIcon,
  InfoCircledIcon,
  MixerVerticalIcon,
  PlusIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '~/components/ui/popover'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const wallets = await WalletService.getWallets(user.uid)

  return json({ user, wallets })
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
  const { user, wallets } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const errors = !actionData?.ok ? actionData?.error : []

  return (
    <>
      <Outlet />
      <ErrorProvider initialErrors={errors}>
        <NewWalletModal />
      </ErrorProvider>

      <Header
        title={`Bem vindo de volta, ${user.userName}`}
        rightSide={
          <Button asChild className="mr-4 p-0 text-red-300" variant="link">
            <Link to="logout" relative="path">
              Sair
            </Link>
          </Button>
        }
      />

      <Wrapper>
        <div className="grid gap-4 md:grid-cols-2 ">
          <div className="@container/list flex flex-col gap-2">
            <ListHeader />

            {wallets.map((w) => (
              <Wallet wallet={w} key={w.id} />
            ))}
          </div>

          <div className="min-h-60 bg-emerald-400/75" />

          {/* <Collapsible orientation="vertical">
                    <div
                      ref={setContainerRef}
                      class=" h-96 rounded-r-xl bg-white/5 text-emerald-500"
                    >
                      <Graph
                        data={wallets}
                        w={size.width || 0}
                        h={size.height || 0}
                        m={16}
                      />
                    </div>
                  </Collapsible> */}
        </div>
      </Wrapper>
    </>
  )
}

function Wallet({ wallet }: { wallet: W }) {
  // TODO: formatters for percentages and brl
  return (
    <Link
      to={wallet.id}
      relative="path"
      data-color={wallet.color}
      className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-center gap-2 rounded-md border border-primary-500/50 bg-primary-300/10 px-4 py-2 transition first-of-type:rounded-t-xl last-of-type:rounded-b-xl hover:border-primary-500/75 hover:bg-primary-400/20"
    >
      <span className="flex items-center gap-2">
        <h3 className="text-xl font-semibold text-primary-200">
          {wallet.title}
        </h3>
        <button className="p-1">
          <DotsVerticalIcon className="h-5 w-5 text-primary-200" />
        </button>
      </span>
      <span className="row-start-2 flex flex-wrap gap-x-2">
        <span>ideal: {wallet.idealPercentage * 100}%</span>
        <span>atual: {10}%</span>
      </span>

      <span className="row-span-2 text-xl font-bold text-primary-200">
        <span>R$ {wallet.totalValue}</span>
      </span>
    </Link>
  )
}

function ListHeader() {
  return (
    <>
      <span className="@md/list:mb-0 mb-2 flex items-center gap-4">
        <h2 className="flex-1 text-2xl font-semibold text-emerald-50">
          Suas carteiras:
        </h2>
        <Popover>
          <Button asChild size="icon" variant="ghost">
            <PopoverTrigger className="@md/list:hidden">
              <HamburgerMenuIcon className="size-5" />
            </PopoverTrigger>
          </Button>
          <PopoverContent className="flex w-fit flex-col gap-2 ">
            <ToolBarContent />
          </PopoverContent>
        </Popover>
      </span>
      <menu className="@md/list:flex mb-3 hidden gap-1 rounded-xl bg-gray-700 p-1">
        <ToolBarContent />
      </menu>
    </>
  )
}

function ToolBarContent() {
  const percentagesAddUp = true
  return (
    <>
      <MenuItem
        title="Nova carteira"
        icon={<PlusIcon className="size-6 text-emerald-100" />}
        onClick={() => {}}
      />

      <MenuItem
        title="Reequlibrar"
        icon={
          percentagesAddUp ? (
            <MixerVerticalIcon className="size-5 text-emerald-100" />
          ) : (
            <InfoCircledIcon className="size-5 text-orange-300" />
          )
        }
        onClick={() => {}}
      />

      <MenuItem
        title="Atualizar valores"
        onClick={() => {}}
        icon={<UpdateIcon className=" size-5 text-emerald-100" />}
      />
    </>
  )
}

function MenuItem({
  icon,
  onClick,
  title,
}: {
  title: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      className="flex items-center justify-start gap-1 rounded-md px-2 py-1 text-emerald-50 transition hover:bg-emerald-500/50"
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
    </Button>
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

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
