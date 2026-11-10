import { DEFAULT_API_URL, type MyMultiSigClientOptions } from 'mymultisig-sdk'

export type ServerConfig = {
  client: MyMultiSigClientOptions
  readOnly: boolean
}

const truthy = (value: string | undefined) => value != null && /^(1|true|yes|on)$/i.test(value.trim())

// Everything comes from the environment so the server can be dropped into any
// MCP client config (Claude Code, Claude Desktop, Cursor, …):
//
//   MYMULTISIG_PRIVATE_KEY   the agent's own owner key (0x + 64 hex). Enables
//                            signing approvals, executing and creating wallets.
//                            Used locally only; never sent to any server.
//   MYMULTISIG_API_KEY       mms_… key from https://mymultisig.app/settings/agents
//   MYMULTISIG_API_URL       defaults to https://mymultisig.app
//   MYMULTISIG_RPC_URL_<id>  RPC per chain id, e.g. MYMULTISIG_RPC_URL_11155111
//   MYMULTISIG_CHAINS        comma-separated chain id allowlist, e.g. 11155111
//   MYMULTISIG_READ_ONLY     1 = register read tools only
//
// The Claude Code plugin passes its userConfig options as
// CLAUDE_PLUGIN_OPTION_<KEY> (API_KEY, PRIVATE_KEY, CHAINS, READ_ONLY), the
// names the Claude plugin directory expects; MYMULTISIG_* wins when both are set.
const PLUGIN_OPTION_PREFIX = 'CLAUDE_PLUGIN_OPTION_'

export const loadConfig = (rawEnv: NodeJS.ProcessEnv = process.env): ServerConfig => {
  const env: NodeJS.ProcessEnv = { ...rawEnv }
  for (const name of ['API_KEY', 'PRIVATE_KEY', 'CHAINS', 'READ_ONLY']) {
    const own = env[`MYMULTISIG_${name}`]
    if (!own?.trim()) env[`MYMULTISIG_${name}`] = env[`${PLUGIN_OPTION_PREFIX}${name}`]
  }
  const privateKey = env.MYMULTISIG_PRIVATE_KEY?.trim()
  if (privateKey && !/^0x[0-9a-fA-F]{64}$/.test(privateKey))
    throw new Error('MYMULTISIG_PRIVATE_KEY must be a 0x-prefixed 32-byte hex string')
  const rpcUrls: Record<number, string> = {}
  for (const [name, value] of Object.entries(env)) {
    const match = /^MYMULTISIG_RPC_URL_(\d+)$/.exec(name)
    if (match && value) rpcUrls[Number(match[1])] = value
  }
  const chains = env.MYMULTISIG_CHAINS?.split(',')
    .map((c) => Number(c.trim()))
    .filter((c) => Number.isInteger(c) && c > 0)
  return {
    client: {
      apiUrl: env.MYMULTISIG_API_URL?.trim() || DEFAULT_API_URL,
      apiKey: env.MYMULTISIG_API_KEY?.trim() || undefined,
      privateKey: (privateKey || undefined) as `0x${string}` | undefined,
      rpcUrls,
      allowedChainIds: chains && chains.length > 0 ? chains : undefined
    },
    readOnly: truthy(env.MYMULTISIG_READ_ONLY)
  }
}
