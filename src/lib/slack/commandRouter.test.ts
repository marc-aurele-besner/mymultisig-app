import { findChain, resolveUmbrella, routeCommand } from './commandRouter'

// Routing-only tests: none of these paths touch the database or Slack.

const ctx = (command: string, text = '') => ({
  command,
  text,
  teamId: 'T1',
  channelId: 'C1',
  channelName: 'treasury',
  userId: 'U1'
})

describe('resolveUmbrella', () => {
  it('leaves non-umbrella commands untouched', () => {
    expect(resolveUmbrella(ctx('/bind', 'sepolia 0xabc'))).toEqual(ctx('/bind', 'sepolia 0xabc'))
  })

  it('maps `/multisig <sub> <args>` to `/<sub>` with the remaining args', () => {
    const out = resolveUmbrella(ctx('/multisig', '  Bind   sepolia 0xabc '))
    expect(out.command).toBe('/bind')
    expect(out.text).toBe('sepolia 0xabc')
    expect(out.channelId).toBe('C1')
  })

  it('accepts a leading slash on the subcommand', () => {
    expect(resolveUmbrella(ctx('/multisig', '/unbind 1 0xabc')).command).toBe('/unbind')
  })

  it('maps a bare `/multisig` to help', () => {
    expect(resolveUmbrella(ctx('/multisig', '   ')).command).toBe('/help')
  })
})

describe('findChain', () => {
  it.each([
    ['mainnet', 1],
    ['ETH', 1],
    ['1', 1],
    ['sepolia', 11155111],
    ['optimism', 10],
    ['arbitrum', 42161],
    ['bsc', 56],
    ['polygon-mumbai', 80001],
    ['gnosis', 100]
  ])('resolves %s to chain %i', (input, id) => {
    expect(findChain(input)?.id).toBe(id)
  })

  it('returns null for unknown chains and unsupported ids', () => {
    expect(findChain('notachain')).toBeNull()
    expect(findChain('8453')).toBeNull()
    expect(findChain('')).toBeNull()
  })
})

describe('routeCommand', () => {
  it('answers `/multisig help` with the command list', async () => {
    const res = await routeCommand(ctx('/multisig', 'help'))
    expect(res.response_type).toBe('ephemeral')
    expect(JSON.stringify(res)).toContain('/bind <chain> <multisig>')
  })

  it('points unknown subcommands at `/multisig help`', async () => {
    const res = await routeCommand(ctx('/multisig', 'frobnicate'))
    expect(res.text).toContain('/frobnicate')
    expect(res.text).toContain('/multisig help')
  })

  it('returns a deep link for /sign instead of a coming-soon stub', async () => {
    const res = await routeCommand(ctx('/sign', '7f3c1b2e-9a4d-4e8b-9c2f-1a2b3c4d5e6f'))
    const flat = JSON.stringify(res)
    expect(flat).toContain('/request/7f3c1b2e-9a4d-4e8b-9c2f-1a2b3c4d5e6f')
    expect(flat).not.toMatch(/coming/i)
  })

  it('validates /bind arguments before touching the database', async () => {
    const res = await routeCommand(ctx('/bind', 'notachain 0xd8da6bf26964af9d7eed9e03e53415d37aa96045'))
    expect(res.text).toContain('Unknown chain')
  })
})
