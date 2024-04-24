import { ArrowDownIcon } from '@radix-ui/react-icons'

import { cn } from '~/lib/utils'

import { Select } from '~/components/ui/select'

import { SortOptions, useSortContext } from './SortContext'

// TODO: make this responsive
export function SortSelector() {
  const { sort, setSort, toggleAscending } = useSortContext()

  return (
    <div className="flex items-center justify-between gap-1">
      <Select.Root
        defaultValue={sort.by}
        onValueChange={(value) => setSort(value as SortOptions)}
      >
        <Select.Trigger
          className="border-primary-400/50 bg-transparent hover:border-primary-400 data-[state=open]:border-primary-400"
          size="sm"
        >
          Ordem: <Select.Value />
        </Select.Trigger>
        <Select.Content className="text-sm">
          <Select.Group>
            <Select.Item value="name">Ticker</Select.Item>
            <Select.Item value="amount">Quantidade</Select.Item>
            <Select.Item value="price">Preço</Select.Item>
            <Select.Item value="percentage">Porcentagem</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <button
        className="rounded-md border border-primary-400/50 p-1.5 shadow transition-colors hover:border-primary-400"
        onClick={toggleAscending}
        title={sort.ascending ? 'Menor para maior' : 'Maior para menor'}
      >
        <ArrowDownIcon
          className={cn('size-4 text-primary-400 transition-transform', {
            'rotate-180': !sort.ascending,
          })}
        />
      </button>
    </div>
  )
}
