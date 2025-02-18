import { createCookieSessionStorage } from 'react-router';

import { DomainUser } from '../auth/authService.server'

const cookieSecret = process.env.COOKIE_SECRET

if (!cookieSecret) {
  throw new Error('COOKIE_SECRET should be present in .env file')
}

export type SessionData = {
  user: DomainUser
}

export const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: false,
    secrets: [cookieSecret],
    secure: process.env.NODE_ENV === 'production',
  },
})
