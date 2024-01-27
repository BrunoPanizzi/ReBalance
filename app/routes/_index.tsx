import { z } from 'zod'
import type {
  ActionFunctionArgs,
  MetaFunction,
  TypedResponse,
} from '@remix-run/node'
import {
  Form,
  Link,
  json,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'

import { sessionStorage } from '~/services/cookies/session.server'

import { authSerivce } from '~/services/auth/authService.server'
import type { User } from '~/services/auth/userSchemas'

import { Result } from '~/types/Result'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

import { ErrorProvider, useError } from '~/context/ErrorContext'
import InputGroup from '~/components/InputGroup'

export const meta: MetaFunction = () => {
  return [
    { title: 'Stock shop' },
    { name: 'description', content: 'Welcome to Stock shop!' },
  ]
}

const loginFormValidator = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})
const signupFormValidator = loginFormValidator.extend({
  userName: z.string().min(1, 'Nome de usuário é obrigatório'),
})

type AuthError = {
  type: string | 'email' | 'password' | 'backend' | 'unknown'
  message: string
}

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<TypedResponse<Result<User, AuthError[]>>> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode')

  if (!mode || (mode !== 'login' && mode !== 'signup'))
    return json({
      ok: false,
      error: [
        {
          type: 'unknown',
          message: 'Invalid mode',
        },
      ],
    })

  const formData = await request.formData()
  const rawForm = Object.fromEntries(formData)

  try {
    let response

    if (mode === 'login') {
      const userInfo = loginFormValidator.safeParse(rawForm)

      if (!userInfo.success) {
        return json({
          ok: false,
          error: userInfo.error.errors.map((e) => ({
            type: e.path.join('.'),
            message: e.message,
          })),
        })
      }

      response = await authSerivce.login(userInfo.data)
    } else if (mode === 'signup') {
      const userInfo = signupFormValidator.safeParse(rawForm)

      if (!userInfo.success) {
        return json({
          ok: false,
          error: userInfo.error.errors.map((e) => ({
            type: e.path.join('.'),
            message: e.message,
          })),
        })
      }

      response = await authSerivce.createUser(userInfo.data)
    } else throw new Error('Unreachable')

    session.set('jwt', response.token)
    session.set('user', response.user)

    return json(
      {
        ok: true,
        value: response.user,
      },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    )
  } catch (e) {
    console.log('Backend error')
    return json({
      ok: false,
      error: [
        {
          type: 'backend',
          message: 'Something went wrong when authenticating',
        },
      ],
    })
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>()

  const errors = !actionData?.ok ? actionData?.error : []

  return (
    <>
      <ErrorProvider initialErrors={errors}>
        <Modal />
      </ErrorProvider>

      <div>
        <nav className="m-2 flex justify-between rounded bg-gray-700 p-2">
          <h1 className="text-2xl font-semibold">Hello, world!</h1>

          <div className="flex gap-4">
            <Button variant="link" asChild>
              <Link to="/app">app</Link>
            </Button>
            <Form>
              <Button variant="ghost" name="mode" value="login">
                Entrar
              </Button>
            </Form>
            <Form>
              <Button name="mode" value="signup">
                Criar conta
              </Button>
            </Form>
          </div>
        </nav>
        <h2 className="text-lg text-gray-100">This is the home</h2>
      </div>
    </>
  )
}

function Modal() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const mode = searchParams.get('mode')
  const isDoingStuff = navigation.state === 'submitting'
  const hasError = actionData?.ok === false && !isDoingStuff
  const backendError =
    hasError && actionData.error.some((e) => e.type === 'backend')

  if (!mode) return null

  return (
    <Dialog
      onOpenChange={(to) => {
        if (!to) setSearchParams({})
      }}
      open={mode === 'login' || mode === 'signup'}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Entre na sua conta' : 'Criar conta'}
          </DialogTitle>
          <Button
            variant="link"
            size="sm"
            className="justify-start p-0 text-gray-300 transition-colors hover:text-emerald-200"
            onClick={() => {
              setSearchParams({
                mode: mode === 'login' ? 'signup' : 'login',
              })
            }}
          >
            {mode === 'login'
              ? 'Não possui conta? Crie uma'
              : 'Já é usuário? Faça login'}
          </Button>
        </DialogHeader>
        <Form
          className="flex flex-col gap-2"
          noValidate
          method="post"
          id="auth-form"
        >
          {mode === 'signup' && (
            <InputGroup
              label="Nome de usuário"
              name="userName"
              input={{ placeholder: 'Nome...' }}
            />
          )}
          <InputGroup
            label="Email"
            name="email"
            input={{ placeholder: 'seuemail@exemplo.com', type: 'email' }}
          />
          <InputGroup
            label="Senha"
            name="password"
            input={{ type: 'password' }}
          />
          {backendError && (
            <span className="text-sm text-red-400">
              Algo deu errado ao {mode === 'login' ? 'entrar' : 'criar conta'}
              <br />
              Verifique se os dados inseridos estão corretos
            </span>
          )}
          {actionData?.ok && (
            <span className="text-sm text-green-400">
              {mode === 'login'
                ? 'Login efetuado com sucesso!'
                : 'Conta criada com sucesso!'}
            </span>
          )}
          <Button type="submit" disabled={isDoingStuff} className="mt-2">
            {isDoingStuff
              ? 'Enviando...'
              : mode === 'login'
                ? 'Login'
                : 'Criar conta'}
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ErrorLabel({ field }: { field: string }) {
  const errorContext = useError()
  if (!errorContext) return null

  const error = errorContext.errors.find((e) => e.type === field)

  if (!error) return null

  const message = error.message

  return <span className="block pb-1 text-sm text-red-400">{message}</span>
}
