import {
  STALE_REQUIRED_AFTER_MS,
  RELOAD_COOLDOWN_MS,
  canAutoReload,
  escalateOnError,
  isStaleDeploymentMessage,
  parseForceBefore,
  parseMessageKey,
  resolveForceBefore,
  updateState
} from './policy'

const HOUR = 60 * 60 * 1000
const NOW = Date.UTC(2026, 10, 9, 12)
const OLD = { buildId: 'old', builtAt: NOW - 2 * HOUR }
const NEW_BUILT_AT = NOW - HOUR
const server = (overrides: Partial<Parameters<typeof updateState>[1]> = {}) => ({
  buildId: 'new',
  builtAt: NEW_BUILT_AT,
  forceBefore: null,
  message: null,
  ...overrides
})

describe('updateState', () => {
  it('is current when the build ids match', () => {
    expect(updateState(OLD, server({ buildId: 'old' }), NOW)).toEqual({ kind: 'current' })
  })

  it('asks for an update when a newer build is live', () => {
    expect(updateState(OLD, server(), NOW)).toEqual({ kind: 'available' })
  })

  it('never updates backwards to an older build', () => {
    expect(updateState(OLD, server({ builtAt: OLD.builtAt - 1 }), NOW)).toEqual({ kind: 'current' })
  })

  it('is current when the client build time is unknown (local dev)', () => {
    expect(updateState({ buildId: 'dev', builtAt: 0 }, server(), NOW)).toEqual({ kind: 'current' })
  })

  it('forces a reload for tabs built before forceBefore', () => {
    expect(updateState(OLD, server({ forceBefore: NOW - HOUR }), NOW)).toEqual({
      kind: 'required',
      reason: 'policy'
    })
  })

  it('does not force tabs built after forceBefore', () => {
    expect(updateState(OLD, server({ forceBefore: OLD.builtAt - 1 }), NOW)).toEqual({ kind: 'available' })
  })

  it('forces a reload once the update has been live for more than 24 h', () => {
    const stale = server({ builtAt: NOW - STALE_REQUIRED_AFTER_MS - 1, forceBefore: null })
    expect(updateState({ buildId: 'older', builtAt: stale.builtAt - HOUR }, stale, NOW)).toEqual({
      kind: 'required',
      reason: 'age'
    })
  })

  it('stays available just under 24 h', () => {
    const fresh = server({ builtAt: NOW - STALE_REQUIRED_AFTER_MS + 1000 })
    expect(updateState({ buildId: 'older', builtAt: fresh.builtAt - HOUR }, fresh, NOW)).toEqual({
      kind: 'available'
    })
  })
})

describe('parseForceBefore', () => {
  it('reads epoch milliseconds and ISO dates', () => {
    expect(parseForceBefore('1793740000000')).toBe(1793740000000)
    expect(parseForceBefore('2026-11-09T00:00:00Z')).toBe(Date.UTC(2026, 10, 9))
  })

  it('returns null for empty or invalid values', () => {
    expect(parseForceBefore(undefined)).toBeNull()
    expect(parseForceBefore('  ')).toBeNull()
    expect(parseForceBefore('not a date')).toBeNull()
  })
})

describe('resolveForceBefore', () => {
  it('takes the larger of the env lever and the code constant', () => {
    expect(resolveForceBefore('1000', 500)).toBe(1000)
    expect(resolveForceBefore('100', 500)).toBe(500)
    expect(resolveForceBefore(undefined, 500)).toBe(500)
  })

  it('is null when nothing is set', () => {
    expect(resolveForceBefore(undefined, 0)).toBeNull()
  })
})

describe('parseMessageKey', () => {
  it('accepts known keys and ignores the rest', () => {
    expect(parseMessageKey('Security')).toBe('security')
    expect(parseMessageKey('fix')).toBe('fix')
    expect(parseMessageKey('whatever')).toBeNull()
  })
})

describe('isStaleDeploymentMessage', () => {
  it('recognises chunk and server action failures', () => {
    expect(isStaleDeploymentMessage('ChunkLoadError: Loading chunk 123 failed.')).toBe(true)
    expect(isStaleDeploymentMessage('Failed to fetch dynamically imported module: /_next/x.js')).toBe(true)
    expect(isStaleDeploymentMessage('Server Action "abc" was not found on the server.')).toBe(true)
  })

  it('ignores unrelated errors', () => {
    expect(isStaleDeploymentMessage('Cannot read properties of undefined')).toBe(false)
    expect(isStaleDeploymentMessage('Network request failed')).toBe(false)
  })
})

describe('escalateOnError', () => {
  it('escalates only an available update', () => {
    expect(escalateOnError({ kind: 'available' })).toEqual({ kind: 'required', reason: 'error' })
    expect(escalateOnError({ kind: 'current' })).toEqual({ kind: 'current' })
  })
})

describe('canAutoReload', () => {
  it('allows the first reload and reloads after the cooldown', () => {
    expect(canAutoReload(null, NOW)).toBe(true)
    expect(canAutoReload(NOW - RELOAD_COOLDOWN_MS - 1, NOW)).toBe(true)
  })

  it('blocks a second automatic reload inside the cooldown', () => {
    expect(canAutoReload(NOW - 5000, NOW)).toBe(false)
  })
})
