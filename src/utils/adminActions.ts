import { encodeFunctionData, decodeFunctionData, Abi } from 'viem'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'

import { MultiSig, WalletType } from '../models/MultiSigs'
import { gteVersion } from './contractVersions'

// Every admin operation is an onlyThis function: the multisig calls itself, so
// these are encoded as self-call requests and go through the normal
// sign -> execute pipeline.

const abi = MyMultiSigExtended as Abi

export type AdminFieldKind = 'address' | 'number' | 'boolean' | 'seconds' | 'bytes4' | 'wei'

export type AdminField = {
  key: string
  label: string
  placeholder?: string
  kind: AdminFieldKind
}

export type AdminActionGroup =
  | 'owners'
  | 'policy'
  | 'nonce'
  | 'delegation'
  | 'timelock'
  | 'security'
  | 'allowance'
  | 'modules'

export const ADMIN_ACTION_GROUPS: { id: AdminActionGroup; label: string; hint: string }[] = [
  { id: 'owners', label: 'Owners', hint: 'Manage who can sign for this wallet.' },
  {
    id: 'policy',
    label: 'Threshold & policy',
    hint: 'Control how many signatures execute a transaction and who can propose.'
  },
  { id: 'nonce', label: 'Nonce management', hint: 'Invalidate pending or pre-signed requests.' },
  { id: 'delegation', label: 'Inactivity delegation', hint: 'Plan owner-seat recovery if an owner goes inactive.' },
  { id: 'timelock', label: 'Timelock', hint: 'Delay sensitive operations behind a schedule-then-execute window.' },
  {
    id: 'security',
    label: 'Guard & allowlist',
    hint: 'Screen every transaction through a guard contract or a target allowlist.'
  },
  {
    id: 'allowance',
    label: 'Spending allowances',
    hint: 'Let a single owner spend up to a daily cap without collecting signatures.'
  },
  { id: 'modules', label: 'Modules', hint: 'Plugins that can act for the wallet without owner signatures.' }
]

export type AdminActionDefinition = {
  id: string
  label: string
  // 'both' = exists on MyMultiSig and MyMultiSigExtended
  availableOn: 'both' | 'extended'
  // Only offered when the deployed wallet reports at least this version
  // (0.5.0 added the timelock/guard/allowance/module surface).
  minWalletVersion?: string
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
const isBytes4 = (value: string) => /^0x[a-fA-F0-9]{8}$/.test(value)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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
  },
  {
    id: 'setTimelockDelay',
    group: 'timelock',
    label: 'Set timelock delay',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    hint: 'Sensitive calls (privileged self-calls, transfers above the wei threshold) must then be scheduled and wait out this delay before executing. Set 0 to turn the timelock off.',
    fields: [{ key: 'seconds', label: 'Delay (seconds)', placeholder: 'e.g. 86400 (1 day)', kind: 'seconds' }],
    describe: (v) =>
      v.seconds === '0' ? 'Disable the timelock' : `Set the timelock delay to ${v.seconds} seconds`,
    buildArgs: (v) => [BigInt(v.seconds)],
    validate: (v) => (isUint(v.seconds) ? null : 'Enter a delay in seconds')
  },
  {
    id: 'setSensitiveSelector',
    group: 'timelock',
    label: 'Mark a selector sensitive',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    hint: 'Registers (or clears) a 4-byte function selector as sensitive when called on the wallet itself. The wallet pre-registers its own admin selectors at deployment.',
    fields: [
      { key: 'selector', label: 'Function selector', placeholder: 'e.g. 0x7065cb48 (addOwner)', kind: 'bytes4' },
      { key: 'sensitive', label: 'Treat as sensitive', kind: 'boolean' }
    ],
    describe: (v) => `${v.sensitive === 'true' ? 'Mark' : 'Unmark'} selector ${v.selector} as sensitive`,
    buildArgs: (v) => [v.selector, v.sensitive === 'true'],
    validate: (v) => (isBytes4(v.selector) ? null : 'Enter a 4-byte selector like 0x7065cb48')
  },
  {
    id: 'setSensitiveValueThreshold',
    group: 'timelock',
    label: 'Set value threshold',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    hint: 'Any transaction moving at least this many wei counts as sensitive and must go through the timelock. Set 0 to disable value-based sensitivity.',
    fields: [{ key: 'wei', label: 'Threshold (wei)', placeholder: 'e.g. 1000000000000000000 (1 ETH)', kind: 'wei' }],
    describe: (v) =>
      v.wei === '0' ? 'Disable the sensitive-value threshold' : `Treat transfers of ${v.wei} wei or more as sensitive`,
    buildArgs: (v) => [BigInt(v.wei)],
    validate: (v) => (isUint(v.wei) ? null : 'Enter a wei amount')
  },
  {
    id: 'setGuard',
    group: 'security',
    label: 'Set transaction guard',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    danger: true,
    hint: 'Every transaction is pre-checked by this ITransactionGuard contract; a reverting guard blocks the wallet. Make sure the guard is audited and cannot lock you out.',
    fields: [{ key: 'guard', label: 'Guard contract', placeholder: 'Guard address (0x...)', kind: 'address' }],
    describe: (v) => `Set the transaction guard to ${v.guard}`,
    buildArgs: (v) => [v.guard],
    validate: (v) => {
      if (!isAddress(v.guard)) return 'Enter a valid guard address'
      if (v.guard.toLowerCase() === ZERO_ADDRESS) return 'The wallet rejects the zero address as a guard'
      return null
    }
  },
  {
    id: 'setAllowedTarget',
    group: 'security',
    label: 'Allow / disallow a target',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    hint: 'The built-in allowlist turns on with the first allowed target: from then on the wallet only calls allowed addresses. It also applies inside batches and module calls.',
    fields: [
      { key: 'target', label: 'Target', placeholder: 'Target address (0x...)', kind: 'address' },
      { key: 'allowed', label: 'Allowed', kind: 'boolean' }
    ],
    describe: (v) => `${v.allowed === 'true' ? 'Allow' : 'Disallow'} calls to ${v.target}`,
    buildArgs: (v) => [v.target, v.allowed === 'true'],
    validate: (v) => (isAddress(v.target) ? null : 'Enter a valid target address')
  },
  {
    id: 'setDailySpendingLimit',
    group: 'allowance',
    label: 'Set a daily spending limit',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    hint: 'Lets this owner spend up to the cap per rolling 24h window with just their own signature (no threshold). Set 0 to remove the allowance.',
    fields: [
      { key: 'owner', label: 'Owner', placeholder: 'Owner address (0x...)', kind: 'address' },
      { key: 'wei', label: 'Daily cap (wei)', placeholder: 'e.g. 1000000000000000000 (1 ETH)', kind: 'wei' }
    ],
    describe: (v) =>
      v.wei === '0'
        ? `Remove the daily spending allowance of ${v.owner}`
        : `Allow ${v.owner} to spend up to ${v.wei} wei per day single-signed`,
    buildArgs: (v) => [v.owner, BigInt(v.wei)],
    validate: (v) => {
      if (!isAddress(v.owner)) return 'Enter a valid owner address'
      if (!isUint(v.wei)) return 'Enter a wei amount'
      return null
    }
  },
  {
    id: 'enableModule',
    group: 'modules',
    label: 'Enable a module',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    danger: true,
    hint: 'Modules execute transactions for the wallet WITHOUT owner signatures. Only enable contracts you fully trust — a malicious module can drain the wallet.',
    fields: [{ key: 'module', label: 'Module', placeholder: 'Module address (0x...)', kind: 'address' }],
    describe: (v) => `Enable module ${v.module} (bypasses the signature threshold)`,
    buildArgs: (v) => [v.module],
    validate: (v) => {
      if (!isAddress(v.module)) return 'Enter a valid module address'
      if (v.module.toLowerCase() === ZERO_ADDRESS) return 'The wallet rejects the zero address as a module'
      return null
    }
  },
  {
    id: 'disableModule',
    group: 'modules',
    label: 'Disable a module',
    availableOn: 'extended',
    minWalletVersion: '0.5.0',
    hint: 'Modules form a linked list: pass the module that comes right before the one you remove in the module list, or the zero address when removing the first one.',
    fields: [
      {
        key: 'prev',
        label: 'Previous module',
        placeholder: '0x000...000 when removing the first module',
        kind: 'address'
      },
      { key: 'module', label: 'Module to disable', placeholder: 'Module address (0x...)', kind: 'address' }
    ],
    describe: (v) => `Disable module ${v.module}`,
    buildArgs: (v) => [v.prev, v.module],
    validate: (v) => {
      if (!isAddress(v.prev) || !isAddress(v.module)) return 'Enter valid module addresses'
      if (v.prev.toLowerCase() === v.module.toLowerCase()) return 'The previous module must differ from the module'
      return null
    }
  }
]

export const adminActionsFor = (walletType: WalletType | undefined, walletVersion?: string) =>
  ADMIN_ACTIONS.filter(
    (a) =>
      (a.availableOn === 'both' || walletType === 'extended') &&
      (a.minWalletVersion == null || gteVersion(walletVersion, a.minWalletVersion))
  )

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
