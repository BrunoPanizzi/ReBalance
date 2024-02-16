import { Result } from '~/types/Result'

import { db } from '../db/index.server'
import { user as userTable, User } from '../db/schema/user.server'

import { encryptPassword, verifyPassword } from '~/lib/hashing.server'

type PersistanceUser = User

export type DomainUser = Omit<PersistanceUser, 'password'>
export type NewUser = Omit<PersistanceUser, 'uid'>
export type LoginUser = Omit<NewUser, 'userName'>

type AuthResponse = Result<DomainUser>

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
