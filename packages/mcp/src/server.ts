import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { encodeFunctionData, parseAbi, parseEther, type Abi, type Hex } from 'viem'
import {
  KNOWN_FACTORIES,
  SUPPORTED_CHAINS,
  describeCall,
  type MyMultiSigClient
} from 'mymultisig-sdk'

import { assertCosignedByAnotherOwner, assertWalletNeedsAnotherOwner } from './guard'

// MCP surface over MyMultiSigClient. Read tools are always registered; write
// tools only when the server isn't read-only, and each one refuses early
// with a clear message when the credentials it needs are missing.

export const SERVER_INSTRUCTIONS = `MyMultiSig is a multi-signature smart-contract wallet (mymultisig.app).
A wallet has owners and a threshold; a transaction runs only once threshold owners signed it.
Flow: propose_transaction queues a request (signed by this agent when it holds an owner key) ->
other owners approve (in the app, or approve_request) -> execute_request once signatures >= threshold.
Always call get_request and show the decoded summary + warnings to the user before approve_request or
execute_request, and get explicit confirmation for anything that moves funds or changes owners/threshold.
execute_request refuses until an owner other than this agent has approved, and create_multisig refuses a
wallet this agent could operate alone (threshold 1 with the agent as owner).
Amounts are in wei unless a tool says otherwise. Chain ids: Ethereum 1, Sepolia 11155111, Polygon 137, ...
(see list_networks).`

const json = (value: unknown) => ({
  content: [
    {
      type: 'text' as const,
      text: JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
    }
  ]
})

const fail = (error: unknown) => ({
  isError: true,
  content: [{ type: 'text' as const, text: error instanceof Error ? error.message : String(error) }]
})

const run = async (fn: () => Promise<unknown>) => {
  try {
    return json(await fn())
  } catch (error) {
    return fail(error)
  }
}

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'must be a 0x-prefixed 20-byte address')
const chainId = z.number().int().positive().describe('EVM chain id, e.g. 11155111 for Sepolia (see list_networks)')
const wei = z.string().regex(/^\d+$/, 'decimal string in wei')
const hex = z.string().regex(/^0x([0-9a-fA-F]{2})*$/, '0x-prefixed hex bytes')
const walletType = z
  .enum(['simple', 'extended', 'advanced'])
  .describe('simple = MyMultiSig; extended/advanced = MyMultiSigExtended (owner-only requests, ERC-4337, …)')

// Accepts a JSON ABI array or human-readable signatures
// ("function transfer(address to, uint256 amount)").
const parseAbiInput = (abi: string | string[]): Abi => {
  if (Array.isArray(abi)) return parseAbi(abi)
  const trimmed = abi.trim()
  if (trimmed.startsWith('[')) return JSON.parse(trimmed) as Abi
  return parseAbi([trimmed])
}

const encodeCall = (abi: string | string[], functionName: string, args: unknown[] = []): Hex =>
  encodeFunctionData({ abi: parseAbiInput(abi), functionName, args })

const abiInput = z
  .union([z.string(), z.array(z.string())])
  .describe('JSON ABI array as a string, or human-readable signature(s) like "function transfer(address,uint256)"')

export type ServerOptions = {
  readOnly: boolean
  version: string
  // Lifts the human-in-the-loop guard (see guard.ts). Off unless the operator opts in.
  allowSoloExecution?: boolean
}

export const createServer = (client: MyMultiSigClient, options: ServerOptions) => {
  const server = new McpServer({ name: 'mymultisig', version: options.version }, { instructions: SERVER_INSTRUCTIONS })
  const read = { readOnlyHint: true, openWorldHint: true }

  // --- read tools -------------------------------------------------------------

  server.registerTool(
    'whoami',
    {
      title: 'Show agent identity',
      description:
        'Which credentials this server runs with: the local signing address (if MYMULTISIG_PRIVATE_KEY is set), the API key owner and scopes (if MYMULTISIG_API_KEY is set), and whether write tools are enabled.',
      annotations: read
    },
    () =>
      run(async () => {
        let api: unknown = null
        if (client.api.hasApiKey) api = await client.api.whoami()
        return {
          signer: client.address ?? null,
          canSign: client.canSign,
          apiKey: api,
          apiUrl: client.apiUrl,
          readOnly: options.readOnly
        }
      })
  )

  server.registerTool(
    'list_networks',
    {
      title: 'List supported networks',
      description: 'Chains MyMultiSig supports, with the official factory address and version on each.',
      annotations: read
    },
    () =>
      run(async () =>
        SUPPORTED_CHAINS.map((c) => ({
          chainId: c.id,
          name: c.name,
          testnet: Boolean(c.testnet),
          nativeCurrency: c.nativeCurrency.symbol,
          factories: KNOWN_FACTORIES.filter((f) => f.chainId === c.id).map((f) => ({ address: f.address, version: f.version }))
        }))
      )
  )

  server.registerTool(
    'get_multisig',
    {
      title: 'Read a multisig wallet',
      description:
        'Live on-chain state of a MyMultiSig wallet: name, contract version, owners, threshold, nonce, wallet type.',
      inputSchema: { chainId, address },
      annotations: read
    },
    ({ chainId, address }) =>
      run(async () => {
        const wallet = await client.getWallet(chainId, address)
        const me = client.address?.toLowerCase()
        return {
          ...wallet,
          agentIsOwner: me != null && wallet.owners ? wallet.owners.some((o) => o.toLowerCase() === me) : null,
          link: client.walletUrl(wallet.address)
        }
      })
  )

  server.registerTool(
    'list_my_multisigs',
    {
      title: 'List my multisigs',
      description:
        'Wallets registered on mymultisig.app for an owner (defaults to the API key owner or the agent signer). Needs an API key with the read scope, or a signing key.',
      inputSchema: { owner: address.optional() },
      annotations: read
    },
    ({ owner }) => run(() => client.listMyWallets(owner))
  )

  server.registerTool(
    'list_requests',
    {
      title: 'List queued requests',
      description:
        'Active transaction requests queued for a wallet, in execution order, with signature counts vs threshold and a one-line summary of each.',
      inputSchema: { chainId, wallet: address },
      annotations: read
    },
    ({ chainId, wallet }) => run(() => client.listRequests(chainId, wallet))
  )

  server.registerTool(
    'get_request',
    {
      title: 'Inspect a request',
      description:
        'Full detail of one request: decoded call with risk warnings, every signature verified locally against the owner set, whether the agent already signed, and whether it is ready to execute. Call this before approving or executing.',
      inputSchema: { chainId, requestId: z.string().uuid() },
      annotations: read
    },
    ({ chainId, requestId }) => run(() => client.getRequestStatus(chainId, requestId))
  )

  server.registerTool(
    'get_balances',
    {
      title: 'Wallet balances',
      description: 'Native balance plus ERC-20 tokens and NFTs held by an address (token data via the app indexer).',
      inputSchema: { chainId, address },
      annotations: read
    },
    ({ chainId, address }) =>
      run(async () => {
        const publicClient = client.publicClient(chainId)
        const native = await publicClient.getBalance({ address: address as Hex })
        let assets: unknown = null
        try {
          assets = ((await client.api.getAssets(address, chainId)) as { content?: unknown }).content ?? null
        } catch (error) {
          assets = { error: error instanceof Error ? error.message : String(error) }
        }
        return { chainId, address, nativeWei: native.toString(), assets }
      })
  )

  server.registerTool(
    'predict_multisig_address',
    {
      title: 'Predict a wallet address',
      description:
        'CREATE2 address a 0.5.0 factory will deploy to for this creator, salt and constructor arguments (same on every chain with the same factory).',
      inputSchema: {
        chainId,
        name: z.string().min(1),
        owners: z.array(address).min(1),
        threshold: z.number().int().positive(),
        salt: hex.describe('bytes32 salt, 0x + 64 hex chars'),
        walletType: walletType.optional(),
        onlyOwnerRequest: z.boolean().optional(),
        creator: address.optional().describe('defaults to the agent signer'),
        factory: address.optional()
      },
      annotations: read
    },
    (input) => run(async () => ({ address: await client.predictWalletAddress({ ...input, salt: input.salt as Hex }) }))
  )

  server.registerTool(
    'encode_function_call',
    {
      title: 'Encode calldata',
      description:
        'ABI-encode a contract call into hex calldata for propose_transaction, and echo back its decoded summary.',
      inputSchema: {
        abi: abiInput,
        functionName: z.string(),
        args: z.array(z.any()).optional().describe('Arguments in order; pass uint values as decimal strings'),
        to: address.optional().describe('Target contract, only used for the summary'),
        wallet: address.optional().describe('The multisig, only used to recognise self-calls in the summary')
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    ({ abi, functionName, args, to, wallet }) =>
      run(async () => {
        const data = encodeCall(abi, functionName, args)
        const summary =
          to != null
            ? describeCall((wallet ?? '0x0000000000000000000000000000000000000000') as Hex, { to: to as Hex, value: '0', data })
            : undefined
        return { data, summary }
      })
  )

  if (options.readOnly) return server

  // --- write tools ------------------------------------------------------------

  server.registerTool(
    'create_multisig',
    {
      title: 'Deploy a new multisig',
      description:
        'Deploy a MyMultiSig wallet from the official factory (the agent key pays gas) and register it on mymultisig.app. Needs MYMULTISIG_PRIVATE_KEY. Refuses a wallet the agent could operate alone (agent is an owner and threshold is 1). Confirm owners, threshold and chain with the user first.',
      inputSchema: {
        chainId,
        name: z.string().min(1).max(64),
        owners: z.array(address).min(1),
        threshold: z.number().int().positive(),
        walletType: walletType.optional(),
        onlyOwnerRequest: z.boolean().optional().describe('Extended/advanced only: only owners may queue requests'),
        salt: hex.optional().describe('bytes32 salt for a deterministic (CREATE2) address on 0.5.0 factories'),
        factory: address.optional().describe('Defaults to the official factory on the chain')
      },
      annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: true }
    },
    (input) =>
      run(async () => {
        if (!options.allowSoloExecution) assertWalletNeedsAnotherOwner(input.owners, input.threshold, client.address)
        return client.createWallet({ ...input, salt: input.salt as Hex | undefined })
      })
  )

  server.registerTool(
    'propose_transaction',
    {
      title: 'Propose a transaction',
      description:
        'Queue a transaction request on a multisig. Provide either raw `data`, or `abi` + `functionName` + `args` to encode it. With MYMULTISIG_PRIVATE_KEY (an owner) the agent signs it immediately; otherwise it is queued unsigned for the owners to sign in the app. Returns the request link to share.',
      inputSchema: {
        chainId,
        wallet: address.describe('The multisig wallet address'),
        to: address.describe('Destination of the call'),
        value: wei.optional().describe('Native value in wei (default 0)'),
        valueEther: z
          .string()
          .regex(/^\d+(\.\d+)?$/)
          .optional()
          .describe('Native value as a decimal in ether units, alternative to value'),
        data: hex.optional().describe('Raw calldata (default 0x)'),
        abi: abiInput.optional(),
        functionName: z.string().optional(),
        args: z.array(z.any()).optional(),
        description: z.string().min(1).max(500).describe('Human-readable purpose, shown to the other owners'),
        txnGas: wei.optional().describe('Gas forwarded to the inner call; estimated when omitted'),
        txnNonce: wei.optional().describe('Extended wallets: pin to an explicit nonce'),
        validUntil: wei.optional().describe('0.5.0 wallets: unix-seconds expiry of the signatures'),
        delegatecall: z.boolean().optional().describe('0.5.0 Extended only, DANGEROUS: execute via DELEGATECALL'),
        sign: z.boolean().optional().describe('Set false to queue without the agent signature')
      },
      annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: true }
    },
    (input) =>
      run(async () => {
        if (input.value != null && input.valueEther != null) throw new Error('Pass value or valueEther, not both')
        if (input.data != null && input.abi != null) throw new Error('Pass data or abi + functionName, not both')
        let data = (input.data ?? '0x') as Hex
        if (input.abi != null) {
          if (input.functionName == null) throw new Error('functionName is required with abi')
          data = encodeCall(input.abi, input.functionName, input.args)
        }
        return client.proposeTransaction({
          chainId: input.chainId,
          wallet: input.wallet,
          to: input.to,
          value: input.valueEther != null ? parseEther(input.valueEther).toString() : input.value,
          data,
          description: input.description,
          txnGas: input.txnGas,
          txnNonce: input.txnNonce,
          validUntil: input.validUntil,
          operation: input.delegatecall ? '1' : undefined,
          sign: input.sign
        })
      })
  )

  server.registerTool(
    'approve_request',
    {
      title: 'Approve (sign) a request',
      description:
        'Add the agent’s EIP-712 signature to a queued request. Needs MYMULTISIG_PRIVATE_KEY for an owner. Refuses if any existing signature is invalid. Only call after showing get_request output to the user and getting confirmation.',
      inputSchema: { chainId, requestId: z.string().uuid() },
      annotations: { destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    ({ chainId, requestId }) => run(() => client.approveRequest(chainId, requestId))
  )

  server.registerTool(
    'execute_request',
    {
      title: 'Execute a request on-chain',
      description:
        'Send execTransaction for a request that has reached its threshold (the agent key pays gas). Simulates first and refuses on missing/invalid signatures, or when no owner other than the agent has approved. Irreversible: confirm with the user first.',
      inputSchema: { chainId, requestId: z.string().uuid() },
      annotations: { destructiveHint: true, idempotentHint: false, openWorldHint: true }
    },
    ({ chainId, requestId }) =>
      run(async () => {
        if (!options.allowSoloExecution) {
          const status = await client.getRequestStatus(chainId, requestId)
          assertCosignedByAnotherOwner(status.signatures, client.address)
        }
        return client.executeRequest(chainId, requestId)
      })
  )

  server.registerTool(
    'cancel_request',
    {
      title: 'Cancel a request',
      description:
        'Cancel a queued request (owner-only). Later requests in the queue are invalidated server-side (their signatures are wiped).',
      inputSchema: { requestId: z.string().uuid() },
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true }
    },
    ({ requestId }) => run(() => client.cancelRequest(requestId))
  )

  server.registerTool(
    'reset_request',
    {
      title: 'Reset request signatures',
      description:
        'Wipe all signatures on a request (owner-only), e.g. after the wallet nonce moved. Later requests in the queue are invalidated too.',
      inputSchema: { requestId: z.string().uuid() },
      annotations: { destructiveHint: true, idempotentHint: true, openWorldHint: true }
    },
    ({ requestId }) => run(() => client.resetRequest(requestId))
  )

  return server
}
