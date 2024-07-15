import {
  ReactNode,
  useEffect,
  createContext,
  useContext,
  useState,
} from 'react'
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'

import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { InputGroup } from '~/components/FormGroups'

import { action } from './action'

type Modes = 'login' | 'signup'

type AuthenticationModalContextType = {
  mode: Modes
  setMode: (mode: Modes) => void
}

const AuthenticationModalContext = createContext<
  AuthenticationModalContextType | undefined
>(undefined)

function useAuthenticationModalContext(): AuthenticationModalContextType {
  const context = useContext(AuthenticationModalContext)

  if (!context) {
    throw new Error(
      'useAuthenticationModalContext must be used within an AuthenticationModalProvider',
    )
  }

  return context
}

type TextsKeys = 'modalTitle' | 'changeMode' | 'success' | 'buttonLabel'

const texts: {
  login: Record<TextsKeys, string>
  signup: Record<TextsKeys, string>
} = {
  login: {
    modalTitle: 'Entre na sua conta',
    changeMode: 'Não possui conta? Crie uma',
    success: 'Login efetuado com sucesso! Entrando...',
    buttonLabel: 'Login',
  },
  signup: {
    modalTitle: 'Criar conta',
    changeMode: 'Já é usuário? Faça login',
    success: 'Conta criada com sucesso! Entrando...',
    buttonLabel: 'Criar conta',
  },
}

type AuthenticationModalProps = {
  children: ReactNode
}

export default function ({ children }: AuthenticationModalProps) {
  const [mode, setMode] = useState<Modes>('login')
  return (
    <AuthenticationModalContext.Provider value={{ mode, setMode }}>
      <AuthenticationModal>{children}</AuthenticationModal>
    </AuthenticationModalContext.Provider>
  )
}

function AuthenticationModal({ children }: AuthenticationModalProps) {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const isSubmitting = navigation.state === 'submitting'
  const hasError = actionData?.ok === false && !isSubmitting
  const backendError =
    hasError && actionData.error.some((e) => e.type === 'backend')

  const { mode, setMode } = useAuthenticationModalContext()

  useEffect(() => {
    if (actionData?.ok) {
      setTimeout(() => navigate('/app'), 300)
    }
  }, [actionData])

  return (
    <Dialog.Root>
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>{texts[mode].modalTitle}</Dialog.Title>
          <Button
            variant="link"
            size="sm"
            className="justify-start p-0 text-gray-300 transition-colors hover:text-emerald-200"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
            }}
          >
            {texts[mode].changeMode}
          </Button>
        </Dialog.Header>
        <Form
          className="flex flex-col gap-2"
          noValidate
          method="post"
          id="auth-form"
        >
          <input type="hidden" name="mode" value={mode} />
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
              {texts[mode].success}
            </span>
          )}
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? 'Enviando...' : texts[mode].buttonLabel}
          </Button>
        </Form>
      </Dialog.Content>
      {children}
    </Dialog.Root>
  )
}

export function LoginTrigger({ children }: { children: ReactNode }) {
  const { setMode } = useAuthenticationModalContext()

  return (
    <Dialog.Trigger asChild onClick={() => setMode('login')}>
      {children}
    </Dialog.Trigger>
  )
}

export function SignupTrigger({ children }: { children: ReactNode }) {
  const { setMode } = useAuthenticationModalContext()

  return (
    <Dialog.Trigger asChild onClick={() => setMode('signup')}>
      {children}
    </Dialog.Trigger>
  )
}
