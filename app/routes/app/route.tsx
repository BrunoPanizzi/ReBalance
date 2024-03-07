import { Link, Outlet, useLoaderData } from '@remix-run/react'
import colors from 'tailwindcss/colors.js'

import { Button } from '~/components/ui/button'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'
import Graph from '~/components/Graph'

import { EmptyWallet } from '~/components/icons/empty_wallet'

import { loader } from './loader'
import { action } from './action'

import WalletCard from './WalletCard'
import ListHeader from './ListHeader'
import NewWalletModal from './NewWalletModal'
import ChangeColorModal from './ChangeWalletColor'
import ChangeNameModal from './ChangeWalletName'
import RebalancePercentagesModal from './RebalanceModal'

export { loader, action }

export default function App() {
  const { user, wallets } = useLoaderData<typeof loader>()

  const showGraph = wallets.filter((w) => w.totalValue > 0).length > 0

  return (
    <>
      <Outlet />
      <NewWalletModal />
      <ChangeColorModal />
      <ChangeNameModal />
      <RebalancePercentagesModal />

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

          {wallets.length > 0 ? (
            wallets.map((w) => <WalletCard wallet={w} key={w.id} />)
          ) : (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4">
              <div className="w-1/2 max-w-36 text-orange-400/90">
                <EmptyWallet />
              </div>
              <div className="">
                <p className="text-lg font-semibold text-orange-100">
                  Você ainda não possui nenhuma carteira
                </p>
                <p className="mb-2 ">
                  <Link
                    to="/app?new"
                    className="text-lg font-bold text-primary-100 underline underline-offset-2 transition hover:text-primary-300"
                  >
                    Clique aqui e crie uma!
                  </Link>
                </p>
                <small className="text-sm">
                  Precisa de ajuda? Veja{' '}
                  <Link
                    to="/blog/carteiras"
                    className="text-primary-200 underline"
                  >
                    como as carteiras funcionam.
                  </Link>
                </small>
              </div>
            </div>
          )}
        </div>

        <div className="@container">
          <h2 className="mb-2 h-8 flex-1 text-xl font-semibold text-emerald-50 @md:h-auto @md:text-2xl">
            Distribuição dos ativos:
          </h2>
          <div className="h-min rounded-xl bg-gray-700/50">
            {showGraph ? (
              <div className="mx-auto max-w-md">
                <Graph
                  data={wallets}
                  value="totalValue"
                  name="title"
                  color={(w) => colors[w.color][600]}
                  m={5}
                />
              </div>
            ) : (
              <p className="p-4 text-center text-orange-100">
                Nada para mostrar aqui...
              </p>
            )}
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
