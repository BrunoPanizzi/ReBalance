import { useActionData, useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'

import { toast } from '~/components/ui/use-toast'

import { action, extractValue } from '../action'

// This function is used to handle the toast messages when the assets are updated
export function useOnAssetsUpdated(handleClear: () => void) {
  const { revalidate } = useRevalidator()

  const actionData = useActionData<typeof action>()
  const actionResult = extractValue(actionData, 'PUT')

  useEffect(() => {
    if (actionResult === undefined) return

    if (actionResult.ok) {
      handleClear()
      toast({
        title: 'Seus ativos foram atualizados!',
      })
      revalidate()
    } else {
      toast({
        title: 'Algo deu errado',
        variant: 'destructive',
      })
    }
  }, [actionResult])
}
