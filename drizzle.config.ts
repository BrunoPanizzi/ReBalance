import 'dotenv/config'

import { type Config } from 'drizzle-kit'

const host = process.env.PGHOST
const database = process.env.PGDATABASE

if (!host || !database) {
  throw new Error('PGHOST and PGDATABASE must be set in .env files')
}

export default {
  schema: './app/services/db/schema/index.server.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host,
    port: Number(process.env.PGPORT),
    database,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
  },
} satisfies Config
