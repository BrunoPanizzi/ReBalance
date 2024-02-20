import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import StockService, { DomainStock } from '~/services/stockService/index.server'
import { DomainUser } from '~/services/auth/authService.server'

import { Result } from '~/types/Result'

import { createMatcher } from '~/lib/actionMatcher'

type SubActionArgs = {
  user: DomainUser
  walletId: string
  formData: FormData
}

type DeleteSubactionReturn = Result<null, string>
const deleteAction = async ({
  formData,
  user,
  walletId,
}: SubActionArgs): Promise<DeleteSubactionReturn> => {
  const stockId = formData.get('stockId')?.toString()

  if (!stockId) {
    return {
      ok: false,
      error: 'No stock id field found',
    }
  }

  await StockService.deleteStock(user.uid, walletId, stockId)

  return {
    ok: true,
    value: null,
  }
}

type PostSubactionReturn = Result<DomainStock, string>
const postAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PostSubactionReturn> => {
  const stock = formData.get('stock')?.toString()

  if (!stock) {
    return {
      ok: false,
      error: 'No stock field found',
    }
  }

  try {
    const newStock = await StockService.createStock(user.uid, walletId, {
      amount: 0,
      ticker: stock,
    })

    return {
      ok: true,
      value: newStock,
    }
  } catch (e) {
    return {
      ok: false,
      error: 'Ticker already exists',
    }
  }
}

const patchFormSchema = z.object({
  stockId: z.string().uuid(),
  //                Postgres integer max safe value
  amount: z.coerce.number().max(2_147_483_647).nonnegative(),
})

type PatchSubactionReturn = Result<DomainStock, string>
const patchAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PatchSubactionReturn> => {
  const result = patchFormSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      ok: false,
      error: result.error.errors[0].message,
    }
  }

  const { stockId, amount } = result.data

  const updatedStock = await StockService.updateAmount(
    user.uid,
    walletId,
    stockId,
    amount,
  )

  return {
    ok: true,
    value: updatedStock,
  }
}

const { match, extractValue } = createMatcher<SubActionArgs>()({
  POST: postAction,
  PATCH: patchAction,
  DELETE: deleteAction,
})
export { extractValue }

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const walletId = params.walletId

  if (!walletId) {
    // unreachable (I hope)
    throw new Error('Wallet id not found inside params')
  }

  const formData = await request.formData()

  const matchResult = await match(request.method.toUpperCase(), {
    user,
    walletId,
    formData,
  })

  return json(matchResult)
}
