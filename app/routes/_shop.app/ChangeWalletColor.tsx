import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useEffect } from 'react'
import { useTypedActionData } from 'remix-typedjson'

import { extractValue } from '~/lib/actionMatcher'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { toast } from '~/components/ui/use-toast'

import { BaseGroup } from '~/components/FormGroups'
import { ColorSelection } from './ColorSelection'

import { loader } from './loader'
import { type action } from './action'

export default function ChangeColorModal() {
  const { fullWallets, partialWallets } = useLoaderData<typeof loader>()
  const actionData = useTypedActionData<typeof action>()

  const actionResult = extractValue(actionData, 'PATCH')

  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const walletId = searchParams.get('changeColor')

  const isSubmitting = navigation.state === 'submitting'

  useEffect(() => {
    // don't show color toast when name modal submits
    if (!walletId) return

    if (actionResult?.ok) {
      toast({
        title: 'Cor alterada com sucesso!',
      })
    } else if (actionResult?.ok === false) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível alterar a cor.',
      })
    }
  }, [actionResult])

  if (!walletId) return null

  const thisWallet = [...fullWallets, ...partialWallets].find(
    (w) => w.id === walletId,
  )
  if (!thisWallet) {
    setSearchParams({}, { replace: true })
    return null
  }

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(to) => {
        if (!to) setSearchParams({}, { replace: true })
      }}
    >
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>Alterar a cor de {thisWallet.title}</Dialog.Title>
        </Dialog.Header>

        <Form className="flex flex-col gap-4" method="patch">
          <input type="hidden" name="walletId" value={thisWallet.id} />

          <BaseGroup name="color" label="Selecione uma cor">
            <ColorSelection defaultColor={thisWallet.color} />
          </BaseGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Alterando...' : 'Alterar'}
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
