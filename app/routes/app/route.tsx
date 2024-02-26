import { Link, Outlet, useLoaderData } from '@remix-run/react'
import colors from 'tailwindcss/colors.js'

import { Button } from '~/components/ui/button'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'
import Graph from '~/components/Graph'

import { loader } from './loader'
import { action } from './action'

import WalletCard from './WalletCard'
import ListHeader from './ListHeader'
import NewWalletModal from './NewWalletModal'
import ChangeColorModal from './ChangeWalletColor'
import ChangeNameModal from './ChangeWalletName'

export { loader, action }

export default function App() {
  const { user, wallets } = useLoaderData<typeof loader>()

  return (
    <>
      <Outlet />
      <NewWalletModal />
      <ChangeColorModal />
      <ChangeNameModal />

      <Header
        title={`Bem vindo de volta, ${user.userName}`}
        rightSide={
          <>
            <Button
              asChild
              className="p-0 text-primary-100"
              variant="link"
              size="sm"
            >
              <Link to="/feedback">Enviar feedback</Link>
            </Button>
            <Button asChild className="mr-4 p-0 text-red-300" variant="link">
              <Link to="logout" relative="path">
                Sair
              </Link>
            </Button>
          </>
        }
      />

      <Wrapper cols={2}>
        <div className="flex flex-col gap-2 @container/list">
          <ListHeader />

          {wallets.map((w) => (
            <WalletCard wallet={w} key={w.id} />
          ))}
        </div>

        <div className="@container">
          <h2 className="mb-2 h-8 flex-1 text-xl font-semibold text-emerald-50 @md:h-auto @md:text-2xl">
            Distribuição dos ativos:
          </h2>
          <div className="h-min rounded-xl bg-gray-700/50">
            <div className="mx-auto max-w-md">
              <Graph
                data={wallets}
                value="totalValue"
                name="title"
                color={(w) => colors[w.color][600]}
                m={5}
              />
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
