import { Form, Link, useActionData } from '@remix-run/react'

import { ErrorProvider } from '~/context/ErrorContext'

import { Button } from '~/components/ui/button'

import { action } from './action'
import AuthenticationModal from './AuthenticationModal'

export const meta = () => {
  return [
    { title: 'Stock shop' },
    { name: 'description', content: 'Welcome to Stock shop!' },
  ]
}
export { action }

export default function Index() {
  const actionData = useActionData<typeof action>()

  const errors = !actionData?.ok ? actionData?.error : []

  return (
    <>
      <ErrorProvider initialErrors={errors}>
        <AuthenticationModal />
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
