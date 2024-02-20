import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useEffect } from 'react'

import { Button } from '~/components/ui/button'
import { Dialog } from '~/components/ui/dialog'
import { toast } from '~/components/ui/use-toast'

import { InputGroup } from '~/components/FormGroups'

import { loader } from './loader'
import { action, extractValue } from './action'

export default function ChangeNameModal() {
  const { wallets } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'PATCH')

  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const walletId = searchParams.get('changeName')

  const isSubmitting = navigation.state === 'submitting'

  useEffect(() => {
    if (actionResult?.ok) {
      toast({
        title: 'Nome alterado com sucesso!',
      })
    } else if (actionResult?.ok === false) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível alterar o nome.',
      })
    }
  }, [actionResult])

  if (!walletId) return null

  const thisWallet = wallets.find((w) => w.id === walletId)
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
          <Dialog.Title>Alterar o nome de {thisWallet.title}</Dialog.Title>
        </Dialog.Header>

        <Form className="flex flex-col gap-4" method="patch">
          <input type="hidden" name="walletId" value={thisWallet.id} />

          <InputGroup name="title" label="Novo nome" />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Alterando...' : 'Alterar'}
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
