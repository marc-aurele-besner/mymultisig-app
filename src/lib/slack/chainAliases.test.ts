import networks from '../../constants/networks'
import { bindCommandFor, chainAliasFor } from './chainAliases'
import { findChain } from './commandRouter'

describe('chainAliasFor', () => {
  it('returns the readable name for known chains', () => {
    expect(chainAliasFor(1)).toBe('mainnet')
    expect(chainAliasFor(11155111)).toBe('sepolia')
    expect(chainAliasFor(10)).toBe('optimism')
    expect(chainAliasFor(80001)).toBe('mumbai')
  })

  it('falls back to the numeric id', () => {
    expect(chainAliasFor(424242)).toBe('424242')
  })

  // The settings page prefills /bind with chainAliasFor; the bot parses it
  // with findChain. Every supported network must survive the round trip.
  it.each(networks.map((c) => [c.name, c.id] as const))('%s round-trips through findChain', (_name, id) => {
    expect(findChain(chainAliasFor(id))?.id).toBe(id)
  })
})

describe('bindCommandFor', () => {
  it('builds the exact command to paste', () => {
    expect(bindCommandFor(11155111, '0xabc')).toBe('/bind sepolia 0xabc')
  })
})
