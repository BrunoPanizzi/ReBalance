import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import {
  user,
  userRelations,
  wallet,
  walletRelations,
  stock,
  stockRelations,
  feedback,
} from './schema.server'

const sql = postgres({ max: 1 })

const schema = {
  user,
  userRelations,
  wallet,
  walletRelations,
  stock,
  stockRelations,
  feedback,
}

export const db = drizzle(sql, { schema })

migrate(db, { migrationsFolder: './drizzle' })

console.log('db started!')
