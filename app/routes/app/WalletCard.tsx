import {
  DotsVerticalIcon,
  MagicWandIcon,
  Pencil2Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { Link, useFetcher } from '@remix-run/react'

import { brl, percentage } from '~/lib/formatting'

import { FullWalletWithStocks } from '~/services/walletService'

import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverItem,
} from '~/components/ui/popover'

import { action, extractValue } from './action'
import { useEffect } from 'react'
import { toast } from '~/components/ui/use-toast'

type WalletProps = { wallet: FullWalletWithStocks }

export default function WalletCard({ wallet }: WalletProps) {
  const fetcher = useFetcher<typeof action>({ key: wallet.id + 'DELETE' })
  const actionResult = extractValue(fetcher.data, 'DELETE')

  function deleteWallet() {
    fetcher.submit({ walletId: wallet.id }, { method: 'DELETE' })
  }

  useEffect(() => {
    if (actionResult?.ok) {
      toast({
        title: `Carteira ${wallet.title} excluída.`,
      })
    }
  }, [actionResult])

  return (
    <Link
      to={wallet.id}
      relative="path"
      data-color={wallet.color}
      className="grid grid-cols-[1fr_auto] grid-rows-[auto_auto] items-center gap-2 rounded-md border border-primary-500/50 bg-primary-300/10 px-4 py-2 transition first-of-type:rounded-t-xl last-of-type:rounded-b-xl hover:border-primary-500/75 hover:bg-primary-400/20"
    >
      <span className="flex items-center gap-2">
        <h3 className="text-xl font-semibold text-primary-200">
          {wallet.title}
        </h3>

        <div onClick={(e) => e.preventDefault()}>
          <Popover>
            <Button
              className="size-auto p-1"
              asChild
              size="icon"
              variant="ghost"
            >
              <PopoverTrigger>
                <DotsVerticalIcon className="h-5 w-5 text-primary-200" />
              </PopoverTrigger>
            </Button>
            <PopoverContent
              data-color={wallet.color}
              className="flex w-fit flex-col gap-2 "
            >
              <PopoverItem
                title="Alterar nome"
                icon={<Pencil2Icon className="size-5 text-primary-200" />}
                onClick={() => {}}
              />

              <PopoverItem
                title="Alterar cor"
                icon={<MagicWandIcon className="size-5 text-primary-200" />}
                onClick={() => {}}
              />

              <PopoverItem
                title="Remover carteira"
                icon={<TrashIcon className="size-5 text-red-500" />}
                onClick={deleteWallet}
              />
            </PopoverContent>
          </Popover>
        </div>
      </span>

      <span className="row-start-2">
        <span className="mr-2">
          ideal: {percentage(wallet.idealPercentage)}
        </span>
        <span className="inline-block">
          atual: {percentage(wallet.realPercentage)}
        </span>
      </span>

      <span className="row-span-2 text-xl font-bold text-primary-200">
        <span>{brl(wallet.totalValue)}</span>
      </span>
    </Link>
  )
}
