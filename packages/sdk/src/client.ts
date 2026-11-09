import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  isAddress,
  type Hex,
  type PrivateKeyAccount,
  type PublicClient
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { ApiClient } from './api'
import { defaultFactory, explorerAddressUrl, explorerTxUrl, getChain } from './chains'
import { describeCall, type DecodedCall } from './decode'
import {
  createMultiSig,
  executeTransaction,
  predictMultiSigAddress,
  readFactoryVersion,
  readWallet,
  type ExecutionOutcome
} from './onchain'
import { combineSignatures, type ExecTransactionArgs, type WalletType } from './protocol'
import { requestTypedData, signRequest, verifyRequestSignatures, type SignatureCheck } from './signing'
import type { StoredRequest, StoredWallet, WalletInfo } from './types'

type Address = `0x${string}`

export const DEFAULT_API_URL = 'https://mymultisig.app'
// Inner-call gas the app's request form defaults to.
const FALLBACK_TXN_GAS = 35_000n

export type MyMultiSigClientOptions = {
  apiUrl?: string
  apiKey?: string
  // The agent's own owner key. Signs approvals and SIWE locally; never sent anywhere.
  privateKey?: Hex
  // chainId -> RPC URL. Falls back to the chain's public RPC from viem.
  rpcUrls?: Record<number, string>
  // When set, every call on another chain is refused.
  allowedChainIds?: number[]
  fetch?: typeof fetch
}

export type RequestStatus = {
  request: StoredRequest
  wallet: WalletInfo
  decoded: DecodedCall
  signatures: SignatureCheck[]
  validSignatures: number
  threshold: number
  // The agent's own address has signed this request.
  signedByMe: boolean
  readyToExecute: boolean
  links: { app: string; wallet?: string; execution?: string }
}

const isPinned = (args: { txnNonce?: string }) => args.txnNonce != null && args.txnNonce !== ''

export class MyMultiSigClient {
  readonly api: ApiClient
  readonly account?: PrivateKeyAccount
  readonly apiUrl: string
  private readonly rpcUrls: Record<number, string>
  private readonly allowedChainIds?: number[]
  private readonly publicClients = new Map<number, PublicClient>()

  constructor(options: MyMultiSigClientOptions = {}) {
    this.apiUrl = (options.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '')
    this.api = new ApiClient({ baseUrl: this.apiUrl, apiKey: options.apiKey, fetch: options.fetch })
    this.account = options.privateKey ? privateKeyToAccount(options.privateKey) : undefined
    this.rpcUrls = options.rpcUrls ?? {}
    this.allowedChainIds = options.allowedChainIds
  }

  get address(): Address | undefined {
    return this.account?.address
  }

  get canSign(): boolean {
    return this.account != null
  }

  // --- plumbing ---------------------------------------------------------------

  private checkChain(chainId: number) {
    if (this.allowedChainIds && !this.allowedChainIds.includes(chainId))
      throw new Error(`Chain ${chainId} is not in the allowed chain list (${this.allowedChainIds.join(', ')})`)
    return getChain(chainId)
  }

  publicClient(chainId: number): PublicClient {
    const chain = this.checkChain(chainId)
    let client = this.publicClients.get(chainId)
    if (client == null) {
      client = createPublicClient({ chain, transport: http(this.rpcUrls[chainId]) }) as PublicClient
      this.publicClients.set(chainId, client)
    }
    return client
  }

  private signer(chainId: number) {
    const account = this.requireAccount()
    const chain = this.checkChain(chainId)
    return createWalletClient({ account, chain, transport: http(this.rpcUrls[chainId]) })
  }

  private requireAccount(): PrivateKeyAccount {
    if (this.account == null)
      throw new Error('This action needs a signing key: set MYMULTISIG_PRIVATE_KEY (the agent’s own owner key).')
    return this.account
  }

  // Writes need credentials: an API key, or a SIWE session from the local key.
  async ensureAuth(): Promise<void> {
    if (this.api.hasApiKey || this.api.hasSession) return
    if (this.account == null)
      throw new Error('This action needs credentials: set MYMULTISIG_API_KEY or MYMULTISIG_PRIVATE_KEY.')
    await this.api.siweLogin(this.account)
  }

  // The address the API acts as: the key owner for API keys, else the signer.
  async actingAddress(): Promise<Address> {
    if (this.api.hasApiKey) {
      const me = await this.api.whoami()
      if (me.address) return getAddress(me.address)
    }
    return this.requireAccount().address
  }

  requestUrl(id: string) {
    return `${this.apiUrl}/request/${id}`
  }

  walletUrl(address: string) {
    return `${this.apiUrl}/multisig/${address}`
  }

  // --- wallets ----------------------------------------------------------------

  getWallet(chainId: number, address: string): Promise<WalletInfo> {
    if (!isAddress(address)) throw new Error(`Invalid wallet address: ${address}`)
    return readWallet(this.publicClient(chainId), getAddress(address))
  }

  async listMyWallets(owner?: string): Promise<StoredWallet[]> {
    await this.ensureAuth()
    return this.api.listWallets((owner ?? (await this.actingAddress())).toLowerCase())
  }

  async predictWalletAddress(input: {
    chainId: number
    name: string
    owners: string[]
    threshold: number
    salt: Hex
    walletType?: WalletType
    onlyOwnerRequest?: boolean
    factory?: string
    creator?: string
  }): Promise<Address> {
    const factory = this.resolveFactory(input.chainId, input.factory)
    const creator = (input.creator ?? this.requireAccount().address) as Address
    return predictMultiSigAddress(this.publicClient(input.chainId), factory, creator, {
      contractName: input.name,
      owners: input.owners.map((o) => getAddress(o)),
      threshold: input.threshold,
      walletType: input.walletType,
      isOnlyOwnerRequest: input.onlyOwnerRequest,
      salt: input.salt
    })
  }

  private resolveFactory(chainId: number, factory?: string): Address {
    if (factory) {
      if (!isAddress(factory)) throw new Error(`Invalid factory address: ${factory}`)
      return getAddress(factory)
    }
    const known = defaultFactory(chainId)
    if (known == null) throw new Error(`No official MyMultiSig factory on chain ${chainId}; pass a factory address.`)
    return known.address
  }

  // Deploys a wallet from the factory with the agent's key paying gas, then
  // registers it with mymultisig.app so it shows up for every owner.
  async createWallet(input: {
    chainId: number
    name: string
    owners: string[]
    threshold: number
    walletType?: WalletType
    onlyOwnerRequest?: boolean
    salt?: Hex
    factory?: string
    register?: boolean
  }) {
    if (input.owners.length === 0) throw new Error('At least one owner is required')
    if (input.threshold < 1 || input.threshold > input.owners.length)
      throw new Error(`Threshold must be between 1 and ${input.owners.length}`)
    const owners = input.owners.map((o) => {
      if (!isAddress(o)) throw new Error(`Invalid owner address: ${o}`)
      return getAddress(o)
    })
    const publicClient = this.publicClient(input.chainId)
    const factory = this.resolveFactory(input.chainId, input.factory)
    const factoryVersion = await readFactoryVersion(publicClient, factory)
    const created = await createMultiSig(publicClient, this.signer(input.chainId), factory, {
      contractName: input.name,
      owners,
      threshold: input.threshold,
      walletType: input.walletType ?? 'simple',
      isOnlyOwnerRequest: input.onlyOwnerRequest,
      salt: input.salt,
      factoryVersion
    })
    const info = await readWallet(publicClient, created.address)
    let registered = false
    let registerError: string | undefined
    if (input.register !== false) {
      try {
        await this.ensureAuth()
        await this.api.upsertWallet({
          chainId: input.chainId,
          chainName: getChain(input.chainId).name,
          factoryAddress: factory,
          id: Number(created.contractIndex),
          name: input.name,
          version: info.version,
          address: created.address,
          threshold: input.threshold,
          ownerCount: owners.length,
          nonce: 0,
          owners,
          isDeployed: true,
          walletType: input.walletType ?? 'simple',
          allowOnlyOwnerRequest: input.walletType && input.walletType !== 'simple' ? (input.onlyOwnerRequest ?? false) : false
        })
        registered = true
      } catch (e) {
        registerError = e instanceof Error ? e.message : String(e)
      }
    }
    return {
      address: created.address,
      txHash: created.txHash,
      wallet: info,
      registered,
      registerError,
      links: {
        app: this.walletUrl(created.address),
        tx: explorerTxUrl(input.chainId, created.txHash),
        explorer: explorerAddressUrl(input.chainId, created.address)
      }
    }
  }

  // --- requests ---------------------------------------------------------------

  async listRequests(chainId: number, walletAddress: string) {
    const wallet = await this.getWallet(chainId, walletAddress)
    const { requests, walletNonce } = await this.api.listRequests(wallet.address)
    return {
      wallet,
      walletNonce,
      requests: requests.map((r) => ({
        id: r.id,
        description: r.description,
        submitter: r.submitter,
        signers: r.ownerSigners,
        signatureCount: r.signatures.length,
        threshold: wallet.threshold,
        txnNonce: r.txnNonce ?? null,
        isExecuted: r.isExecuted,
        isCancelled: r.isCancelled,
        mode: r.request.mode ?? 'standard',
        summary: describeCall(wallet.address, r.request).summary,
        link: this.requestUrl(r.id)
      }))
    }
  }

  async getRequestStatus(chainId: number, requestId: string): Promise<RequestStatus> {
    const request = await this.api.getRequest(requestId)
    const wallet = await this.getWallet(chainId, request.multiSigAddress)
    const typedData = requestTypedData(wallet, request.request)
    const checks = await verifyRequestSignatures(typedData, request.ownerSigners, request.signatures, wallet.owners)
    const validSignatures = checks.filter((c) => c.status === 'valid' || c.status === 'unverifiable').length
    const me = this.account?.address.toLowerCase()
    return {
      request,
      wallet,
      decoded: describeCall(wallet.address, request.request),
      signatures: checks,
      validSignatures,
      threshold: wallet.threshold,
      signedByMe: me != null && request.ownerSigners.some((s) => s.toLowerCase() === me),
      readyToExecute:
        !request.isExecuted && !request.isCancelled && request.request.mode !== 'userop' && validSignatures >= wallet.threshold,
      links: {
        app: this.requestUrl(request.id),
        wallet: this.walletUrl(wallet.address),
        execution: request.request.executionTxHash ? explorerTxUrl(chainId, request.request.executionTxHash) : undefined
      }
    }
  }

  private async estimateTxnGas(chainId: number, wallet: Address, to: Address, value: bigint, data: Hex) {
    try {
      const estimate = await this.publicClient(chainId).estimateGas({ account: wallet, to, value, data })
      const padded = (estimate * 13n) / 10n
      return padded > FALLBACK_TXN_GAS ? padded : FALLBACK_TXN_GAS
    } catch {
      return FALLBACK_TXN_GAS
    }
  }

  // Queues a request on mymultisig.app. With a signing key (and `sign` not
  // false) the agent's approval is attached, exactly as the app does when an
  // owner submits a request; otherwise it is stored unsigned for the human
  // owners to sign in the app.
  async proposeTransaction(input: {
    chainId: number
    wallet: string
    to: string
    value?: string
    data?: Hex
    description: string
    txnGas?: string
    txnNonce?: string
    validUntil?: string
    operation?: '0' | '1'
    sign?: boolean
  }) {
    if (!isAddress(input.to)) throw new Error(`Invalid destination address: ${input.to}`)
    if (input.value != null && !/^\d+$/.test(input.value)) throw new Error('value must be a decimal string in wei')
    const wallet = await this.getWallet(input.chainId, input.wallet)
    const to = getAddress(input.to)
    const data = (input.data ?? '0x') as Hex
    const value = input.value ?? '0'
    const txnGas = input.txnGas ?? (await this.estimateTxnGas(input.chainId, wallet.address, to, BigInt(value), data)).toString()
    const args: ExecTransactionArgs = {
      to,
      value,
      data,
      txnGas,
      signatures: '0x',
      ...(input.txnNonce ? { txnNonce: input.txnNonce } : {}),
      ...(input.validUntil ? { validUntil: input.validUntil } : {}),
      ...(input.operation ? { operation: input.operation } : {})
    }
    const decoded = describeCall(wallet.address, args)
    const shouldSign = input.sign !== false && this.account != null
    if (shouldSign && wallet.owners && !wallet.owners.some((o) => o.toLowerCase() === this.account!.address.toLowerCase()))
      throw new Error(`${this.account!.address} is not an owner of ${wallet.address}; propose with sign=false instead.`)
    const signatures: Hex[] = []
    const ownerSigners: Address[] = []
    if (shouldSign) {
      signatures.push(await signRequest(this.account!, requestTypedData(wallet, args)))
      ownerSigners.push(this.account!.address)
    }
    await this.ensureAuth()
    const submitter = await this.actingAddress()
    const record: StoredRequest = {
      id: crypto.randomUUID(),
      multiSigAddress: wallet.address,
      request: { ...args, signatures: combineSignatures(wallet.version, ownerSigners, signatures) },
      description: input.description,
      submitter,
      signatures,
      ownerSigners,
      dateSubmitted: Date.now().toString(),
      dateExecuted: '',
      isActive: true,
      isExecuted: false,
      isCancelled: false,
      isConfirmed: false,
      isSuccessful: false,
      txnNonce: isPinned(args) ? args.txnNonce! : null,
      dateCancelled: '',
      cancelledBy: ''
    }
    const { id } = await this.api.addRequest(record)
    return {
      id,
      signed: shouldSign,
      signatureCount: signatures.length,
      threshold: wallet.threshold,
      decoded,
      link: this.requestUrl(id)
    }
  }

  // Adds the agent's EIP-712 approval to a queued request.
  async approveRequest(chainId: number, requestId: string) {
    const account = this.requireAccount()
    const status = await this.getRequestStatus(chainId, requestId)
    const { request, wallet } = status
    if (request.isExecuted || request.isCancelled) throw new Error('Request is already executed or cancelled')
    if (request.request.mode === 'userop')
      throw new Error('UserOp requests are signed over the EntryPoint hash; approve them in the app.')
    if (status.signedByMe) return { ...status, alreadySigned: true }
    if (wallet.owners && !wallet.owners.some((o) => o.toLowerCase() === account.address.toLowerCase()))
      throw new Error(`${account.address} is not an owner of ${wallet.address}`)
    const bad = status.signatures.filter((c) => c.status === 'mismatch' || c.status === 'not-owner')
    if (bad.length > 0)
      throw new Error(
        `Refusing to add a signature next to invalid ones (${bad.map((b) => `${b.signer}: ${b.status}`).join(', ')}). Reset the request first.`
      )
    const signature = await signRequest(account, requestTypedData(wallet, request.request))
    const signatures = [...request.signatures, signature]
    const ownerSigners = [...request.ownerSigners, account.address] as Address[]
    await this.ensureAuth()
    await this.api.patchRequest(request.id, {
      request: { ...request.request, signatures: combineSignatures(wallet.version, ownerSigners, signatures) },
      signatures,
      ownerSigners
    })
    return { ...(await this.getRequestStatus(chainId, requestId)), alreadySigned: false }
  }

  // Sends execTransaction from the agent's key (it pays gas), then records the
  // outcome on mymultisig.app; the server cascades the queue from there.
  async executeRequest(chainId: number, requestId: string) {
    const status = await this.getRequestStatus(chainId, requestId)
    const { request, wallet } = status
    if (request.isExecuted) throw new Error('Request was already executed')
    if (request.isCancelled) throw new Error('Request was cancelled')
    if (request.request.mode === 'userop') throw new Error('UserOp requests are sent through a bundler from the app.')
    const bad = status.signatures.filter((c) => c.status === 'mismatch' || c.status === 'not-owner')
    if (bad.length > 0) throw new Error(`Invalid signatures on request: ${bad.map((b) => `${b.signer}: ${b.status}`).join(', ')}`)
    if (!status.readyToExecute)
      throw new Error(`Only ${status.validSignatures} of ${status.threshold} required signatures are present`)
    const outcome: ExecutionOutcome = await executeTransaction(
      this.publicClient(chainId),
      this.signer(chainId),
      wallet.address,
      request.request,
      wallet
    )
    let recorded = false
    let recordError: string | undefined
    try {
      await this.ensureAuth()
      await this.api.patchRequest(request.id, {
        request: { ...request.request, executionTxHash: outcome.txHash },
        dateExecuted: new Date().toISOString(),
        isExecuted: true,
        isSuccessful: outcome.success
      })
      recorded = true
    } catch (e) {
      recordError = e instanceof Error ? e.message : String(e)
    }
    return {
      txHash: outcome.txHash,
      success: outcome.success,
      events: outcome.events,
      recorded,
      recordError,
      links: { app: this.requestUrl(request.id), tx: explorerTxUrl(chainId, outcome.txHash) }
    }
  }

  async cancelRequest(requestId: string) {
    await this.ensureAuth()
    await this.api.cancelRequest(requestId)
    return { id: requestId, cancelled: true }
  }

  async resetRequest(requestId: string) {
    await this.ensureAuth()
    await this.api.resetRequest(requestId)
    return { id: requestId, reset: true }
  }
}
