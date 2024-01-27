import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'

import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import InputGroup from '~/components/InputGroup'

import { action } from './action'

export default function AuthenticationModal() {
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
    <Dialog.Root
      onOpenChange={(to) => {
        if (!to) setSearchParams({})
      }}
      open={mode === 'login' || mode === 'signup'}
    >
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>
            {mode === 'login' ? 'Entre na sua conta' : 'Criar conta'}
          </Dialog.Title>
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
      </Dialog.Content>
    </Dialog.Root>
  )
}
