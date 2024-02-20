import {
  HamburgerMenuIcon,
  InfoCircledIcon,
  MixerVerticalIcon,
  PlusIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { useNavigate, useRevalidator } from '@remix-run/react'
import { useEffect, useRef } from 'react'

import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from '~/components/ui/popover'
import { toast } from '~/components/ui/use-toast'
import { cn } from '~/lib/utils'

export default function ListHeader() {
  return (
    <>
      <span className="mb-2 flex items-center gap-4 @md/list:mb-0">
        <h2 className="flex-1 text-2xl font-semibold text-emerald-50">
          Suas carteiras:
        </h2>
        <Popover>
          <Button asChild size="icon" variant="ghost">
            <PopoverTrigger className="@md/list:hidden">
              <HamburgerMenuIcon className="size-5" />
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
        onClick={() => {}}
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
