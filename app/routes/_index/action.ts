import { ActionFunctionArgs, TypedResponse, json } from '@remix-run/node'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import { authSerivce } from '~/services/auth/authService.server'
import { DomainUser } from '~/services/auth/authService.server'

import { ErrorT } from '~/context/ErrorContext'

import { Result, typedError } from '~/types/Result'

const loginFormValidator = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})
const signupFormValidator = loginFormValidator.extend({
  userName: z.string().min(1, 'Nome de usuário é obrigatório'),
})

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<Result<DomainUser, ErrorT[]>>
> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode')

  if (!mode || (mode !== 'login' && mode !== 'signup')) {
    return typedError([{ type: 'unknown', message: 'Invalid mode' }])
  }

  const formData = await request.formData()
  const rawForm = Object.fromEntries(formData)

  const formValidator =
    mode === 'login' ? loginFormValidator : signupFormValidator
  const method = mode === 'login' ? authSerivce.login : authSerivce.createUser

  const userInfo = formValidator.safeParse(rawForm)

  if (!userInfo.success) {
    return typedError(
      userInfo.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  const response = await method(userInfo.data)

  if (!response.ok) {
    let error
    if (response.error === 'User already exists')
      error = {
        type: 'email',
        message: 'Email já cadastrado',
      }
    else
      error = {
        type: 'backend',
        message: response.error,
      }

    return typedError([error])
  }

  session.set('user', response.value)

  return json(response, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}
