// Per-channel isolation is exercised by re-requiring the dispatcher
// under `jest.isolateModules` after `jest.doMock`'ing every dependency
// it touches: the DB (`../db/neon`), each platform's HTTP client
// (`../slack/slackApi`, `../discord/discordApi`, `../telegram/telegramApi`)
// and each platform's crypto module. Mocks are scoped to the
// `describe` block so the file-level tests below (which rely on the
// real null-chainId short circuits) keep working without interference.
//
// `findBoundChannels` builds three Drizzle queries in parallel:
//
//   db.select({...}).from(...).innerJoin(...).where(<sql>)
//
// The DB mock returns a chain whose terminal `.where()` resolves to
// one row set per call; the queue is filled in declaration order
// (slack, discord, telegram) and `shift()`ed as the three `.where()`
// promises resolve in parallel.

const slackPosts: Array<{ channelId: string; token: string }> = []
const discordPosts: Array<{ channelId: string; token: string }> = []
const telegramPosts: Array<{ chatId: number; token: string }> = []
let rowQueue: unknown[][] = []
let badSlackChannel: { id: string; label: string } | null = null
// CORRUPT is the marker the mocked slack crypto + mocked telegram crypto
// reject, so a single test can drive one bad token without rotating the
// real KMS key. Discord uses a different mock here for clarity.
const CORRUPT = 'CORRUPT_TOKEN'

const installMocks = () => {
  jest.resetModules()
  jest.doMock('../db/neon', () => {
    const chain = {
      select: () => chain,
      from: () => chain,
      innerJoin: () => chain,
      // shift() the next row set in declaration order — slack, then
      // discord, then telegram.
      where: () => Promise.resolve(rowQueue.shift() ?? [])
    }
    return { getDb: () => chain }
  })
  jest.doMock('../slack/slackApi', () => ({
    slackApi: jest.fn(async (_method: string, opts: { token: string; json: { channel: string } }) => {
      slackPosts.push({ channelId: opts.json.channel, token: opts.token })
    })
  }))
  jest.doMock('../slack/crypto', () => ({
    decryptToken: (encoded: string) => {
      if (encoded === CORRUPT) throw new Error('decrypt failed: tampered ciphertext')
      return `xoxb-${encoded}`
    },
    encryptToken: (plain: string) => plain
  }))
  jest.doMock('../discord/discordApi', () => ({
    discordApi: jest.fn(async (_path: string, opts: { token: string }) => {
      discordPosts.push({ channelId: opts.token, token: opts.token })
    })
  }))
  jest.doMock('../discord/crypto', () => ({
    decryptToken: (encoded: string) => {
      if (encoded === CORRUPT) throw new Error('decrypt failed: tampered ciphertext')
      return `discord-bot-${encoded}`
    },
    encryptToken: (plain: string) => plain
  }))
  jest.doMock('../telegram/telegramApi', () => ({
    telegramApi: jest.fn(async (_method: string, opts: { token: string; json: { chat_id: number } }) => {
      telegramPosts.push({ chatId: opts.json.chat_id, token: opts.token })
    })
  }))
  jest.doMock('../telegram/crypto', () => ({
    decryptToken: (encoded: string) => {
      if (encoded === CORRUPT) throw new Error('decrypt failed: tampered ciphertext')
      return `tg-${encoded}`
    },
    encryptToken: (plain: string) => plain
  }))
}

import { explorerUrlForChain } from './chains'
import { findBoundChannels, notifyNewRequest, type NewRequestInput } from './dispatcher'

// Pure-logic smoke tests for the dispatcher surface. Heavy DB testing
// is intentionally skipped — the function is exercised end-to-end via
// the curl-based smoke checks in docs/notifications.md. These tests
// cover the parts that don't need a database:
//
//   1. explorerUrlForChain (pure) returns the right URL for known
//      chains and null for unknown / null inputs.
//   2. findBoundChannels with chainId=null short-circuits to all-empty
//      arrays without hitting the database.
//   3. notifyNewRequest with chainId=null logs and returns without
//      calling findBoundChannels or any platform helper.
//   4. (isolateModules) A corrupt key on one Slack channel does not
//      block sibling channels or the other platforms — proves the
//      per-channel lazy decrypt done by postToSlack/postToDiscord/
//      postToTelegram.

const baseInput: NewRequestInput = {
  request: {
    id: '7f3c1b2e-9a4d-4e8b-9c2f-1a2b3c4d5e6f',
    multiSigAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    request: { to: '0xvictim', value: '0', data: '0x', operation: 0 },
    description: 'Test request',
    submitter: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    signatures: [],
    ownerSigners: [],
    dateSubmitted: '2026-07-26T00:00:00Z',
    dateExecuted: '',
    isActive: true,
    isExecuted: false,
    isCancelled: false,
    isConfirmed: false,
    isSuccessful: false
  },
  chainId: 1,
  chainName: 'Mainnet',
  threshold: 2,
  explorerUrl: 'https://etherscan.io'
}

describe('explorerUrlForChain', () => {
  it('returns the etherscan URL for mainnet (chainId 1)', () => {
    expect(explorerUrlForChain(1)).toBe('https://etherscan.io')
  })

  it('returns a polygon URL for chainId 137', () => {
    expect(explorerUrlForChain(137)).toMatch(/polygonscan/)
  })

  it('returns null when chainId is null', () => {
    expect(explorerUrlForChain(null)).toBeNull()
  })

  it('returns null for an unknown chainId', () => {
    expect(explorerUrlForChain(999999)).toBeNull()
  })
})

describe('findBoundChannels (chainId null short-circuit)', () => {
  it('returns all-empty arrays without hitting the database', async () => {
    const channels = await findBoundChannels('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', null)
    expect(channels.slack).toEqual([])
    expect(channels.discord).toEqual([])
    expect(channels.telegram).toEqual([])
  })
})

describe('notifyNewRequest (chainId null short-circuit)', () => {
  it('returns immediately when chainId is null without invoking any send', async () => {
    // Suppress the expected warning so the test output stays clean.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    await expect(
      notifyNewRequest({ ...baseInput, chainId: null, chainName: null, explorerUrl: null })
    ).resolves.toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('chainId missing'))
    warnSpy.mockRestore()
  })
})

describe('notifyNewRequest (per-channel isolation under corrupt decryption key)', () => {
  beforeEach(() => {
    slackPosts.length = 0
    discordPosts.length = 0
    telegramPosts.length = 0
    rowQueue = []
    badSlackChannel = null
  })

  it('one bad Slack token does not block sibling Slack channels or the other platforms', async () => {
    // Slack rows: two bindings, the second carries the bad marker.
    rowQueue = [
      [
        { id: 's1', teamId: 'T1', channelId: 'C-good', channelName: 'alerts', botTokenEncrypted: 'good1' },
        { id: 's2', teamId: 'T1', channelId: 'C-bad', channelName: 'audit', botTokenEncrypted: CORRUPT }
      ],
      // Discord row: one binding.
      [{ id: 'd1', guildId: 'G1', channelId: 'C-discord', channelName: 'treasury', botTokenEncrypted: 'good-d' }],
      // Telegram row: one binding.
      [{ id: 't1', installationId: 'I1', chatId: 42, chatTitle: 'multisig', botTokenEncrypted: 'good-t' }]
    ]
    badSlackChannel = { id: 's2', label: '#audit (T1)' }

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        installMocks()
         
        const { notifyNewRequest: isolatedNotify } = require('./dispatcher')
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
        isolatedNotify(baseInput)
          .then(() => {
            // The good Slack channel got posted to; the bad one did not.
            expect(slackPosts).toEqual([{ channelId: 'C-good', token: 'xoxb-good1' }])
            // Discord and Telegram still post through.
            expect(discordPosts.map((p) => p.token)).toEqual(['discord-bot-good-d'])
            expect(telegramPosts.map((p) => p.chatId)).toEqual([42])
            // Failure log names the platform + channel label.
            const errCalls = errSpy.mock.calls.map((c) => String(c[0]))
            expect(errCalls.some((m) => /slack channel #audit \(T1\) failed/.test(m))).toBe(true)
            // No anonymous "channel post N failed" leftovers.
            expect(errCalls.some((m) => /channel post \d+ failed/.test(m))).toBe(false)
            errSpy.mockRestore()
            resolve()
          })
          .catch(reject)
      })
    })
  })

  it('a bad token on one platform does not kill the other two platforms either', async () => {
    // Slack is fine, Discord has the bad marker, Telegram is fine.
    rowQueue = [
      [{ id: 's1', teamId: 'T1', channelId: 'C-good', channelName: 'alerts', botTokenEncrypted: 'good1' }],
      [{ id: 'd1', guildId: 'G1', channelId: 'C-discord', channelName: 'treasury', botTokenEncrypted: CORRUPT }],
      [{ id: 't1', installationId: 'I1', chatId: 42, chatTitle: 'multisig', botTokenEncrypted: 'good-t' }]
    ]

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        installMocks()
         
        const { notifyNewRequest: isolatedNotify } = require('./dispatcher')
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
        isolatedNotify(baseInput)
          .then(() => {
            // Slack + Telegram both posted through.
            expect(slackPosts.map((p) => p.channelId)).toEqual(['C-good'])
            expect(telegramPosts.map((p) => p.chatId)).toEqual([42])
            // Discord was skipped (its decrypt threw) and not posted to.
            expect(discordPosts).toEqual([])
            const errCalls = errSpy.mock.calls.map((c) => String(c[0]))
            expect(errCalls.some((m) => /discord channel #treasury \(G1\) failed/.test(m))).toBe(true)
            errSpy.mockRestore()
            resolve()
          })
          .catch(reject)
      })
    })
  })

  it('no bindings means no platform send at all', async () => {
    rowQueue = [[], [], []]

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        installMocks()
         
        const { notifyNewRequest: isolatedNotify } = require('./dispatcher')
        isolatedNotify(baseInput).then(() => {
          expect(slackPosts).toEqual([])
          expect(discordPosts).toEqual([])
          expect(telegramPosts).toEqual([])
          resolve()
        }, reject)
      })
    })
  })

  it('BoundChannel carries encrypted token, not decrypted', async () => {
    rowQueue = [
      [{ id: 's1', teamId: 'T1', channelId: 'C-good', channelName: 'alerts', botTokenEncrypted: 'TOKEN_HEX_BLOB' }],
      [],
      []
    ]

    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(() => {
        installMocks()
         
        const { findBoundChannels: isolatedFind } = require('./dispatcher')
        isolatedFind('0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 1).then((channels: any) => {
          // findBoundChannels must NOT call the crypto — the field is
          // carried as-is so a bad key doesn't kill the lookup.
          expect(channels.slack[0].botTokenEncrypted).toBe('TOKEN_HEX_BLOB')
          expect(channels.slack[0]).not.toHaveProperty('botToken')
          resolve()
        }, reject)
      })
    })
  })
})
