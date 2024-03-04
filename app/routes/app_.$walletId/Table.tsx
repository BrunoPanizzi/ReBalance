import { useLoaderData, useSearchParams } from '@remix-run/react'
import { PlusIcon } from '@radix-ui/react-icons'

import { loader } from './loader'

import { SortProvider } from './SortContext'
import { SortSelector } from './SortSelector'
import { StocksList } from './StocksList'
// TODO: change ^^^ this to match the asset type 

// Table might not be the most descriptive name ever...
export function Table() {
  const { assets } = useLoaderData<typeof loader>()

  const [_, setSearchParams] = useSearchParams()

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
            <StocksList />
          </div>
        )}
      </div>
    </SortProvider>
  )
}
