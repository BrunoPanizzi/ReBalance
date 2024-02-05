import { Result } from '~/types/Result'

import { db } from '../db/index.server'
import {
  user as userTable,
  NewUser,
  User,
  userSchema,
} from '../db/schema/user.server'

import { encryptPassword, verifyPassword } from '~/lib/hashing.server'

type AuthResponse = Result<Omit<User, 'password'>>

class AuthService {
  async login(userInfo: Omit<NewUser, 'userName'>): Promise<AuthResponse> {
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
      value: {
        email: dbUser.email,
        userName: dbUser.userName,
        uid: dbUser.uid,
      }, // removes the password
    }
  }

  async createUser(userInfo: NewUser): Promise<AuthResponse> {
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
      value: {
        email: user.email,
        userName: user.userName,
        uid: user.uid,
      }, // removes the password
    }
  }
}

export const authSerivce = new AuthService()
