import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from './env'
import * as schema from './schema'

/**
 * One pooled client per Node process.
 * `prepare: false` is required for some pooled hosts; harmless for local Postgres.
 */
const client = postgres(env.databaseUrl, { max: 8, prepare: false })

export const db = drizzle(client, { schema })
export const sqlClient = client
