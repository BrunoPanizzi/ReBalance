import { Form, Link, useLoaderData } from 'react-router'
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'

import { brl } from '~/lib/formatting'

import { EasyTooltip } from '~/components/ui/tooltip'
import { Button } from '~/components/ui/button'

import { loader as suggestionsLoader } from '~/routes/app.$walletId.suggestions'
import { loader } from '../loader'

import { PurchasesList } from './PurchasesList'
import { BarChart } from './BarChart'

type ResultsProps = {
  data: Awaited<ReturnType<typeof suggestionsLoader>> | undefined
  // ideally we shoudn't rely on this method of clearing the suggestions
  // the best approach would be to reset the loader, as in this discussion:
  // https://github.com/remix-run/remix/discussions/2749
  onClear: () => void
}
export function Results({ onClear, data }: ResultsProps) {
  const { assets } = useLoaderData<typeof loader>()

  if (!data || !data.ok) {
    return null
  }
  if (data.value.assetsBought === 0) {
    return <NotEnoughMoney amount={data.value.totalAmount} />
  }

  const newAssets = assets.map((s) => {
    const amountToBuy = data.value.purchases[s.name] || 0
    return {
      id: s.id,
      name: s.name,
      amount: s.amount + amountToBuy,
    }
  })

  return (
    <div className="mt-4">
      <h3 className="text-lg">
        Com{' '}
        <strong className="font-bold text-primary-200">
          {brl(data.value.totalAmount)}
        </strong>
        , você pode comprar:{' '}
      </h3>

      <div className="mt-2 flex flex-wrap gap-2">
        <PurchasesList purchases={data.value.purchases} />
      </div>

      <div className="mt-2">
        <header className="mb-1 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-primary-100">
            Distribuição das compras
          </h3>
          <EasyTooltip
            color="orange"
            label={
              <>
                <p className="mb-2">
                  Este gráfico representa o valor investido em cada ativo e como
                  a distribuição vai ser alterada após a compra.
                </p>
                <p>
                  Para ver qual barra representa qual ativo, clique nelas para
                  ver mais informações.
                </p>
              </>
            }
            side="left"
          >
            <QuestionMarkCircledIcon className="size-4 cursor-pointer stroke-orange-200" />
          </EasyTooltip>
        </header>
        <BarChart purchases={data.value.purchases} />
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onClear} variant="outline">
          Limpar
        </Button>
        <Form method="PUT">
          <Button name="assets" value={JSON.stringify(newAssets)}>
            Invesitr
          </Button>
        </Form>
      </div>
    </div>
  )
}

type NotEnoughMoneyProps = {
  amount: number
}
function NotEnoughMoney({ amount }: NotEnoughMoneyProps) {
  return (
    <div className="mt-4">
      <strong className="text-lg font-semibold text-primary-200">
        Não foi possível equilibrar seus invsetimentos {':('}
      </strong>
      <p className="mt-2">
        Com {brl(amount)} não é possível comprar nenhum ativo da sua carteira.
      </p>
      <p className="mt-1">
        Se você acha que isso é um erro ou possui alguma dúvida, veja nossas{' '}
        <Button asChild variant="link" className="p-0 text-primary-100">
          <Link to="/faq">perguntas frequentes</Link>
        </Button>{' '}
        ou{' '}
        <Button asChild variant="link" className="p-0 text-primary-100">
          <Link to="/feedback">envie feedback.</Link>
        </Button>
      </p>
    </div>
  )
}
