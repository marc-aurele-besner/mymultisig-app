// Pure rules for "is this tab running an old deployment?". No DOM, no fetch,
// so they can run in jest and in the API route alike.

// Bump in the same commit as a change that breaks already-open tabs (an API
// contract, a storage format). Any tab built before this time is forced to
// reload. Epoch milliseconds; 0 disables it.
export const MIN_CLIENT_BUILT_AT = 0

// A tab that has been behind a deployment for longer than this is forced to
// reload, so an old tab left open for days does not keep running old code.
export const STALE_REQUIRED_AFTER_MS = 24 * 60 * 60 * 1000

// After a reload we remember when it happened. Automatic reloads inside this
// window are skipped, which prevents a loop when the CDN keeps serving old HTML.
export const RELOAD_COOLDOWN_MS = 30 * 1000

export const MESSAGE_KEYS = ['security', 'fix', 'breaking'] as const
export type MessageKey = (typeof MESSAGE_KEYS)[number]

export type VersionInfo = {
  buildId: string
  builtAt: number
  forceBefore: number | null
  message: MessageKey | null
}

export type ClientVersion = { buildId: string; builtAt: number }

export type UpdateState =
  { kind: 'current' } | { kind: 'available' } | { kind: 'required'; reason: 'policy' | 'age' | 'error' }

// Accepts epoch milliseconds ("1793740000000") or an ISO date string.
export function parseForceBefore(raw: string | undefined | null): number | null {
  const value = raw?.trim()
  if (!value) return null
  if (/^\d+$/.test(value)) return Number(value)
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

// Unknown message keys are ignored rather than shown.
export function parseMessageKey(raw: string | undefined | null): MessageKey | null {
  const value = raw?.trim().toLowerCase()
  return MESSAGE_KEYS.find((key) => key === value) ?? null
}

// The effective floor is the larger of the env lever and the code constant.
export function resolveForceBefore(envRaw: string | undefined | null, minBuiltAt = MIN_CLIENT_BUILT_AT): number | null {
  const fromEnv = parseForceBefore(envRaw)
  if (fromEnv === null && minBuiltAt <= 0) return null
  return Math.max(fromEnv ?? 0, minBuiltAt)
}

export function updateState(client: ClientVersion, server: VersionInfo, now: number): UpdateState {
  if (server.buildId === client.buildId) return { kind: 'current' }
  // Without a usable build time (local dev) the two builds cannot be ordered.
  if (!Number.isFinite(client.builtAt) || client.builtAt <= 0) return { kind: 'current' }
  // A slower edge or a rollback in progress answered with an older build.
  // Never "update" backwards; real rollbacks are handled by forceBefore.
  if (server.builtAt < client.builtAt) return { kind: 'current' }
  if (server.forceBefore !== null && client.builtAt < server.forceBefore) {
    return { kind: 'required', reason: 'policy' }
  }
  if (now - server.builtAt > STALE_REQUIRED_AFTER_MS) return { kind: 'required', reason: 'age' }
  return { kind: 'available' }
}

// A failed chunk or server action is a hint that the tab runs an old build.
// It is not proof: a flaky network can produce the same messages, so the
// caller must still confirm against /api/build-id before forcing anything.
const STALE_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module|Importing a module script failed|Server Action .* was not found|UnrecognizedActionError/i

export function isStaleDeploymentMessage(message: string): boolean {
  return STALE_ERROR_PATTERN.test(message)
}

// A failed check during an error means the tab may still be current; only
// escalate to "required" when the server really has a different build.
export function escalateOnError(state: UpdateState): UpdateState {
  return state.kind === 'available' ? { kind: 'required', reason: 'error' } : state
}

export function canAutoReload(lastReloadAt: number | null, now: number): boolean {
  return lastReloadAt === null || now - lastReloadAt > RELOAD_COOLDOWN_MS
}
