import { ActionFunctionArgs, redirect, json } from '@remix-run/node'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import AssetService, {
  AssetType,
  DomainAsset,
  assetType,
} from '~/services/assetService/index.server'
import { DomainUser } from '~/services/auth/authService.server'

import { Result, error, ok } from '~/types/Result'

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
  const assetId = formData.get('assetId')?.toString()

  if (!assetId) {
    return error('No assetId field found')
  }

  await AssetService.deleteAsset(user.uid, walletId, assetId)

  return ok(null)
}

type PostSubactionReturn = Result<DomainAsset, string>
const postAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PostSubactionReturn> => {
  const asset = formData.get('name')?.toString()
  const type = formData.get('type')?.toString()

  if (!asset || !type) {
    return error('Both asset and type should be present in form data')
  }
  if (!assetType.find((a) => a === type)) {
    return error('Invalid type')
  }

  try {
    const newAsset = await AssetService.createAsset(user.uid, walletId, {
      amount: 0,
      name: asset,
      type: type as AssetType,
    })

    return ok(newAsset)
  } catch (e) {
    return error('Name already exists')
  }
}

const patchFormSchema = z.object({
  assetId: z.string().uuid(),
  //                Postgres integer max safe value
  amount: z.coerce.number().max(2_147_483_647).nonnegative(),
})

type PatchSubactionReturn = Result<DomainAsset, string>
const patchAction = async ({
  user,
  walletId,
  formData,
}: SubActionArgs): Promise<PatchSubactionReturn> => {
  const result = patchFormSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return error(result.error.errors[0].message)
  }

  const { assetId, amount } = result.data

  const updatedAssets = await AssetService.updateAmount(
    user.uid,
    walletId,
    assetId,
    amount,
  )

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

const { match, extractValue } = createMatcher<SubActionArgs>()({
  PUT: putAction,
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
