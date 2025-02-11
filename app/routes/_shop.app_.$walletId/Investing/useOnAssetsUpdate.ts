import { useRevalidator, useActionData } from 'react-router'
import { useEffect } from 'react'

import { extractValue } from '~/lib/actionMatcher'

import { toast } from '~/components/ui/use-toast'

import { action } from '../action'

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
