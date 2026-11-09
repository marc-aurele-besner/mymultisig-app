import {
  parseEventLogs,
  type Abi,
  type Account,
  type Chain,
  type Hash,
  type PublicClient,
  type TransactionReceipt,
  type Transport,
  type WalletClient
} from 'viem'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import {
  buildCreateMultiSigCall,
  buildExecTransactionCall,
  buildPredictMultiSigAddressCall,
  LegacyMyMultiSigCreatedEvent,
  LegacyTransactionFailedEvent,
  type CreateMultiSigInput,
  type ExecTransactionArgs
} from './protocol'
import type { WalletInfo } from './types'

type Address = `0x${string}`
type Signer = WalletClient<Transport, Chain, Account>

// Reads everything an agent needs to reason about a wallet in one multicall.
// Mirrors useMultiSigDetails + useWalletType in the app: version() failing
// means the address isn't a MyMultiSig wallet; allowOnlyOwnerRequest()
// failing means it is a simple (non-Extended) wallet.
export const readWallet = async (client: PublicClient, address: Address): Promise<WalletInfo> => {
  const abi = MyMultiSig as Abi
  const [name, version, threshold, ownerCount, nonce, owners, onlyOwner] = await client.multicall({
    contracts: [
      { address, abi, functionName: 'name' },
      { address, abi, functionName: 'version' },
      { address, abi, functionName: 'threshold' },
      { address, abi, functionName: 'ownerCount' },
      { address, abi, functionName: 'nonce' },
      { address, abi, functionName: 'getOwners' },
      { address, abi: MyMultiSigExtended as Abi, functionName: 'allowOnlyOwnerRequest' }
    ],
    allowFailure: true
  })
  if (version.status !== 'success')
    throw new Error(`${address} on chain ${client.chain?.id} is not a MyMultiSig wallet (version() reverted)`)
  return {
    chainId: client.chain?.id ?? 0,
    address,
    name: String(name.result ?? ''),
    version: String(version.result),
    threshold: Number(threshold.result ?? 0),
    ownerCount: Number(ownerCount.result ?? 0),
    nonce: BigInt((nonce.result as bigint | number | undefined) ?? 0),
    owners: owners.status === 'success' ? ([...(owners.result as readonly Address[])] as Address[]) : undefined,
    walletType: onlyOwner.status === 'success' ? 'extended' : 'simple',
    allowOnlyOwnerRequest: onlyOwner.status === 'success' ? Boolean(onlyOwner.result) : false
  }
}

export const readIsOwner = async (client: PublicClient, wallet: Address, owner: Address): Promise<boolean> =>
  Boolean(await client.readContract({ address: wallet, abi: MyMultiSig as Abi, functionName: 'isOwner', args: [owner] }))

export const readFactoryVersion = async (client: PublicClient, factory: Address): Promise<string> =>
  String(await client.readContract({ address: factory, abi: MyMultiSigFactory as Abi, functionName: 'version' }))

export const predictMultiSigAddress = async (
  client: PublicClient,
  factory: Address,
  creator: Address,
  input: Omit<CreateMultiSigInput, 'factoryVersion'> & { salt: `0x${string}` }
): Promise<Address> => {
  const call = buildPredictMultiSigAddressCall(creator, input)
  return (await client.readContract({ address: factory, ...call })) as Address
}

export type CreatedWallet = {
  txHash: Hash
  address: Address
  contractIndex: bigint
  creator: Address
  owners: Address[]
  receipt: TransactionReceipt
}

const createdEventsAbi = [
  ...(MyMultiSigFactory as Abi).filter((item) => item.type === 'event'),
  ...(LegacyMyMultiSigCreatedEvent as unknown as Abi)
]

export const createMultiSig = async (
  publicClient: PublicClient,
  signer: Signer,
  factory: Address,
  input: CreateMultiSigInput
): Promise<CreatedWallet> => {
  const call = buildCreateMultiSigCall(input)
  const { request } = await publicClient.simulateContract({
    account: signer.account,
    address: factory,
    abi: call.abi,
    functionName: call.functionName,
    args: call.args
  })
  const txHash = await signer.writeContract(request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  if (receipt.status !== 'success') throw new Error(`Wallet creation transaction ${txHash} reverted`)
  const logs = receipt.logs.filter((log) => log.address.toLowerCase() === factory.toLowerCase())
  const created = parseEventLogs({ abi: createdEventsAbi, logs, eventName: 'MyMultiSigCreated' })[0] as
    | { args: { creator: Address; contractAddress: Address; contractIndex: bigint; originalOwners: Address[] } }
    | undefined
  if (created == null) throw new Error(`No MyMultiSigCreated event in transaction ${txHash}`)
  return {
    txHash,
    address: created.args.contractAddress,
    contractIndex: created.args.contractIndex,
    creator: created.args.creator,
    owners: [...created.args.originalOwners],
    receipt
  }
}

// Every outcome event any wallet generation can emit (see useExecTransaction).
const outcomeEventsAbi = [
  ...(MyMultiSigExtended as Abi),
  ...(MyMultiSig as Abi),
  ...(LegacyTransactionFailedEvent as unknown as Abi)
].filter((item) => item.type === 'event')

export type ExecutionOutcome = {
  txHash: Hash
  // true when the wallet emitted TransactionExecuted(Op) / MultiRequestExecuted,
  // false when it emitted TxFailure(Op) / TransactionFailed (the outer
  // transaction still succeeds; the inner call reverted).
  success: boolean
  events: string[]
  receipt: TransactionReceipt
}

export const executeTransaction = async (
  publicClient: PublicClient,
  signer: Signer,
  wallet: Address,
  args: ExecTransactionArgs,
  walletInfo: Pick<WalletInfo, 'version' | 'walletType'>
): Promise<ExecutionOutcome> => {
  const call = buildExecTransactionCall({
    args,
    walletVersion: walletInfo.version,
    isExtended: walletInfo.walletType === 'extended'
  })
  // Simulate first: a missing signature, expired validUntil or stale nonce
  // reverts here with a decoded error instead of burning gas.
  const { request } = await publicClient.simulateContract({
    account: signer.account,
    address: wallet,
    abi: call.abi,
    functionName: call.functionName,
    args: call.args
  })
  const txHash = await signer.writeContract(request)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  if (receipt.status !== 'success') throw new Error(`execTransaction ${txHash} reverted`)
  const walletLogs = receipt.logs.filter((log) => log.address.toLowerCase() === wallet.toLowerCase())
  const events = (parseEventLogs({ abi: outcomeEventsAbi, logs: walletLogs }) as unknown as { eventName: string }[]).map(
    (e) => e.eventName
  )
  const failed = events.some((e) => e === 'TxFailure' || e === 'TxFailureOp' || e === 'TransactionFailed')
  return { txHash, success: !failed, events, receipt }
}
