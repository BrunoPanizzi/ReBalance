import {
  HamburgerMenuIcon,
  InfoCircledIcon,
  MixerVerticalIcon,
  PlusIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { useNavigate, useRevalidator } from '@remix-run/react'
import { useEffect, useRef } from 'react'

import { cn } from '~/lib/utils'

import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from '~/components/ui/popover'
import { toast } from '~/components/ui/use-toast'

export default function ListHeader() {
  return (
    <>
      <span className="flex h-8 gap-4 @md:h-auto">
        <h2 className="flex-1 text-xl font-semibold text-emerald-50 @md/list:text-2xl">
          Suas carteiras:
        </h2>
        <Popover>
          <Button asChild size="icon" variant="ghost">
            <PopoverTrigger className="@md/list:hidden">
              <HamburgerMenuIcon className="size-4" />
            </PopoverTrigger>
          </Button>
          <PopoverContent className="flex w-fit flex-col gap-2 ">
            <ToolBarContent />
          </PopoverContent>
        </Popover>
      </span>
      <menu className="mb-3 hidden gap-1 rounded-lg bg-gray-700 p-1 @md/list:flex">
        <ToolBarContent />
      </menu>
    </>
  )
}

function ToolBarContent() {
  const navigate = useNavigate()
  const { revalidate, state } = useRevalidator()
  const isFirstRender = useRef(true)

  // TODO: make this better
  const percentagesAddUp = true

  useEffect(() => {
    if (state === 'idle' && !isFirstRender.current) {
      toast({ title: 'Valores atualizados!' })
    }
  }, [state])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    }

    return () => {
      isFirstRender.current = true
    }
  }, [])

  return (
    <>
      <PopoverItem
        title="Nova carteira"
        icon={<PlusIcon className="size-6 text-emerald-100" />}
        onClick={() => {
          navigate('?new')
        }}
      />

      <PopoverItem
        title="Reequlibrar"
        icon={
          percentagesAddUp ? (
            <MixerVerticalIcon className="size-5 text-emerald-100" />
          ) : (
            <InfoCircledIcon className="size-5 text-orange-300" />
          )
        }
        onClick={() => navigate('?rebalance')}
      />

      <PopoverItem
        title="Atualizar valores"
        onClick={revalidate}
        icon={
          <UpdateIcon
            className={cn('size-5 text-emerald-100', {
              'animate-spin': state === 'loading',
            })}
          />
        }
      />
    </>
  )
}
