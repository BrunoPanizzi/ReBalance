import { useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'
import { loader } from './loader'
import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { EasyTooltip } from '~/components/ui/tooltip'
import { Slider } from '~/components/ui/slider'
import { percentage } from '~/lib/formatting'
import React from 'react'

export default function RebalancePercentagesModal() {
  const { wallets } = useLoaderData<typeof loader>()

  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const shouldOpen = searchParams.get('rebalance')

  if (shouldOpen === null) return null

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(to) => {
        if (!to) setSearchParams({}, { replace: true })
      }}
    >
      <Dialog.Content className="max-w-md">
        <Dialog.Title>Hello world!</Dialog.Title>

        <div className="flex flex-col gap-2">
          <SplitIndicator
            label="Distribuição ideal"
            wallets={wallets.map((w) => ({
              name: w.title,
              color: w.color,
              size: w.idealPercentage,
            }))}
          />
          <SplitIndicator
            label="Distribuição atual"
            wallets={wallets.map((w) => ({
              name: w.title,
              size: w.realPercentage,
              color: w.color,
            }))}
          />

          <menu className="flex gap-1 rounded-lg bg-gray-600 p-0.5">
            <li>
              <Button variant="colorful-ghost" size="sm">
                Igual
              </Button>
            </li>
            <li>
              <Button variant="colorful-ghost" size="sm">
                Normalizar
              </Button>
            </li>
            <li>
              <Button variant="colorful-ghost" size="sm">
                Voltar
              </Button>
            </li>
          </menu>

          <div className="grid grid-cols-[auto_1fr_auto] gap-2 text-center">
            {wallets.map((w) => (
              <div
                key={w.id}
                data-color={w.color}
                className="col-span-3 grid grid-cols-subgrid items-center"
              >
                <div className="rounded-lg bg-primary-700 px-2 font-display">
                  {w.title}
                </div>
                <div data-color={w.color}>
                  <Slider
                    defaultValue={[w.realPercentage]}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
                <div
                  data-color={w.color}
                  className="rounded border border-primary-500/50 px-2"
                >
                  {percentage(w.idealPercentage)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="ghost">Cancelar</Button>
          <Button className="">Confirmar</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}

type SplitIndicatorProps = {
  label: string
  wallets: { name: string; size: number; color: string }[]
}
function SplitIndicator({ wallets, label }: SplitIndicatorProps) {
  return (
    <div>
      <label className="text-sm text-gray-200">{label}</label>
      <div className="flex h-4 overflow-hidden rounded-lg border border-gray-400/50 bg-gray-500 shadow">
        {wallets.map((w) => (
          <EasyTooltip color={w.color} delay={100} label={w.name}>
            <div
              key={w.name}
              className="h-full bg-primary-500"
              style={{
                flex: w.size,
              }}
            />
          </EasyTooltip>
        ))}
      </div>
    </div>
  )
}
