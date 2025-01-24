import { useLoaderData, useSearchParams } from '@remix-run/react'
import { PlusIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons'

import { EasyTooltip } from '~/components/ui/tooltip'

import { loader } from './loader'

import { SortProvider } from './SortContext'
import { SortSelector } from './SortSelector'
import { AssetList } from './AssetList'
import { NoValueRow } from './AssetList/NoValueRow'

// Table might not be the most descriptive name ever...
export function Table() {
  const [_, setSearchParams] = useSearchParams()

  const { assets, assetsWithoutPrice } = useLoaderData<typeof loader>()

  const haveAssetsWithoutPrice = assetsWithoutPrice.length > 0

  return (
    <SortProvider>
      <div>
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-primary-100">
              Seus ativos
            </h2>

            <button
              className="transition-transform hover:scale-125"
              onClick={() => setSearchParams({ new: '' }, { replace: true })}
            >
              <PlusIcon className="size-6 text-primary-300 " />
            </button>
          </div>

          <SortSelector />
        </header>

        {assets.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-primary-300">Nenhum ativo encontrado</span>
          </div>
        ) : (
          <div className="@container">
            <AssetList />

            {haveAssetsWithoutPrice && (
              <>
                <header className="mb-2 mt-4 flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-red-300">
                    Ativos sem preço:
                  </h2>
                  <EasyTooltip
                    color={'red'}
                    label="Devido a problemas internos, não conseguimos calcular o valor destes ativos. Tente novamente em instantes."
                  >
                    <QuestionMarkCircledIcon className="size-5 text-red-300" />
                  </EasyTooltip>
                </header>

                {assetsWithoutPrice.map((asset) => (
                  <NoValueRow key={asset.id} asset={asset} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </SortProvider>
  )
}
