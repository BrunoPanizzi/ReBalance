import {
  ActionFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import StockService, { DomainStock } from '~/services/stockService/index.server'

import { Result } from '~/types/Result'
import { DomainUser } from '~/services/auth/authService.server'

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

type ActionResponse =
  | {
      method: 'DELETE'
      result: DeleteSubactionReturn
    }
  | {
      method: 'POST'
      result: PostSubactionReturn
    }

// creates a stock
export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
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

  let result

  switch (request.method.toUpperCase()) {
    case 'DELETE':
      result = await deleteAction({ user, walletId, formData })
      return json({
        method: 'DELETE',
        result,
      })
    case 'POST':
      result = await postAction({ user, walletId, formData })
      return json({
        method: 'POST',
        result,
      })
  }

  throw new Error('Unreachable')
}
