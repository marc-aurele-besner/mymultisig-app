import { NextApiRequest } from 'next'

// NOTE: callers MUST set `export const config = { api: { bodyParser: false } }`
// on the route. When bodyParser is disabled, `req.body` is `null` (not a
// string buffer) — do not pass these requests through `parseBody` from
// `src/lib/api/middleware.ts`, which expects a parsed shape. Cookie-based
// middleware (`withSession`, `withVerifiedAs`) is unaffected because it
// reads `req.cookies`, not `req.body`.
//
// 1 MiB matches Next.js's default bodyParser sizeLimit. Discord
// interactions (slash command bodies, component payloads) are well under
// 64 KiB in practice; the cap is a runaway-client / OOM guard, not a real
// product constraint. Mirrors src/lib/slack/rawBody.ts.
const MAX_BODY_BYTES = 1024 * 1024

export const readRawBody = (req: NextApiRequest): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let total = 0
    req.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total > MAX_BODY_BYTES) {
        // 413 Payload Too Large would be the right code, but we can't
        // respond from inside the stream listener without unhandled
        // exception warnings. Destroying the request is enough; the
        // route's outer catch surfaces the error.
        req.destroy(new Error('Discord request body exceeds 1 MiB limit'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
