import { ActionFunctionArgs, TypedResponse, json } from '@remix-run/node'
import { z } from 'zod'

import { authSerivce } from '~/services/auth/authService.server'
import { User } from '~/services/auth/userSchemas'

import { Result } from '~/types/Result'

const loginFormValidator = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})
const signupFormValidator = loginFormValidator.extend({
  userName: z.string().min(1, 'Nome de usuário é obrigatório'),
})

type AuthError = {
  type: string | 'email' | 'password' | 'backend' | 'unknown'
  message: string
}

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<TypedResponse<Result<User, AuthError[]>>> => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode')

  if (!mode || (mode !== 'login' && mode !== 'signup'))
    return json({
      ok: false,
      error: [
        {
          type: 'unknown',
          message: 'Invalid mode',
        },
      ],
    })

  const formData = await request.formData()
  const rawForm = Object.fromEntries(formData)

  try {
    let response

    if (mode === 'login') {
      const userInfo = loginFormValidator.safeParse(rawForm)

      if (!userInfo.success) {
        return json({
          ok: false,
          error: userInfo.error.errors.map((e) => ({
            type: e.path.join('.'),
            message: e.message,
          })),
        })
      }

      response = await authSerivce.login(userInfo.data)
    } else if (mode === 'signup') {
      const userInfo = signupFormValidator.safeParse(rawForm)

      if (!userInfo.success) {
        return json({
          ok: false,
          error: userInfo.error.errors.map((e) => ({
            type: e.path.join('.'),
            message: e.message,
          })),
        })
      }

      response = await authSerivce.createUser(userInfo.data)
    } else throw new Error('Unreachable')

    session.set('jwt', response.token)
    session.set('user', response.user)

    return json(
      {
        ok: true,
        value: response.user,
      },
      {
        headers: {
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      },
    )
  } catch (e) {
    console.log('Backend error')
    return json({
      ok: false,
      error: [
        {
          type: 'backend',
          message: 'Something went wrong when authenticating',
        },
      ],
    })
  }
}
