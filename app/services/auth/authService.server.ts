import { Result } from '~/types/Result'

import { db } from '../db/index.server'
import { user as userTable } from '../db/schema.server'

import { encryptPassword, verifyPassword } from '~/lib/hashing.server'

import {
  type LoginUser,
  type CreateUser,
  type User,
  userSchema,
} from './userSchemas'

type AuthResponse = Result<User>

class AuthService {
  async login(userInfo: LoginUser): Promise<AuthResponse> {
    const dbUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, userInfo.email),
    })

    if (!dbUser)
      return {
        ok: false,
        error: 'User not found',
      }

    const passwordMatches = await verifyPassword(
      userInfo.password,
      dbUser.password,
    )

    if (!passwordMatches)
      return {
        ok: false,
        error: 'Password is incorrect',
      }

    return {
      ok: true,
      value: userSchema.parse(dbUser), // removes the password
    }
  }

  async createUser(userInfo: CreateUser): Promise<AuthResponse> {
    const existingUser = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, userInfo.email),
    })

    if (existingUser) {
      return {
        ok: false,
        error: 'User already exists',
      }
    }

    const encryptedPassword = await encryptPassword(userInfo.password)

    const [user] = await db
      .insert(userTable)
      .values({
        userName: userInfo.userName,
        email: userInfo.email,
        password: encryptedPassword,
      })
      .returning()

    return {
      ok: true,
      value: userSchema.parse(user), // removes the password
    }
  }
}

export const authSerivce = new AuthService()
