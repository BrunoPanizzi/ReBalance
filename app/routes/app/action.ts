import {
  ActionFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import { z } from 'zod'

import { createMatcher } from '~/lib/actionMatcher'

import { colorsSchema } from '~/constants/availableColors'
import { ErrorT } from '~/context/ErrorContext'

import { type Result } from '~/types/Result'

import WalletService, { DomainWallet } from '~/services/walletService'
import { sessionStorage } from '~/services/cookies/session.server'
import { DomainUser } from '~/services/auth/authService.server'

type Args = {
  user: DomainUser
  formData: FormData
}

const postFormSchema = z.object({
  title: z.string().min(1, 'Insira um nome para sua carteira'),
  idealAmount: z.coerce
    .number()
    .min(0, 'A porcentagem ideal deve ser maior que 0')
    .max(100, 'A porcentagem ideal deve ser menor que 100'),
  color: z.enum(colorsSchema.options, {
    invalid_type_error: 'Cor inválida',
    required_error: 'Selecione uma cor',
  }),
})
async function postAction({
  formData,
  user,
}: Args): Promise<Result<DomainWallet, ErrorT[]>> {
  const result = postFormSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return {
      ok: false,
      error: result.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    }
  }

  const wallet = await WalletService.createWallet(user.uid, {
    title: result.data.title,
    idealPercentage: result.data.idealAmount,
    color: result.data.color,
  })

  return {
    ok: true,
    value: wallet,
  }
}

async function deleteAction({
  user,
  formData,
}: Args): Promise<Result<null, string>> {
  const walletId = formData.get('walletId')?.toString()

  if (!walletId)
    return {
      ok: false,
      error: '`walletId` not found in formData',
    }

  try {
    await WalletService.deleteWallet(user.uid, walletId)
    return { ok: true, value: null }
  } catch (e) {
    console.log(e)
    return { ok: false, error: 'Unknwon database error' }
  }
}

const { match, extractValue } = createMatcher<Args>()({
  POST: postAction,
  DELETE: deleteAction,
})
export { extractValue }

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
  }

  const formData = await request.formData()

  const matchResult = await match(request.method.toUpperCase(), {
    formData,
    user,
  })

  return json(matchResult)
}
