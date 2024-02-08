import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

import schema from './schema/index.server'

const sql = postgres({ max: 1 })

export const db = drizzle(sql, { schema })

migrate(db, { migrationsFolder: './drizzle' })

console.log('db started!')
