import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'

import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { InputGroup } from '~/components/FormGroups'

import { action } from './action'

type TextsKeys =
  | 'modalTitle'
  | 'changeMode'
  | 'success'
  | 'buttonLabel'
  | 'next'

const texts: {
  login: Record<TextsKeys, string>
  signup: Record<TextsKeys, string>
} = {
  login: {
    modalTitle: 'Entre na sua conta',
    changeMode: 'Não possui conta? Crie uma',
    success: 'Login efetuado com sucesso!',
    buttonLabel: 'Login',
    next: 'signup',
  },
  signup: {
    modalTitle: 'Criar conta',
    changeMode: 'Já é usuário? Faça login',
    success: 'Conta criada com sucesso!',
    buttonLabel: 'Criar conta',
    next: 'login',
  },
}

export default function AuthenticationModal() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const mode = searchParams.get('mode')
  const isDoingStuff = navigation.state === 'submitting'
  const hasError = actionData?.ok === false && !isDoingStuff
  const backendError =
    hasError && actionData.error.some((e) => e.type === 'backend')

  if (!mode || (mode !== 'login' && mode !== 'signup')) return null

  return (
    <Dialog.Root
      onOpenChange={(to) => {
        if (!to) setSearchParams({})
      }}
      defaultOpen
    >
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>{texts[mode].modalTitle}</Dialog.Title>
          <Button
            variant="link"
            size="sm"
            className="justify-start p-0 text-gray-300 transition-colors hover:text-emerald-200"
            onClick={() => {
              setSearchParams({
                mode: texts[mode].next,
              })
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
          <Button type="submit" disabled={isDoingStuff} className="mt-2">
            {isDoingStuff ? 'Enviando...' : texts[mode].buttonLabel}
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
