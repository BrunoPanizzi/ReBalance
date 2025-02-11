import type { Route } from './+types/route'
import { data } from 'react-router'
import { z } from 'zod'

import { sessionStorage } from '~/services/cookies/session.server'
import { authSerivce } from '~/services/auth/authService.server'
import { DomainUser } from '~/services/auth/authService.server'

import { ErrorT } from '~/context/ErrorContext'

import { Result, error } from '~/types/Result'

const loginFormValidator = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})
const signupFormValidator = loginFormValidator.extend({
  userName: z.string().min(1, 'Nome de usuário é obrigatório'),
})

export const action = async ({ request }: Route.ActionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const formData = await request.formData()

  const mode = formData.get('mode')
  if (!mode || (mode !== 'login' && mode !== 'signup')) {
    return error([{ type: 'mode', message: 'Modo inválido' }])
  }

  const rawForm = Object.fromEntries(formData)

  const formValidator =
    mode === 'login' ? loginFormValidator : signupFormValidator
  const method = mode === 'login' ? authSerivce.login : authSerivce.createUser

  const userInfo = formValidator.safeParse(rawForm)

  if (!userInfo.success) {
    return error(
      userInfo.error.errors.map((e) => ({
        type: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  const response = await method(userInfo.data)

  if (!response.ok) {
    let err
    if (response.error === 'User already exists')
      err = {
        type: 'email',
        message: 'Email já cadastrado',
      }
    else
      err = {
        type: 'backend',
        message: response.error,
      }

    return error([err])
  }

  session.set('user', response.value)

  return data(response, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}
