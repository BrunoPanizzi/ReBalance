import {
  ActionFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import StockService, { DomainStock } from '~/services/stockService/index.server'

import { ErrorT } from '~/context/ErrorContext'

import { Result } from '~/types/Result'

const formSchema = z.object({
  stock: z.string().min(1),
})

// creates a stock
export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<
  TypedResponse<Result<DomainStock, ErrorT[]>>
> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const walletId = params.walletId

  if (!walletId) {
    return json({
      ok: false,
      error: [{ message: 'no wallet id found', type: 'unreachable' }],
    })
  }

  const formData = await request.formData()

  const result = formSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return json({
      ok: false,
      error: result.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  const { stock } = result.data

  try {
    const newStock = await StockService.createStock(user.uid, walletId, {
      amount: 0,
      ticker: stock,
    })

    return json({
      ok: true,
      value: newStock,
    })
  } catch (e) {
    return json({
      ok: false,
      error: [{ message: 'Ticker already exists', type: 'duplicate' }],
    })
  }
}
