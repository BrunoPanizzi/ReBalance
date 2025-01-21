import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react'
import { ReactElement, createContext, useContext, useState } from 'react'

import { percentage } from '~/lib/formatting'
import { cn } from '~/lib/utils'

import { FullWalletWithAssets } from '~/services/walletService'

import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Slider } from '~/components/ui/slider'
import { EasyTooltip } from '~/components/ui/tooltip'

import { loader } from './loader'

type RebalanceContext = {
  wallets: FullWalletWithAssets[]
  handleChangeIdealPercentage: (walletId: string, value: number) => void
  totalPercentage: number

  handleAllEqual: () => void
  handleReset: () => void
  handleNormalize: () => void

  handleClose: () => void
  handleConfirm: () => void
  isSubmitting: boolean
}

const rebalanceContext = createContext<RebalanceContext | null>(null)

function RebalanceContextProvider({ children }: { children: ReactElement }) {
  const { fullWallets, partialWallets } = useLoaderData<typeof loader>()
  const originalWallets = [
    ...fullWallets,
    ...partialWallets.map((w) => ({
      ...w,
      totalValue: 0,
      realPercentage: 0,
      assets: [],
    })),
  ]

  const fetcher = useFetcher({ key: 'rebalance' })
  const isSubmitting = fetcher.state === 'submitting'

  const navigate = useNavigate()

  const [wallets, setWallets] = useState(originalWallets)

  const totalPercentage = Number(
    wallets.reduce((acc, w) => acc + w.idealPercentage, 0).toFixed(4),
  )

  function handleChangeIdealPercentage(walletId: string, value: number) {
    setWallets((p) =>
      p.map((w) => {
        if (w.id === walletId) {
          return {
            ...w,
            idealPercentage: value,
          }
        }
        return w
      }),
    )
  }

  function handleAllEqual() {
    setWallets((p) =>
      p.map((w) => ({ ...w, idealPercentage: 1 / wallets.length })),
    )
  }

  function handleNormalize() {
    setWallets(
      wallets.map((w) => ({
        ...w,
        idealPercentage: w.idealPercentage / totalPercentage,
      })),
    )
  }

  function handleReset() {
    setWallets(originalWallets)
  }

  function handleConfirm() {
    fetcher.submit(
      {
        wallets: JSON.stringify(wallets),
      },
      {
        method: 'PUT',
      },
    )
  }

  return (
    <rebalanceContext.Provider
      value={{
        wallets,
        totalPercentage,
        handleChangeIdealPercentage,

        handleAllEqual,
        handleNormalize,
        handleReset,

        handleClose: () => navigate('/app', { replace: true }),
        handleConfirm,
        isSubmitting,
      }}
    >
      {children}
    </rebalanceContext.Provider>
  )
}

function useRebalanceContext() {
  const ctx = useContext(rebalanceContext)

  if (ctx === null) {
    throw new Error(
      'useRebalanceContext should be used within a RebalanceContextProvider.',
    )
  }

  return ctx
}

export default function RebalancePercentagesModal() {
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
      <RebalanceContextProvider>
        <Dialog.Content className="max-w-md">
          <Dialog.Title>Rebalancear carteiras</Dialog.Title>

          <Toolbar />

          <Preview />

          <Sliders />

          <TotalValue />

          <Footer />
        </Dialog.Content>
      </RebalanceContextProvider>
    </Dialog.Root>
  )
}

function Toolbar() {
  const { handleAllEqual, handleNormalize, handleReset } = useRebalanceContext()

  return (
    <menu className="flex gap-1 rounded-lg bg-gray-600 p-0.5">
      <li>
        <Button onClick={handleAllEqual} variant="colorful-ghost" size="sm">
          Igual
        </Button>
      </li>
      <li>
        <Button onClick={handleNormalize} variant="colorful-ghost" size="sm">
          Normalizar
        </Button>
      </li>
      <li>
        <Button onClick={handleReset} variant="colorful-ghost" size="sm">
          Original
        </Button>
      </li>
    </menu>
  )
}

function Preview() {
  const { wallets } = useRebalanceContext()

  return (
    <div className="space-y-2">
      <PercentagesPreview
        label="Distribuição ideal"
        wallets={wallets.map((w) => ({
          name: w.title,
          color: w.color,
          size: w.idealPercentage,
        }))}
      />
      <PercentagesPreview
        label="Distribuição atual"
        wallets={wallets.map((w) => ({
          name: w.title,
          size: w.realPercentage,
          color: w.color,
        }))}
      />
    </div>
  )
}

type PercentagesPreviewProps = {
  label: string
  wallets: { name: string; size: number; color: string }[]
}
function PercentagesPreview({ wallets, label }: PercentagesPreviewProps) {
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

function Sliders() {
  const { wallets, handleChangeIdealPercentage } = useRebalanceContext()

  return (
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
              value={[w.idealPercentage]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([v]) => handleChangeIdealPercentage(w.id, v)}
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
  )
}

function TotalValue() {
  const { totalPercentage } = useRebalanceContext()

  return (
    <span
      className={cn(
        'text-right font-semibold',
        totalPercentage === 1 ? 'text-emerald-300' : 'text-orange-300',
      )}
    >
      {percentage(totalPercentage, 0)}

      <hr className="border-dashed border-gray-400" />
    </span>
  )
}

function Footer() {
  const { handleClose, handleConfirm, isSubmitting } = useRebalanceContext()

  return (
    <Dialog.Footer>
      <Button onClick={handleClose} variant="ghost">
        Cancelar
      </Button>
      <Button disabled={isSubmitting} onClick={handleConfirm}>
        {isSubmitting ? 'Atualizando...' : 'Confirmar'}
      </Button>
    </Dialog.Footer>
  )
}
