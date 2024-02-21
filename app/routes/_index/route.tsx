import { LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'

import { ErrorProvider } from '~/context/ErrorContext'

import { Button } from '~/components/ui/button'

import { action } from './action'
import AuthenticationModal from './AuthenticationModal'
import { sessionStorage } from '~/services/cookies/session.server'

export const meta = () => {
  return [
    { title: 'Stock shop' },
    { name: 'description', content: 'Welcome to Stock shop!' },
  ]
}
export { action }

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  return {
    isAuthenticated: !!session.data.user,
  }
}

export default function Index() {
  const actionData = useActionData<typeof action>()

  const errors = !actionData?.ok ? actionData?.error : []

  return (
    <>
      <ErrorProvider initialErrors={errors}>
        <AuthenticationModal />
      </ErrorProvider>

      <div className="relative h-screen bg-opacity-10">
        <div
          className="absolute inset-0 -z-10 bg-squares bg-repeat-round"
          style={{
            maskImage: 'linear-gradient(rgb(0 0 0 / 0.1), rgb(0 0 0 / 0.3))',
          }}
        />
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-sky-500/5 to-emerald-500/10" />

        <Navbar />

        <main className="mx-auto mt-[20vh] max-w-screen-xl text-center font-display">
          <div className="mx-auto max-w-[75%]">
            <h2 className="mx-auto mb-4 max-w-screen-md text-balance text-[clamp(3rem,6vw,5rem)]/none font-bold text-emerald-50">
              Investir não precisa ser{' '}
              <strong className="text-emerald-300 underline">difícil.</strong>
            </h2>
            <p className="mb-2 text-balance text-lg text-emerald-50 md:text-xl lg:text-2xl">
              Defina suas carteiras e os ativos em que deseja investir que nós
              cuidamos do resto.
            </p>
            <p className="text-balance text-lg text-emerald-50 md:text-xl lg:text-2xl">
              Sem contas e planilhas chatas, sempre respeitando os seus
              objetivos.
            </p>

            <Form>
              <Button
                className="mt-8 rounded-lg border-2 border-emerald-400 px-8 py-2 text-2xl hover:scale-105"
                variant="outline"
                size="lg"
                name="mode"
                value="signup"
              >
                Crie sua conta agora!
              </Button>
            </Form>
          </div>
        </main>
      </div>
    </>
  )
}

function Navbar() {
  const { isAuthenticated } = useLoaderData<typeof loader>()

  return (
    <div className="bg-gray-700/50 p-2 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 ">
        <img
          src="/logo.svg"
          alt="Stock shop logo"
          className="h-8 w-8 sm:h-10 sm:w-10"
        />
        <h1 className="flex-1 font-display text-3xl font-semibold text-emerald-100">
          <p className="hidden xs:inline">ReBalance</p>
        </h1>

        {isAuthenticated ? (
          <Button variant="link" asChild>
            <Link to="/app">app</Link>
          </Button>
        ) : (
          <>
            <Form replace>
              <Button
                className="text-sm sm:text-base"
                variant="ghost"
                name="mode"
                value="login"
              >
                Entrar
              </Button>
            </Form>
            <Form replace>
              <Button
                className="text-sm sm:text-base"
                name="mode"
                value="signup"
              >
                Criar conta
              </Button>
            </Form>
          </>
        )}
      </nav>
    </div>
  )
}
