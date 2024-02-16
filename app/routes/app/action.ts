import {
  ActionFunctionArgs,
  TypedResponse,
  json,
  redirect,
} from '@remix-run/node'
import { z } from 'zod'

import { colorsSchema } from '~/constants/availableColors'
import { ErrorT } from '~/context/ErrorContext'

import { type Result } from '~/types/Result'

import WalletService, { DomainWallet } from '~/services/walletService'
import { sessionStorage } from '~/services/cookies/session.server'

const formSchema = z.object({
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

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<Result<DomainWallet, ErrorT[]>>
> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const user = session.get('user')

  if (!user) {
    throw redirect('/')
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

  const wallet = await WalletService.createWallet(user.uid, {
    title: result.data.title,
    idealPercentage: result.data.idealAmount,
    color: result.data.color,
  })

  return json({
    ok: true,
    value: wallet,
  })
}
