import type { Route } from './+types/route'

import { assetTypeLabels } from '~/lib/enumDisplayValues'

import FloatingHeader from '~/components/Header'
import Wrapper from '~/components/Wrapper'

import { loader } from './loader'
import { action } from './action'
import { Table } from './Table'
import { NewAssetModal } from './NewAssetModal'
import Information from './Information'

export { loader, action }

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data.title }]
}

export default function WalletPage({ loaderData }: Route.ComponentProps) {
  const wallet = loaderData

  return (
    <>
      <NewAssetModal />
      <FloatingHeader
        backArrow
        title={wallet.title}
        leftSide={
          <span className="rounded-full bg-primary-400 px-2 text-sm text-primary-950">
            {assetTypeLabels[wallet.type]}
          </span>
        }
      />
      <Wrapper cols={2}>
        <Table />

        <Information />
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
