import { NextApiRequest } from 'next'

// NOTE: callers MUST set `export const config = { api: { bodyParser: false } }`
// on the route. When bodyParser is disabled, `req.body` is `null` (not a
// string buffer) — do not pass these requests through `parseBody` from
// `src/lib/api/middleware.ts`, which expects a parsed shape. Cookie-based
// middleware (`withSession`, `withVerifiedAs`) is unaffected because it
// reads `req.cookies`, not `req.body`.

export const readRawBody = (req: NextApiRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
