import { useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'

import { useColors } from '~/context/ColorsContext'

import Header from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { loader } from './loader'
import { action } from './action'
import { Table } from './Table'
import { NewStockModal } from './NewStockModal'

export { loader, action }

export default function WalletPage() {
  const wallet = useLoaderData<typeof loader>()
  const { setColor } = useColors()

  useEffect(() => {
    setColor(wallet.color)
    return () => {
      setColor('emerald')
    }
  }, [setColor])

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
