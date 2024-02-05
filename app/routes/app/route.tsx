import { Link, Outlet, useActionData, useLoaderData } from '@remix-run/react'

import { ErrorProvider } from '~/context/ErrorContext'

import { Button } from '~/components/ui/button'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { loader } from './loader'
import { action } from './action'

import Graph from './Graph'
import WalletCard from './WalletCard'
import ListHeader from './ListHeader'
import NewWalletModal from './NewWalletModal'

export { loader, action }

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

      <Wrapper cols={2}>
        <div className="flex flex-col gap-2 @container/list">
          <ListHeader />

          {wallets.map((w) => (
            <WalletCard wallet={w} key={w.id} />
          ))}
        </div>

        <div>
          <h2 className="mb-2 flex-1 text-2xl font-semibold text-emerald-50">
            Distribuição dos ativos:
          </h2>
          <div className="h-min rounded-xl bg-gray-700/50">
            <div className="mx-auto max-w-md">
              <Graph data={wallets} m={5} />
            </div>
          </div>
        </div>
      </Wrapper>
    </>
  )
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong lol</span>
    </div>
  )
}
