import { useLoaderData, MetaFunction } from '@remix-run/react'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { loader } from './loader'
import { action } from './action'
import { Table } from './Table'
import { NewStockModal } from './NewStockModal'

export { loader, action }

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.title }]
}

export default function WalletPage() {
  const wallet = useLoaderData<typeof loader>()

  return (
    <>
      <NewStockModal />
      <Header backArrow title={wallet.title} />
      <Wrapper cols={2}>
        <Table />

        <div className="bg-red-300 p-2"></div>
      </Wrapper>
    </>
  )
}

export function ErrorBoundary() {
  return (
    <div>
      <span>something went wrong</span>
    </div>
  )
}
