import { createInterface } from 'node:readline/promises'
import { Command, Option } from 'commander'
import { parseEther, type Hex } from 'viem'
import {
  API_KEY_SCOPES,
  DEFAULT_API_URL,
  KNOWN_FACTORIES,
  SUPPORTED_CHAINS,
  MyMultiSigClient,
  type ApiKeyScope,
  type WalletType
} from 'mymultisig-sdk'

type GlobalOptions = { apiUrl?: string; json?: boolean; rpc?: string[]; yes?: boolean }

export type Io = {
  out: (text: string) => void
  err: (text: string) => void
  env: NodeJS.ProcessEnv
  isTTY: boolean
  confirm?: (question: string) => Promise<boolean>
}

const replacer = (_key: string, value: unknown) => (typeof value === 'bigint' ? value.toString() : value)

// Human output: a flat "key: value" rendering that stays greppable; nested
// values fall back to compact JSON. --json prints the raw result instead.
const formatHuman = (value: unknown, indent = ''): string => {
  if (value == null || typeof value !== 'object') return `${indent}${String(value)}`
  if (Array.isArray(value)) {
    if (value.length === 0) return `${indent}(none)`
    return value.map((item) => (typeof item === 'object' ? formatHuman(item, indent + '  ') + '\n' : `${indent}- ${item}`)).join('\n')
  }
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) =>
      v != null && typeof v === 'object'
        ? `${indent}${k}:\n${formatHuman(v, indent + '  ')}`
        : `${indent}${k}: ${typeof v === 'bigint' ? v.toString() : String(v)}`
    )
    .join('\n')
}

const collect = (value: string, previous: string[] = []) => [...previous, value]

const parseChainId = (value: string) => {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid chain id: ${value}`)
  return n
}

export const buildProgram = (io: Io) => {
  const program = new Command()
    .name('mymultisig')
    .description(
      'Create, inspect, propose, sign and execute MyMultiSig wallet transactions.\n\n' +
        'Credentials come from the environment:\n' +
        '  MYMULTISIG_PRIVATE_KEY   your (or your agent’s) owner key; signs locally, never uploaded\n' +
        '  MYMULTISIG_API_KEY       mms_… key from https://mymultisig.app/settings/agents\n' +
        '  MYMULTISIG_RPC_URL_<id>  RPC per chain id (default: the chain’s public RPC)'
    )
    .option('--api-url <url>', 'mymultisig.app API base URL', io.env.MYMULTISIG_API_URL ?? DEFAULT_API_URL)
    .option('--json', 'machine-readable JSON output (for scripts and agents)')
    .option('--rpc <chainId=url>', 'RPC URL for a chain (repeatable)', collect)
    .option('-y, --yes', 'skip confirmation prompts')
    .configureOutput({ writeOut: io.out, writeErr: io.err })
    .exitOverride()

  const globals = () => program.opts<GlobalOptions>()

  const client = () => {
    const opts = globals()
    const rpcUrls: Record<number, string> = {}
    for (const [name, value] of Object.entries(io.env)) {
      const match = /^MYMULTISIG_RPC_URL_(\d+)$/.exec(name)
      if (match && value) rpcUrls[Number(match[1])] = value
    }
    for (const pair of opts.rpc ?? []) {
      const [id, ...url] = pair.split('=')
      rpcUrls[parseChainId(id)] = url.join('=')
    }
    const privateKey = io.env.MYMULTISIG_PRIVATE_KEY?.trim()
    if (privateKey && !/^0x[0-9a-fA-F]{64}$/.test(privateKey))
      throw new Error('MYMULTISIG_PRIVATE_KEY must be a 0x-prefixed 32-byte hex string')
    return new MyMultiSigClient({
      apiUrl: opts.apiUrl,
      apiKey: io.env.MYMULTISIG_API_KEY?.trim() || undefined,
      privateKey: (privateKey || undefined) as Hex | undefined,
      rpcUrls
    })
  }

  const print = (value: unknown) => {
    if (globals().json) io.out(JSON.stringify(value, replacer, 2) + '\n')
    else io.out(formatHuman(value) + '\n')
  }

  // Irreversible or on-chain actions need --yes, or an interactive "y".
  const confirm = async (question: string) => {
    if (globals().yes) return
    if (!io.isTTY || io.confirm == null) throw new Error(`${question} Re-run with --yes to confirm.`)
    if (!(await io.confirm(`${question} [y/N] `))) throw new Error('Aborted.')
  }

  program
    .command('networks')
    .description('List supported chains and official factories')
    .action(() =>
      print(
        SUPPORTED_CHAINS.map((c) => ({
          chainId: c.id,
          name: c.name,
          factories: KNOWN_FACTORIES.filter((f) => f.chainId === c.id).map((f) => `${f.address} (v${f.version})`)
        }))
      )
    )

  program
    .command('whoami')
    .description('Show the signer address and API key identity in use')
    .action(async () => {
      const c = client()
      print({
        signer: c.address ?? null,
        apiKey: c.api.hasApiKey ? await c.api.whoami() : null,
        apiUrl: c.apiUrl
      })
    })

  // --- wallets ----------------------------------------------------------------

  const wallet = program.command('wallet').description('Multisig wallets')

  wallet
    .command('get')
    .description('Read a wallet’s live on-chain state')
    .argument('<chainId>', 'chain id', parseChainId)
    .argument('<address>', 'wallet address')
    .action(async (chainId: number, address: string) => print(await client().getWallet(chainId, address)))

  wallet
    .command('list')
    .description('Wallets registered on mymultisig.app for an owner')
    .option('--owner <address>', 'defaults to the API key owner or the signer')
    .action(async (opts: { owner?: string }) => print(await client().listMyWallets(opts.owner)))

  wallet
    .command('create')
    .description('Deploy a new wallet from the official factory (your key pays gas)')
    .requiredOption('--chain <chainId>', 'chain id', parseChainId)
    .requiredOption('--name <name>', 'wallet name')
    .requiredOption('--owner <address>', 'owner address (repeatable)', collect)
    .requiredOption('--threshold <n>', 'signatures required', (v) => Number(v))
    .addOption(new Option('--type <type>', 'wallet type').choices(['simple', 'extended', 'advanced']).default('simple'))
    .option('--only-owner-request', 'extended/advanced: only owners may queue requests')
    .option('--salt <bytes32>', 'CREATE2 salt for a deterministic address (0.5.0 factories)')
    .option('--factory <address>', 'factory address (defaults to the official one)')
    .action(
      async (opts: {
        chain: number
        name: string
        owner: string[]
        threshold: number
        type: WalletType
        onlyOwnerRequest?: boolean
        salt?: Hex
        factory?: string
      }) => {
        await confirm(
          `Deploy "${opts.name}" (${opts.threshold}-of-${opts.owner.length}, ${opts.type}) on chain ${opts.chain}?`
        )
        print(
          await client().createWallet({
            chainId: opts.chain,
            name: opts.name,
            owners: opts.owner,
            threshold: opts.threshold,
            walletType: opts.type,
            onlyOwnerRequest: opts.onlyOwnerRequest,
            salt: opts.salt,
            factory: opts.factory
          })
        )
      }
    )

  // --- requests ---------------------------------------------------------------

  const request = program.command('request').description('Queued transaction requests')

  request
    .command('list')
    .description('Active requests for a wallet, in execution order')
    .argument('<chainId>', 'chain id', parseChainId)
    .argument('<wallet>', 'wallet address')
    .action(async (chainId: number, walletAddress: string) => print(await client().listRequests(chainId, walletAddress)))

  request
    .command('show')
    .description('Decode a request and verify its signatures')
    .argument('<chainId>', 'chain id', parseChainId)
    .argument('<requestId>', 'request id')
    .action(async (chainId: number, id: string) => print(await client().getRequestStatus(chainId, id)))

  request
    .command('propose')
    .description('Queue a transaction (signed by your key when it is an owner)')
    .requiredOption('--chain <chainId>', 'chain id', parseChainId)
    .requiredOption('--wallet <address>', 'multisig address')
    .requiredOption('--to <address>', 'destination')
    .requiredOption('--description <text>', 'purpose, shown to the other owners')
    .option('--value <wei>', 'native value in wei')
    .option('--value-ether <amount>', 'native value in ether units')
    .option('--data <hex>', 'calldata', '0x')
    .option('--gas <n>', 'gas forwarded to the inner call (estimated by default)')
    .option('--nonce <n>', 'extended wallets: pin to an explicit nonce')
    .option('--valid-until <unix>', '0.5.0 wallets: signature expiry (unix seconds)')
    .option('--no-sign', 'queue without your signature')
    .action(
      async (opts: {
        chain: number
        wallet: string
        to: string
        description: string
        value?: string
        valueEther?: string
        data: Hex
        gas?: string
        nonce?: string
        validUntil?: string
        sign: boolean
      }) => {
        if (opts.value != null && opts.valueEther != null) throw new Error('Pass --value or --value-ether, not both')
        print(
          await client().proposeTransaction({
            chainId: opts.chain,
            wallet: opts.wallet,
            to: opts.to,
            value: opts.valueEther != null ? parseEther(opts.valueEther).toString() : opts.value,
            data: opts.data,
            description: opts.description,
            txnGas: opts.gas,
            txnNonce: opts.nonce,
            validUntil: opts.validUntil,
            sign: opts.sign
          })
        )
      }
    )

  request
    .command('approve')
    .description('Sign a queued request with your key')
    .argument('<chainId>', 'chain id', parseChainId)
    .argument('<requestId>', 'request id')
    .action(async (chainId: number, id: string) => {
      const c = client()
      const status = await c.getRequestStatus(chainId, id)
      if (!globals().json) io.err(`${status.decoded.summary}\n${status.decoded.warnings.map((w) => `! ${w}`).join('\n')}\n`)
      await confirm(`Sign request ${id}?`)
      print(await c.approveRequest(chainId, id))
    })

  request
    .command('execute')
    .description('Execute a request that reached its threshold (your key pays gas)')
    .argument('<chainId>', 'chain id', parseChainId)
    .argument('<requestId>', 'request id')
    .action(async (chainId: number, id: string) => {
      const c = client()
      const status = await c.getRequestStatus(chainId, id)
      if (!globals().json) io.err(`${status.decoded.summary}\n${status.decoded.warnings.map((w) => `! ${w}`).join('\n')}\n`)
      await confirm(`Execute request ${id} on chain ${chainId}? This is irreversible.`)
      print(await c.executeRequest(chainId, id))
    })

  request
    .command('cancel')
    .description('Cancel a request (later requests are invalidated too)')
    .argument('<requestId>', 'request id')
    .action(async (id: string) => {
      await confirm(`Cancel request ${id}?`)
      print(await client().cancelRequest(id))
    })

  request
    .command('reset')
    .description('Wipe a request’s signatures (later requests are invalidated too)')
    .argument('<requestId>', 'request id')
    .action(async (id: string) => {
      await confirm(`Reset signatures on request ${id}?`)
      print(await client().resetRequest(id))
    })

  // --- API keys (signs in with MYMULTISIG_PRIVATE_KEY via SIWE) --------------

  const keys = program.command('keys').description('Agent API keys (requires MYMULTISIG_PRIVATE_KEY to sign in)')

  const sessionClient = async () => {
    const c = client()
    if (c.account == null) throw new Error('Managing API keys needs MYMULTISIG_PRIVATE_KEY to sign in with SIWE.')
    await c.api.siweLogin(c.account)
    return c
  }

  keys
    .command('list')
    .description('List your API keys')
    .action(async () => print(await (await sessionClient()).api.listApiKeys()))

  keys
    .command('create')
    .description('Mint a new API key acting as your address')
    .requiredOption('--name <name>', 'label for the key')
    .addOption(
      new Option('--scope <scope>', 'scope (repeatable)')
        .choices([...API_KEY_SCOPES])
        .argParser((value: string, previous: string[] = []) => [...previous, value])
    )
    .option('--wallet <address>', 'restrict to this multisig (repeatable)', collect)
    .option('--expires-in-days <n>', 'expiry in days (default: never)', (v) => Number(v))
    .action(async (opts: { name: string; scope?: ApiKeyScope[]; wallet?: string[]; expiresInDays?: number }) => {
      const c = await sessionClient()
      const result = await c.api.createApiKey({
        name: opts.name,
        scopes: opts.scope ?? ['read'],
        walletAddresses: opts.wallet,
        expiresInDays: opts.expiresInDays ?? null
      })
      print(result)
      if (!globals().json) io.err('Store this key now: it is not shown again.\n')
    })

  keys
    .command('revoke')
    .description('Revoke an API key')
    .argument('<id>', 'key id')
    .action(async (id: string) => {
      await confirm(`Revoke API key ${id}?`)
      print(await (await sessionClient()).api.revokeApiKey(id))
    })

  return program
}

export const ttyConfirm = async (question: string) => {
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  try {
    return /^y(es)?$/i.test((await rl.question(question)).trim())
  } finally {
    rl.close()
  }
}
