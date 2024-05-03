import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { z } from 'zod'

import { createMatcher } from '~/lib/actionMatcher'

import { colorsSchema } from '~/constants/availableColors'
import { ErrorT } from '~/context/ErrorContext'

import { type Result, ok, error } from '~/types/Result'

import WalletService, { DomainWallet } from '~/services/walletService'
import { sessionStorage } from '~/services/cookies/session.server'
import { DomainUser } from '~/services/auth/authService.server'
import { assetType } from '~/services/assetService/index.server'

type Args = {
  user: DomainUser
  formData: FormData
}

const postFormSchema = z.object({
  title: z.string().min(1, 'Insira um nome para sua carteira'),
  type: z.enum(assetType, {
    errorMap: (issue) => {
      switch (issue.code) {
        case 'invalid_type':
          return { message: 'Selecione um tipo' }
        case 'invalid_enum_value':
          return { message: 'Selecione um tipo válido' }
        default:
          return { message: 'Tipo inválido' }
      }
    },
  }),
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
    return error(
      result.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  try {
    const wallet = await WalletService.createWallet(user.uid, {
      title: result.data.title,
      type: result.data.type,
      idealPercentage: result.data.idealAmount,
      color: result.data.color,
    })

    return ok(wallet)
  } catch (e) {
    console.log(e)
    return error([{ message: 'Unknown database error', type: 'backend' }])
  }
}

async function deleteAction({
  user,
  formData,
}: Args): Promise<Result<null, string>> {
  const walletId = formData.get('walletId')?.toString()

  if (!walletId) {
    return error('`walletId` not found in formData')
  }

  try {
    await WalletService.deleteWallet(user.uid, walletId)
    return ok(null)
  } catch (e) {
    console.log(e)
    return error('Unknwon database error')
  }
}

const patchFormSchema = z
  .object({
    walletId: z.string().uuid(),
    color: colorsSchema.optional(),
    title: z.string().optional(),
  })
  .refine((a) => a.color || a.title, {
    message: 'At least one param other than walletId should be provided',
  })
async function patchAction({
  user,
  formData,
}: Args): Promise<Result<DomainWallet, ErrorT[]>> {
  const parsedForm = patchFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsedForm.success) {
    return error(
      parsedForm.error.errors.map((e) => ({
        message: e.message,
        type: e.path.join(''),
      })),
    )
  }

  const { walletId, color, title } = parsedForm.data

  try {
    const updatedWallet = await WalletService.update(user.uid, walletId, {
      color,
      title,
    })

    return ok(updatedWallet)
  } catch (e) {
    return error([{ message: 'Unknown database error', type: 'backend' }])
  }
}

const putFormSchema = z.object({
  wallets: z.string(),
})
const putJSONSchema = z.array(
  z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    color: colorsSchema,
    idealPercentage: z.number().nonnegative(),
  }),
)
async function putAction({
  formData,
  user,
}: Args): Promise<Result<DomainWallet[], string>> {
  const parsedForm = putFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsedForm.success) {
    return { error: 'Error while parsing form', ok: false }
  }

  const wallets = putJSONSchema.safeParse(JSON.parse(parsedForm.data.wallets))

  if (!wallets.success) {
    return { ok: false, error: wallets.error.errors[0].message }
  }

  try {
    await new Promise((res) => setTimeout(res, 200))
    const updatedWallets = await WalletService.updateIdealPercentages(
      user.uid,
      wallets.data,
    )
    return {
      ok: true,
      value: updatedWallets,
    }
  } catch (e) {
    console.log(e)

    return {
      ok: false,
      error: 'Database error',
    }
  }
}

const { match, extractValue } = createMatcher<Args>()({
  POST: postAction,
  DELETE: deleteAction,
  PATCH: patchAction,
  PUT: putAction,
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
