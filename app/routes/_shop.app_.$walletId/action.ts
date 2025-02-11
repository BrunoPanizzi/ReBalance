import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import AssetService, {
  DomainAsset,
  assetType,
} from '~/services/assetService/index.server'
import { DomainUser } from '~/services/auth/authService.server'

import { Result, error, ok } from '~/types/Result'

import { ErrorT } from '~/context/ErrorContext'

import { createMatcher } from '~/lib/actionMatcher'
import { currencyToNumber } from '~/lib/formatting'
import { typedjson } from 'remix-typedjson'

const currencySchema = (params?: z.CustomErrorParams) =>
  z
    .string()
    .transform((val) => currencyToNumber(val))
    .refine((val) => val > 0 && val < 10e9, params)
//                I mean at this point ^^ you're buying whole companies

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
  const assetId = formData.get('assetId')?.toString()

  if (!assetId) {
    return error('No assetId field found')
  }

  await AssetService.deleteAsset(user.uid, walletId, assetId)

  return ok(null)
}

const postSubactionForm = z
  .object({
    name: z.string().min(1, 'Insira um nome'),
    type: z.enum(assetType),
    initialAmount: z.coerce
      .number({
        invalid_type_error: 'Insira uma quantidade válida',
      })
      .nonnegative('A quantidade não pode ser negativa')
      .max(10e12, 'A quantidade deve ser menor que 1 trilhão')
      .optional(),
    price: currencySchema({ message: 'Insira um preço válido' }).optional(),
  })
  .refine((form) => (form.type === 'fixed-value' ? form.initialAmount : true), {
    message: 'Insira uma quantidade válida',
    path: ['initialAmount'],
  })
  .refine((form) => (form.type === 'fixed-value' ? form.price : true), {
    message: 'Insira uma preço',
    path: ['price'],
  })
type PostSubactionReturn = Result<DomainAsset, ErrorT[]>
const postAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PostSubactionReturn> => {
  const parsedForm = postSubactionForm.safeParse(Object.fromEntries(formData))

  if (!parsedForm.success) {
    return error(
      parsedForm.error.errors.map((e) => ({
        message: e.message,
        type: e.path.join(),
      })),
    )
  }

  const { name, type, initialAmount, price } = parsedForm.data

  try {
    const newAsset = await AssetService.createAsset(user.uid, walletId, {
      name,
      type,
      amount: initialAmount ?? 0,
      price,
    })

    return ok(newAsset)
  } catch (e) {
    console.log(e)

    return error([
      {
        message: 'Backend error',
        type: 'backend',
      },
    ])
  }
}

const patchFormSchema = z
  .object({
    assetId: z.string().uuid(),
    //                Postgres integer max safe value
    amount: z.coerce.number().max(2_147_483_647).nonnegative().optional(),
    price: currencySchema().optional(),
  })
  .refine(
    (form) => form.amount !== undefined || form.price !== undefined,
    'Amount or price should be provided',
  )

type PatchSubactionReturn = Result<DomainAsset, string>
const patchAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PatchSubactionReturn> => {
  const result = patchFormSchema.safeParse(Object.fromEntries(formData))

  console.log(Object.fromEntries(formData))

  if (!result.success) {
    return error(result.error.errors[0].message)
  }

  const { assetId, amount, price } = result.data

  const updatedAssets = await AssetService.update(user.uid, walletId, assetId, {
    amount,
    price,
  })

  return ok(updatedAssets)
}

const putFormSchema = z.object({
  assets: z.string(),
})
const putJSONSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    amount: z.number().nonnegative(),
  }),
)

type PutSubactionReturn = Result<DomainAsset[], string>
const putAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PutSubactionReturn> => {
  const parsedForm = putFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsedForm.success) {
    return error('Error while parsing form')
  }

  const newAssets = putJSONSchema.safeParse(JSON.parse(parsedForm.data.assets))

  if (!newAssets.success) {
    return error(newAssets.error.errors[0].message)
  }

  try {
    const updatedAssets = await AssetService.updateMany(
      user.uid,
      walletId,
      newAssets.data,
    )
    return ok(updatedAssets)
  } catch (e) {
    console.log(e)

    return error('Unknown backend error')
  }
}

const match = createMatcher<SubActionArgs>()({
  PUT: putAction,
  POST: postAction,
  PATCH: patchAction,
  DELETE: deleteAction,
})

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

  return typedjson(matchResult)
}
