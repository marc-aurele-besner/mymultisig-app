import { encodeFunctionData, decodeFunctionData, Abi } from 'viem'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import { MultiSig, WalletType } from '../models/MultiSigs'

// Every admin operation is an onlyThis function: the multisig calls itself, so
// these are encoded as self-call requests and go through the normal
// sign -> execute pipeline.

const abi = MyMultiSigExtended as Abi

export type AdminFieldKind = 'address' | 'number' | 'boolean' | 'seconds'

export type AdminField = {
  key: string
  label: string
  placeholder?: string
  kind: AdminFieldKind
}

export type AdminActionGroup = 'owners' | 'policy' | 'nonce' | 'delegation'

export const ADMIN_ACTION_GROUPS: { id: AdminActionGroup; label: string; hint: string }[] = [
  { id: 'owners', label: 'Owners', hint: 'Manage who can sign for this wallet.' },
  {
    id: 'policy',
    label: 'Threshold & policy',
    hint: 'Control how many signatures execute a transaction and who can propose.'
  },
  { id: 'nonce', label: 'Nonce management', hint: 'Invalidate pending or pre-signed requests.' },
  { id: 'delegation', label: 'Inactivity delegation', hint: 'Plan owner-seat recovery if an owner goes inactive.' }
]

export type AdminActionDefinition = {
  id: string
  label: string
  // 'both' = exists on MyMultiSig and MyMultiSigExtended
  availableOn: 'both' | 'extended'
  group: AdminActionGroup
  danger?: boolean
  hint: string
  fields: AdminField[]
  describe: (values: Record<string, string>) => string
  buildArgs: (values: Record<string, string>) => unknown[]
  validate: (values: Record<string, string>, details: { threshold: number; ownerCount: number }) => string | null
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const isUint = (value: string) => /^\d+$/.test(value)

export const ADMIN_ACTIONS: AdminActionDefinition[] = [
  {
    id: 'addOwner',
    group: 'owners',
    label: 'Add owner',
    availableOn: 'both',
    hint: 'Adds a new owner. The threshold stays unchanged, so the new owner immediately counts toward it.',
    fields: [{ key: 'owner', label: 'New owner', placeholder: 'Owner address (0x...)', kind: 'address' }],
    describe: (v) => `Add owner ${v.owner}`,
    buildArgs: (v) => [v.owner],
    validate: (v) => (isAddress(v.owner) ? null : 'Enter a valid owner address')
  },
  {
    id: 'removeOwner',
    group: 'owners',
    label: 'Remove owner',
    availableOn: 'both',
    hint: 'Removes an owner. Blocked if it would leave fewer owners than the threshold.',
    fields: [{ key: 'owner', label: 'Owner to remove', placeholder: 'Owner address (0x...)', kind: 'address' }],
    describe: (v) => `Remove owner ${v.owner}`,
    buildArgs: (v) => [v.owner],
    validate: (v, d) => {
      if (!isAddress(v.owner)) return 'Enter a valid owner address'
      if (d.ownerCount - 1 < d.threshold)
        return `Removing an owner would leave ${d.ownerCount - 1} owners below the threshold of ${d.threshold}. Lower the threshold first.`
      return null
    }
  },
  {
    id: 'replaceOwner',
    group: 'owners',
    label: 'Replace owner',
    availableOn: 'both',
    hint: 'Swaps an existing owner for a new address in a single operation.',
    fields: [
      { key: 'oldOwner', label: 'Current owner', placeholder: 'Old owner address (0x...)', kind: 'address' },
      { key: 'newOwner', label: 'New owner', placeholder: 'New owner address (0x...)', kind: 'address' }
    ],
    describe: (v) => `Replace owner ${v.oldOwner} with ${v.newOwner}`,
    buildArgs: (v) => [v.oldOwner, v.newOwner],
    validate: (v) => {
      if (!isAddress(v.oldOwner) || !isAddress(v.newOwner)) return 'Enter valid owner addresses'
      if (v.oldOwner.toLowerCase() === v.newOwner.toLowerCase()) return 'The new owner must differ from the old owner'
      return null
    }
  },
  {
    id: 'changeThreshold',
    group: 'policy',
    label: 'Change threshold',
    availableOn: 'both',
    hint: 'Changes how many owner signatures a transaction needs.',
    fields: [{ key: 'threshold', label: 'New threshold', placeholder: 'e.g. 2', kind: 'number' }],
    describe: (v) => `Change signature threshold to ${v.threshold}`,
    buildArgs: (v) => [Number(v.threshold)],
    validate: (v, d) => {
      if (!isUint(v.threshold)) return 'Enter a numeric threshold'
      const t = Number(v.threshold)
      if (t < 1 || t > d.ownerCount) return `Threshold must be between 1 and ${d.ownerCount} (current owner count)`
      return null
    }
  },
  {
    id: 'incrementNonce',
    group: 'nonce',
    label: 'Skip current nonce',
    availableOn: 'both',
    danger: true,
    hint: 'Bumps the transaction nonce, invalidating every pending request signed against the current nonce.',
    fields: [],
    describe: () => 'Increment the nonce (invalidate pending requests)',
    buildArgs: () => [],
    validate: () => null
  },
  {
    id: 'setOnlyOwnerRequest',
    group: 'policy',
    label: 'Owner-only requests',
    availableOn: 'extended',
    hint: 'When enabled, integrations should refuse transaction requests from non-owners.',
    fields: [{ key: 'enabled', label: 'Only owners can create requests', kind: 'boolean' }],
    describe: (v) => `${v.enabled === 'true' ? 'Enable' : 'Disable'} owner-only requests`,
    buildArgs: (v) => [v.enabled === 'true'],
    validate: () => null
  },
  {
    id: 'markNonceAsUsed',
    group: 'nonce',
    label: 'Burn a nonce',
    availableOn: 'extended',
    danger: true,
    hint: 'Permanently invalidates a nonce, cancelling any transaction (including pre-signed future ones) bound to it.',
    fields: [{ key: 'nonce', label: 'Nonce to burn', placeholder: 'e.g. 7', kind: 'number' }],
    describe: (v) => `Burn nonce ${v.nonce} (cancel all requests bound to it)`,
    buildArgs: (v) => [BigInt(v.nonce)],
    validate: (v) => (isUint(v.nonce) ? null : 'Enter a numeric nonce')
  },
  {
    id: 'setTransferInactiveOwnershipAfter',
    group: 'delegation',
    label: 'Minimum inactivity window',
    availableOn: 'extended',
    hint: 'Sets the minimum inactivity period (at least 7 days) before a delegatee can take over an owner seat.',
    fields: [
      { key: 'seconds', label: 'Inactivity window (seconds)', placeholder: 'e.g. 604800 (7 days)', kind: 'seconds' }
    ],
    describe: (v) => `Set minimum inactivity window to ${v.seconds} seconds`,
    buildArgs: (v) => [BigInt(v.seconds)],
    validate: (v) => {
      if (!isUint(v.seconds)) return 'Enter a duration in seconds'
      if (Number(v.seconds) < 7 * 24 * 60 * 60) return 'The contract requires at least 7 days (604800 seconds)'
      return null
    }
  },
  {
    id: 'setOwnerSettings',
    group: 'delegation',
    label: 'Delegate an owner seat',
    availableOn: 'extended',
    hint: 'Names a delegatee who can take over this owner seat after the inactivity window elapses.',
    fields: [
      { key: 'owner', label: 'Owner', placeholder: 'Owner address (0x...)', kind: 'address' },
      {
        key: 'seconds',
        label: 'Inactivity window (seconds)',
        placeholder: 'Must exceed the wallet minimum',
        kind: 'seconds'
      },
      { key: 'delegatee', label: 'Delegatee', placeholder: 'Delegatee address (0x...)', kind: 'address' }
    ],
    describe: (v) => `Delegate seat of ${v.owner} to ${v.delegatee} after ${v.seconds}s of inactivity`,
    buildArgs: (v) => [v.owner, BigInt(v.seconds), v.delegatee],
    validate: (v) => {
      if (!isAddress(v.owner) || !isAddress(v.delegatee)) return 'Enter valid addresses'
      if (!isUint(v.seconds)) return 'Enter a duration in seconds'
      if (v.owner.toLowerCase() === v.delegatee.toLowerCase()) return 'The delegatee must differ from the owner'
      return null
    }
  }
]

export const adminActionsFor = (walletType: WalletType | undefined) =>
  ADMIN_ACTIONS.filter((a) => a.availableOn === 'both' || walletType === 'extended')

export const encodeAdminAction = (action: AdminActionDefinition, values: Record<string, string>): `0x${string}` =>
  encodeFunctionData({ abi, functionName: action.id, args: action.buildArgs(values) })

// Decodes a self-call payload against the Extended ABI (a superset of the
// simple wallet's functions). Returns null for data that is not an admin call.
export const decodeSelfCall = (data: `0x${string}`): { functionName: string; args?: readonly unknown[] } | null => {
  try {
    return decodeFunctionData({ abi, data })
  } catch {
    return null
  }
}

// Applies the effect of an executed self-call to the locally stored wallet so
// owners/threshold stay in sync immediately (the contract stores owners as a
// mapping, so there is no getOwners() to re-read). The OwnerAdded/OwnerRemoved/
// ThresholdChanged event watchers in useAdminEventSync cover the same ground
// for changes made by other clients; every patch here is idempotent so the two
// paths cannot double-apply.
export const applyAdminActionToMultiSig = (data: `0x${string}`, multiSig: MultiSig): Partial<MultiSig> | null => {
  const decoded = decodeSelfCall(data)
  if (!decoded) return null
  const args = (decoded.args ?? []) as string[]
  const hasOwner = (owner: string) => multiSig.owners.some((o) => o.toLowerCase() === owner.toLowerCase())
  switch (decoded.functionName) {
    case 'addOwner':
      return hasOwner(String(args[0]))
        ? null
        : {
            owners: [...multiSig.owners, String(args[0])],
            ownerCount: multiSig.ownerCount + 1
          }
    case 'removeOwner':
      return hasOwner(String(args[0]))
        ? {
            owners: multiSig.owners.filter((o) => o.toLowerCase() !== String(args[0]).toLowerCase()),
            ownerCount: Math.max(multiSig.ownerCount - 1, 0)
          }
        : null
    case 'replaceOwner':
      return hasOwner(String(args[0]))
        ? {
            owners: multiSig.owners.map((o) =>
              o.toLowerCase() === String(args[0]).toLowerCase() ? String(args[1]) : o
            )
          }
        : null
    case 'changeThreshold':
      return multiSig.threshold === Number(args[0]) ? null : { threshold: Number(args[0]) }
    case 'setOnlyOwnerRequest':
      return { allowOnlyOwnerRequest: Boolean(args[0]) }
    default:
      return null
  }
}
