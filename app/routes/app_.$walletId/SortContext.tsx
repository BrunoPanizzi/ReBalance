import { createContext, useContext, useState } from 'react'

export type SortOptions = 'ticker' | 'amount' | 'price' | 'percentage'

export type SortContext = {
  sort: {
    ascending: boolean
    by: SortOptions
  }
  setSort: (sort: SortOptions | ((prev: SortOptions) => SortOptions)) => void
  toggleAscending: () => void
}

const sortContext = createContext<SortContext | null>(null)

export function useSortContext() {
  const context = useContext(sortContext)
  if (!context) {
    throw new Error('useSortContext must be used within a SortProvider')
  }
  return context
}

export function SortProvider({ children }: { children: React.ReactNode }) {
  const [sort, setSort] = useState<SortOptions>('ticker')
  const [ascending, setAscending] = useState(true)

  const toggleAscending = () => setAscending((prev) => !prev)

  return (
    <sortContext.Provider
      value={{
        sort: { by: sort, ascending },
        setSort,
        toggleAscending,
      }}
    >
      {children}
    </sortContext.Provider>
  )
}
