import { describe, expect, it } from 'vitest'

import { buildProgram, type Io } from '../src/program'

const run = async (args: string[], overrides: Partial<Io> = {}) => {
  let out = ''
  let err = ''
  const program = buildProgram({
    out: (t) => (out += t),
    err: (t) => (err += t),
    env: {},
    isTTY: false,
    ...overrides
  })
  let error: unknown
  try {
    await program.parseAsync(['node', 'mymultisig', ...args])
  } catch (e) {
    error = e
  }
  return { out, err, error }
}

describe('mymultisig CLI', () => {
  it('lists networks as JSON', async () => {
    const { out, error } = await run(['--json', 'networks'])
    expect(error).toBeUndefined()
    const networks = JSON.parse(out)
    expect(networks.find((n: { chainId: number }) => n.chainId === 11155111).factories[0]).toMatch(/v0\.5\.0/)
  })

  it('prints a human whoami without credentials', async () => {
    const { out } = await run(['whoami'])
    expect(out).toContain('signer: null')
    expect(out).toContain('apiUrl: https://mymultisig.app')
  })

  it('refuses irreversible actions without --yes when not interactive', async () => {
    const { error } = await run(['request', 'cancel', '00000000-0000-4000-8000-000000000000'])
    expect(String((error as Error).message)).toMatch(/--yes/)
  })

  it('rejects malformed private keys', async () => {
    const { error } = await run(['whoami'], { env: { MYMULTISIG_PRIVATE_KEY: 'nope' } })
    expect(String((error as Error).message)).toMatch(/32-byte/)
  })

  it('validates chain ids', async () => {
    const { error } = await run(['wallet', 'get', 'abc', '0x1111111111111111111111111111111111111111'])
    expect(String((error as Error).message)).toMatch(/Invalid chain id/)
  })
})
