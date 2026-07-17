import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'

// Drizzle-typed wrapper around the Neon HTTP driver. The connection is
// lazy so the module loads even when DATABASE_URL isn't set (builds, type
// checking). `db` exposes the typed query builder; the underlying raw
// `sql` client is no longer re-exported because every API route now talks
// to the database through drizzle.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set')
    }
    _db = drizzle(neon(connectionString), { schema })
  }
  return _db
}
