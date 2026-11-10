import React, { Fragment, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount, useBalance, useChainId, useChains } from 'wagmi'
import { encodeFunctionData, formatUnits, parseUnits, type Abi } from 'viem'
import {
  CodeIcon,
  CoinsIcon,
  LayersIcon,
  SendIcon,
  TerminalIcon,
  UsersIcon,
  type LucideIcon
} from 'lucide-react'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { MultiSigTransactionRequest } from '../../models/MultiSigs'

import TextInput from '../inputs/TextInput'
import AddressBookInput from '../inputs/AddressBookInput'
import EthersInput from '../inputs/EthersInput'
import SignRequest from '../buttons/SignRequest'
import SignUserOp from '../buttons/SignUserOp'
import NewContract from '../modals/NewContract'
import { AddIcon, DeleteIcon } from '../icons/ChakraIcons'
import useContracts from '../../states/contracts'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import useAdvancedFeatures from '../../hooks/useAdvancedFeatures'
import useEntryPointNonce from '../../hooks/useEntryPointNonce'
import useBundlerConfig from '../../states/bundlerConfig'
import useCustomTokens from '../../states/customTokens'
import { useAddressLabels } from '../../states/addressBook'
import useWalletAssets from '../../hooks/useWalletAssets'
import AddressRow from '../common/AddressRow'
import truncateAddress from '../../utils/truncateAddress'
import { walletHref } from '../shell/navigation'
import { buildRawSignatureFromFunction } from '../../utils/buildFunctionSignature'
import { isModernWallet } from '../../utils/contractVersions'

interface CreateMultiSigRequestFormProps {
  multiSigAddress: `0x${string}`
}

// One request = one or more steps. A single step signs as a plain request;
// several steps are wrapped into one multiRequest (batch) transaction.
interface RequestStep {
  contractKey: string // 'custom' | 'itSelf' | saved contract id
  to: string
  functionSig: string // '' = raw calldata
  args: Record<string, string>
  value: string
  txnGas: string
  data: string
}

const EMPTY_STEP: RequestStep = {
  contractKey: 'custom',
  to: '',
  functionSig: '',
  args: {},
  value: '0',
  txnGas: '35000',
  data: '0x'
}

// Starting points over the same builder. A template only decides which
// fields are shown and how the first step is preset; what gets signed is
// always the generic request below.
type Template = 'send' | 'token' | 'call' | 'batch' | 'raw'

const TEMPLATES: { id: Template; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'send', label: 'Send funds', hint: 'Move native funds to an address', icon: SendIcon },
  { id: 'token', label: 'Send a token', hint: 'Transfer an ERC-20 the wallet holds', icon: CoinsIcon },
  { id: 'call', label: 'Call a contract', hint: 'Pick a saved contract and a function', icon: CodeIcon },
  { id: 'batch', label: 'Batch', hint: 'Chain several calls into one transaction', icon: LayersIcon },
  { id: 'raw', label: 'Raw calldata', hint: 'Paste pre-encoded calldata', icon: TerminalIcon }
]

const isTemplate = (value: unknown): value is Template => TEMPLATES.some((t) => t.id === value)

// ERC-20 transfer, used by the "Send a token" template without needing the
// token saved as a contract first.
const ERC20_TRANSFER: JsonFragment = {
  type: 'function',
  name: 'transfer',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  outputs: [{ name: '', type: 'bool' }]
}
const ERC20_TRANSFER_SIG = buildRawSignatureFromFunction(ERC20_TRANSFER)
const ERC20_TRANSFER_GAS = '65000'

interface TokenChoice {
  address: string
  symbol: string
  decimals: number
  // Raw balance in base units, when the indexer reported one.
  balance?: string
}

interface TokenForm {
  address: string
  recipient: string
  amount: string
}

// useChainId() returns the wagmi-context chain id; this thin wrapper makes
// the line above read more naturally when we need it outside the hook list.
const useChainIdSafe = () => useChainId()

// Gas consumed by the multiRequest loop itself, on top of the inner calls.
const BATCH_OVERHEAD_GAS = 50000

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const isUint = (value: string) => /^\d+$/.test(value)
const isHex = (value: string) => /^0x[a-fA-F0-9]*$/.test(value)

const writeableFunctions = (abi: JsonFragment[] | null) =>
  abi?.filter(
    (item) => item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
  ) ?? []

const fragmentFor = (abi: JsonFragment[] | null, functionSig: string) =>
  functionSig !== '' ? abi?.find((item) => buildRawSignatureFromFunction(item) === functionSig) : undefined

// Encoded calldata for a step: from the selected function + args when a
// contract function is chosen, otherwise the raw calldata field.
const encodeStepData = (step: RequestStep, abi: JsonFragment[] | null): `0x${string}` | null => {
  const fragment = fragmentFor(abi, step.functionSig)
  if (fragment != null) {
    try {
      const args = (fragment.inputs ?? []).map((input) => {
        const raw = step.args[String(input.name)] ?? ''
        return input.type != null && input.type.includes('[') ? JSON.parse(raw) : raw
      })
      return encodeFunctionData({
        abi: [fragment] as unknown as Abi,
        functionName: String(fragment.name),
        args
      })
    } catch {
      return null
    }
  }
  return isHex(step.data) ? (step.data as `0x${string}`) : null
}

// Shown once a request is stored: where it stands now, and how to act on it.
const SubmittedRequestStatus: React.FC<{
  multiSigAddress: `0x${string}`
  request: MultiSigTransactionRequest
  threshold: number | null
  onSendAnother: () => void
}> = ({ multiSigAddress, request, threshold, onSendAnother }) => {
  const collected = request.signatures.length
  const remaining = threshold != null ? Math.max(threshold - collected, 0) : null
  const status =
    remaining == null
      ? `${collected} signature${collected === 1 ? '' : 's'} collected so far.`
      : remaining === 0
        ? 'Ready to execute: the signature threshold is reached.'
        : `${collected} of ${threshold} signatures collected. ${remaining} more owner signature${
            remaining === 1 ? ' is' : 's are'
          } needed.`

  return (
    <div className='flex w-full flex-col gap-4 rounded-xl border border-border p-4'>
      <div className='flex flex-col gap-1'>
        <span className='text-xs font-semibold uppercase tracking-wide text-primary'>Request sent</span>
        <h3 className='text-base font-semibold text-foreground'>{request.description}</h3>
        <p className='text-sm text-muted-foreground'>{status}</p>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Button asChild variant='outline'>
          <Link href={`/request/${request.id}`}>Open request</Link>
        </Button>
        <Button asChild variant='outline'>
          <Link href={`/multisig/${multiSigAddress}/requests`}>All requests</Link>
        </Button>
        <Button className='sm:ml-auto' onClick={onSendAnother}>
          Send another request
        </Button>
      </div>
    </div>
  )
}

const CreateMultiSigRequestForm: React.FC<CreateMultiSigRequestFormProps> = ({ multiSigAddress }) => {
  const router = useRouter()
  const initialTemplate = isTemplate(router.query.template) ? router.query.template : 'send'
  const [template, setTemplate] = useState<Template>(initialTemplate)
  // Send and token templates show a short form; this reveals the full step.
  const [showAllFields, setShowAllFields] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [tokenForm, setTokenForm] = useState<TokenForm>({
    address: typeof router.query.token === 'string' ? router.query.token : '',
    recipient: '',
    amount: ''
  })
  const [steps, setSteps] = useState<RequestStep[]>(
    initialTemplate === 'batch' ? [{ ...EMPTY_STEP }, { ...EMPTY_STEP }] : [{ ...EMPTY_STEP }]
  )
  // The request stored by the last successful sign. While set, the form is
  // replaced by its status so the user sees the outcome without reloading.
  const [submitted, setSubmitted] = useState<MultiSigTransactionRequest | null>(null)
  const [description, setDescription] = useState('')
  const [pinnedNonce, setPinnedNonce] = useState('')
  const [expiry, setExpiry] = useState('')
  const [strictBatch, setStrictBatch] = useState(false)
  const [delegateCall, setDelegateCall] = useState(false)
  const [useBundler, setUseBundler] = useState(false)
  const [newContractKey, setNewContractKey] = useState(0)
  const [showNewContract, setShowNewContract] = useState(false)
  const contracts = useContracts((state) => state.contracts)
  const { address } = useAccount()
  const chainId = useChainId()
  const chain = useChains().find((c) => c.id === chainId)
  const nativeSymbol = chain?.nativeCurrency.symbol ?? 'ETH'
  // Native value is sent from the multisig itself, so its balance caps what the
  // request can move. Gas is paid by the submitter, so nothing is reserved for it.
  const { data: walletBalance } = useBalance({ address: multiSigAddress, chainId })
  const { walletType, allowOnlyOwnerRequest } = useWalletType(multiSigAddress)
  const { labelFor } = useAddressLabels(chainId)
  const { assets } = useWalletAssets(multiSigAddress)
  const customTokens = useCustomTokens((state) => state.tokens)
  // Tokens the wallet is known to hold or track: manually added ones first,
  // then whatever the indexer reports (which also brings balances).
  const tokens = useMemo<TokenChoice[]>(() => {
    const byAddress = new Map<string, TokenChoice>()
    for (const token of customTokens) {
      if (token.chainId !== chainId) continue
      byAddress.set(token.address.toLowerCase(), {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals
      })
    }
    for (const token of assets?.tokens ?? []) {
      byAddress.set(token.contractAddress.toLowerCase(), {
        address: token.contractAddress,
        symbol: token.symbol,
        decimals: token.decimals,
        balance: token.balance
      })
    }
    return [...byAddress.values()]
  }, [customTokens, assets, chainId])
  const { data: detailsData } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { supportsAdvanced, entryPoint } = useAdvancedFeatures(multiSigAddress)
  const { nonce: entryPointNonce } = useEntryPointNonce(entryPoint, multiSigAddress)
  const getBundlerUrl = useBundlerConfig((s) => s.getBundlerUrl)
  const getPaymasterUrl = useBundlerConfig((s) => s.getPaymasterUrl)
  const bundlerUrl = getBundlerUrl(useChainIdSafe())
  const paymasterUrl = getPaymasterUrl(useChainIdSafe())
  // 0.5.0 wallets: optional signature expiry, atomic batches, and (Extended)
  // a DELEGATECALL operation byte gated on-chain to the wallet itself.
  const walletVersion = detailsData != null ? String(detailsData[1]) : undefined
  const modern = isModernWallet(walletVersion)
  // The bundler toggle is only meaningful on 0.5.0 Extended wallets (the
  // only type that exposes the ERC-4337 surface).
  const bundlerAvailable = supportsAdvanced && entryPoint != null && walletType === 'extended'
  const bundlerConfigured = bundlerUrl != null && bundlerUrl !== ''
  // Extended wallets can restrict request creation to owners; the API enforces
  // the same rule server-side.
  const isOwner = detailsData != null ? Boolean(detailsData[5]) : undefined
  const blockedByPolicy = allowOnlyOwnerRequest && isOwner === false

  const abiForStep = (step: RequestStep): JsonFragment[] | null => {
    if (step.contractKey === 'itSelf') return MyMultiSig as JsonFragment[]
    if (step.contractKey === 'erc20') return [ERC20_TRANSFER]
    const contract = contracts.find((c) => c.id === step.contractKey)
    return contract?.abi ?? null
  }

  const updateStep = (index: number, patch: Partial<RequestStep>) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)))
  }
  const addStep = () => setSteps([...steps, { ...EMPTY_STEP }])
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index))

  const selectedToken = tokens.find((t) => t.address.toLowerCase() === tokenForm.address.toLowerCase())
  // Amount in base units, or null while it is empty or not a number.
  const tokenAmountRaw = (() => {
    if (selectedToken == null || tokenForm.amount.trim() === '') return null
    try {
      const raw = parseUnits(tokenForm.amount.trim(), selectedToken.decimals)
      return raw > 0n ? raw : null
    } catch {
      return null
    }
  })()
  const tokenExceeds =
    tokenAmountRaw != null && selectedToken?.balance != null && tokenAmountRaw > BigInt(selectedToken.balance)

  // The token form is a friendlier face on one generic step: an ERC-20
  // transfer(to, amount) call to the token contract.
  const tokenStep = (form: TokenForm): RequestStep => {
    const token = tokens.find((t) => t.address.toLowerCase() === form.address.toLowerCase())
    let amount = ''
    try {
      if (token != null && form.amount.trim() !== '') {
        const raw = parseUnits(form.amount.trim(), token.decimals)
        if (raw > 0n) amount = raw.toString()
      }
    } catch {
      amount = ''
    }
    return {
      contractKey: 'erc20',
      to: token?.address ?? '',
      functionSig: ERC20_TRANSFER_SIG,
      args: { to: form.recipient, amount },
      value: '0',
      txnGas: ERC20_TRANSFER_GAS,
      data: '0x'
    }
  }
  const updateTokenForm = (patch: Partial<TokenForm>) => {
    const next = { ...tokenForm, ...patch }
    setTokenForm(next)
    setSteps([tokenStep(next)])
  }

  const selectTemplate = (next: Template) => {
    setTemplate(next)
    setShowAllFields(false)
    if (next === 'send' || next === 'raw') {
      setSteps([{ ...EMPTY_STEP, to: steps[0]?.contractKey === 'custom' ? steps[0].to : '' }])
    } else if (next === 'token') {
      const form = { ...tokenForm, address: tokenForm.address !== '' ? tokenForm.address : (tokens[0]?.address ?? '') }
      setTokenForm(form)
      setSteps([tokenStep(form)])
    } else if (next === 'call') {
      const first = contracts.find((c) => !c.isMultiSig)
      setSteps([
        first != null ? { ...EMPTY_STEP, contractKey: first.id, to: first.address } : { ...EMPTY_STEP }
      ])
    } else {
      const base = steps.filter((s) => s.contractKey !== 'erc20')
      setSteps(base.length >= 2 ? base : [...(base.length === 1 ? base : [{ ...EMPTY_STEP }]), { ...EMPTY_STEP }])
    }
  }

  const resetForm = () => {
    setTokenForm({ address: tokenForm.address, recipient: '', amount: '' })
    setShowAllFields(false)
    setSteps(
      template === 'batch'
        ? [{ ...EMPTY_STEP }, { ...EMPTY_STEP }]
        : template === 'token'
          ? [tokenStep({ address: tokenForm.address, recipient: '', amount: '' })]
          : [{ ...EMPTY_STEP }]
    )
    setDescription('')
    setPinnedNonce('')
    setExpiry('')
    setStrictBatch(false)
    setDelegateCall(false)
    setUseBundler(false)
    setSubmitted(null)
  }

  const handleContractChange = (index: number, key: string) => {
    if (key === 'newContract') {
      setNewContractKey((k) => k + 1)
      setShowNewContract(true)
      return
    }
    if (key === 'custom') {
      updateStep(index, { contractKey: 'custom', functionSig: '', args: {} })
      return
    }
    const to = key === 'itSelf' ? multiSigAddress : (contracts.find((c) => c.id === key)?.address ?? '')
    updateStep(index, { contractKey: key, to, functionSig: '', args: {}, data: '0x' })
  }

  // Native value this step can still send: the wallet balance minus what the
  // other steps of the same request already send. undefined until loaded.
  const remainingWei = (index: number): bigint | undefined => {
    if (walletBalance == null) return undefined
    const committed = steps.reduce((sum, s, i) => (i !== index && isUint(s.value) ? sum + BigInt(s.value) : sum), 0n)
    const remaining = walletBalance.value - committed
    return remaining > 0n ? remaining : 0n
  }
  const exceedsBalance = (step: RequestStep, index: number) => {
    const available = remainingWei(index)
    return available != null && isUint(step.value) && BigInt(step.value) > available
  }

  // What is stopping this step from being valid, in words the user can act on.
  const stepError = (step: RequestStep, index: number): string | null => {
    if (!isAddress(step.to)) return 'needs a valid target address'
    if (!isUint(step.value)) return 'needs a whole number for value'
    if (exceedsBalance(step, index)) return 'exceeds the wallet balance'
    if (!isUint(step.txnGas)) return 'needs a whole number for gas'
    const fragment = fragmentFor(abiForStep(step), step.functionSig)
    if (fragment != null) {
      if ((fragment.inputs ?? []).some((input) => (step.args[String(input.name)] ?? '').trim() === ''))
        return 'needs every function argument filled in'
      if (encodeStepData(step, abiForStep(step)) == null) return 'has arguments that do not encode'
      return null
    }
    if (!isHex(step.data)) return 'has calldata that is not valid hex'
    return null
  }

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div key={label} className='flex w-full flex-col gap-1.5'>
      <span className='text-sm font-semibold text-foreground'>{label}</span>
      {children}
      {hint != null && <span className='text-xs text-muted-foreground'>{hint}</span>}
    </div>
  )

  const firstInvalidIndex = steps.findIndex((s, i) => stepError(s, i) != null)
  const stepsValid = firstInvalidIndex === -1
  const expiryValid = expiry === '' || new Date(expiry).getTime() > Date.now()
  const isBatch = steps.length > 1
  const simpleSend = template === 'send' && !showAllFields && !isBatch
  const simpleToken = template === 'token' && !showAllFields && !isBatch
  // What is missing on the short token form, in its own words.
  const tokenError = !simpleToken
    ? null
    : tokens.length === 0
      ? 'This wallet has no tracked ERC-20 token to send.'
      : selectedToken == null
        ? 'Pick the token to send.'
        : !isAddress(tokenForm.recipient)
          ? 'The request needs a valid recipient address.'
          : tokenAmountRaw == null
            ? 'Enter the amount to send.'
            : tokenExceeds
              ? 'The amount exceeds the wallet balance.'
              : null
  const sendAmountMissing = simpleSend && isAddress(steps[0].to) && (!isUint(steps[0].value) || steps[0].value === '0')
  // Bundler mode is single-step only (the wallet's execute(to,value,data)
  // entry can't carry a multiRequest sequence) and disables EIP-712-only
  // options (validUntil, operation, pinned nonce).
  const bundlerModeEffective = useBundler && bundlerAvailable
  const ready =
    stepsValid &&
    tokenError == null &&
    !sendAmountMissing &&
    description.trim() !== '' &&
    expiryValid &&
    (!bundlerModeEffective || (!isBatch && entryPoint != null && bundlerConfigured))
  const totalStepGas = steps.reduce((sum, s) => (isUint(s.txnGas) ? sum + Number(s.txnGas) : sum), 0)
  // DELEGATECALL is only accepted on-chain when the target is the wallet
  // itself, so the toggle only applies to a single self-targeted step.
  const delegateCallAvailable =
    !bundlerModeEffective &&
    modern &&
    walletType === 'extended' &&
    !isBatch &&
    steps[0].to.toLowerCase() === multiSigAddress.toLowerCase()

  // Sign args: a single step goes out as-is; several steps self-call
  // multiRequest (or multiRequestStrict for atomic 0.5.0 batches) so all of
  // them run in one multisig transaction.
  let signArgs: { to: `0x${string}`; value: string; data: `0x${string}`; txnGas: string } | null = null
  let batchSteps: { to: `0x${string}`; value: string; data: `0x${string}`; txnGas: string }[] | undefined
  if (ready) {
    const encodedSteps = steps.map((s) => encodeStepData(s, abiForStep(s)))
    if (encodedSteps.every((d): d is `0x${string}` => d != null)) {
      if (!isBatch) {
        signArgs = {
          to: steps[0].to as `0x${string}`,
          value: steps[0].value,
          data: encodedSteps[0],
          txnGas: steps[0].txnGas
        }
      } else {
        try {
          const encoded = encodeFunctionData({
            abi: MyMultiSig as Abi,
            functionName: modern && strictBatch ? 'multiRequestStrict' : 'multiRequest',
            args: [
              steps.map((s) => s.to),
              steps.map((s) => BigInt(s.value)),
              encodedSteps,
              steps.map((s) => BigInt(s.txnGas))
            ]
          })
          signArgs = {
            to: multiSigAddress,
            value: '0',
            data: encoded,
            txnGas: String(totalStepGas + BATCH_OVERHEAD_GAS)
          }
          batchSteps = steps.map((s, i) => ({
            to: s.to as `0x${string}`,
            value: s.value,
            data: encodedSteps[i],
            txnGas: s.txnGas
          }))
        } catch {
          signArgs = null
        }
      }
    }
  }

  if (blockedByPolicy)
    return (
      <div className='rounded-lg border border-border p-4'>
        <p className='text-sm text-muted-foreground'>
          This wallet only accepts transaction requests from its owners, and the connected account is not an owner.
        </p>
      </div>
    )

  if (submitted != null)
    return (
      <SubmittedRequestStatus
        multiSigAddress={multiSigAddress}
        request={submitted}
        threshold={detailsData != null ? Number(detailsData[2]) : null}
        onSendAnother={resetForm}
      />
    )

  // ----- what the preview shows -----
  const first = steps[0]
  const firstFragment = fragmentFor(abiForStep(first), first.functionSig)
  const targetLabel = (address: string) =>
    address.toLowerCase() === multiSigAddress.toLowerCase() ? 'This multisig' : labelFor(address)
  const nameOf = (address: string) => targetLabel(address) ?? truncateAddress(address)
  const nativeTotal = steps.reduce((sum, s) => (isUint(s.value) ? sum + BigInt(s.value) : sum), 0n)
  const formatNative = (wei: bigint) =>
    `${Number(formatUnits(wei, 18)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${nativeSymbol}`
  const actionSummary = isBatch
    ? `Batch of ${steps.length} calls${modern && strictBatch ? ' (atomic)' : ''}`
    : simpleToken || first.contractKey === 'erc20'
      ? selectedToken != null && tokenForm.amount !== ''
        ? `Send ${tokenForm.amount} ${selectedToken.symbol}`
        : 'Token transfer'
      : firstFragment != null
        ? `${String(firstFragment.name)}(…)`
        : nativeTotal > 0n && (first.data === '0x' || first.data === '')
          ? `Send ${formatNative(nativeTotal)}`
          : first.data !== '0x' && first.data !== ''
            ? 'Contract call (raw calldata)'
            : 'Nothing yet'
  const recipient = simpleToken || first.contractKey === 'erc20' ? tokenForm.recipient : first.to
  // A description the user can accept instead of typing one.
  const suggestion = isBatch
    ? ''
    : (simpleToken || first.contractKey === 'erc20') && selectedToken != null && tokenAmountRaw != null && isAddress(tokenForm.recipient)
      ? `Send ${tokenForm.amount} ${selectedToken.symbol} to ${nameOf(tokenForm.recipient)}`
      : firstFragment != null && first.contractKey !== 'erc20' && isAddress(first.to)
        ? `Call ${String(firstFragment.name)} on ${nameOf(first.to)}`
        : isAddress(first.to) && nativeTotal > 0n
          ? `Send ${formatNative(nativeTotal)} to ${nameOf(first.to)}`
          : ''
  const threshold = detailsData != null ? Number(detailsData[2]) : null
  const currentNonce = detailsData != null ? String(detailsData[4]) : null
  const optionsInUse = pinnedNonce !== '' || expiry !== '' || strictBatch || delegateCall || useBundler
  const optionsOpen = showOptions || optionsInUse

  return (
    <Fragment>
      {showNewContract && <NewContract key={newContractKey} />}
      <div className='flex w-full flex-col gap-4'>
        {/* What do you want to do? */}
        <div className='flex gap-1 overflow-x-auto rounded-xl bg-muted p-1' role='tablist' aria-label='Request type'>
          {TEMPLATES.map((item) => (
            <button
              key={item.id}
              type='button'
              role='tab'
              aria-selected={template === item.id}
              title={item.hint}
              onClick={() => selectTemplate(item.id)}
              className={cn(
                'flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors',
                template === item.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className='h-4 w-4' />
              {item.label}
            </button>
          ))}
          <Link
            href={`${walletHref(multiSigAddress, 'settings')}?section=owners`}
            title='Add, remove or replace an owner; change the threshold'
            className='flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground'
          >
            <UsersIcon className='h-4 w-4' />
            Owners &amp; threshold
          </Link>
        </div>

        <div className='grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]'>
          <div className='flex min-w-0 flex-col gap-4'>
            {isBatch && (
              <p className='text-sm text-muted-foreground'>
                {modern && strictBatch
                  ? 'All steps run in order inside one atomic multisig transaction. The first failing step reverts the whole batch.'
                  : 'All steps run in order inside one multisig transaction. A failed step is reported per-step and does not revert the others.'}
              </p>
            )}

            {steps.map((step, i) => {
              const abi = abiForStep(step)
              const functions = writeableFunctions(abi)
              const fragment = fragmentFor(abi, step.functionSig)
              const encodedPreview = fragment != null ? encodeStepData(step, abi) : null
              const toInvalid = step.to.startsWith('0x') && step.to.length > 2 && !isAddress(step.to)
              if (simpleSend)
                return (
                  <div key={i} className='flex flex-col gap-4 rounded-xl border border-border bg-card p-5'>
                    <h3 className='text-base font-semibold text-foreground'>Who gets paid, and how much?</h3>
                    {field(
                      'Send to',
                      <AddressBookInput
                        placeholder='Receiver address (0x...)'
                        value={step.to}
                        isInvalid={toInvalid}
                        allowSave
                        onChange={(value) => updateStep(i, { to: value })}
                      />
                    )}
                    {field(
                      'Amount',
                      <EthersInput
                        symbol={nativeSymbol}
                        value={step.value}
                        balanceHint={remainingWei(i)}
                        isInvalid={step.value !== '' && (!isUint(step.value) || exceedsBalance(step, i))}
                        onChange={(wei) => updateStep(i, { value: wei })}
                      />,
                      walletBalance != null
                        ? `Wallet balance: ${Number(formatUnits(walletBalance.value, walletBalance.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${nativeSymbol}.`
                        : undefined
                    )}
                  </div>
                )
              if (simpleToken)
                return (
                  <div key={i} className='flex flex-col gap-4 rounded-xl border border-border bg-card p-5'>
                    <h3 className='text-base font-semibold text-foreground'>Which token, to whom, how much?</h3>
                    {tokens.length === 0 ? (
                      <p className='text-sm leading-relaxed text-muted-foreground'>
                        No ERC-20 token is tracked for this wallet yet.{' '}
                        <Link
                          href={walletHref(multiSigAddress, 'assets')}
                          className='text-primary underline-offset-4 hover:underline'
                        >
                          Add a token on the Assets tab
                        </Link>
                        , or use “Call a contract” with the token saved as a contract.
                      </p>
                    ) : (
                      <>
                        {field(
                          'Token',
                          <Select value={selectedToken?.address ?? ''} onValueChange={(v) => updateTokenForm({ address: v })}>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select a token' />
                            </SelectTrigger>
                            <SelectContent>
                              {tokens.map((token) => (
                                <SelectItem key={token.address} value={token.address}>
                                  {token.symbol}
                                  {token.balance != null
                                    ? ` — ${Number(formatUnits(BigInt(token.balance), token.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} available`
                                    : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field(
                          'Send to',
                          <AddressBookInput
                            placeholder='Receiver address (0x...)'
                            value={tokenForm.recipient}
                            isInvalid={tokenForm.recipient.length > 2 && !isAddress(tokenForm.recipient)}
                            allowSave
                            onChange={(value) => updateTokenForm({ recipient: value })}
                          />
                        )}
                        {field(
                          'Amount',
                          <TextInput
                            className='md:w-full'
                            placeholder={`Amount in ${selectedToken?.symbol ?? 'tokens'}`}
                            inputMode='decimal'
                            value={tokenForm.amount}
                            isInvalid={(tokenForm.amount !== '' && tokenAmountRaw == null) || tokenExceeds}
                            onChange={(e) => updateTokenForm({ amount: e.target.value.trim() })}
                          />,
                          tokenExceeds ? 'The amount exceeds the wallet balance.' : undefined
                        )}
                      </>
                    )}
                  </div>
                )
              return (
                <div key={i} className='flex flex-col gap-4 rounded-xl border border-border bg-card p-5'>
                  <div className='flex items-center justify-between'>
                    <h3 className='flex items-baseline gap-2 text-base font-semibold text-foreground'>
                      {isBatch && <span className='font-mono text-sm text-primary'>{String(i + 1).padStart(2, '0')}</span>}
                      {isBatch ? `Step ${i + 1}` : 'What should this request do?'}
                    </h3>
                    {isBatch && (
                      <Button
                        variant='outline'
                        size='icon'
                        aria-label={`Remove step ${i + 1}`}
                        onClick={() => removeStep(i)}
                      >
                        <DeleteIcon className='h-4 w-4' />
                      </Button>
                    )}
                  </div>

                  {field(
                    'Contract (optional)',
                    <Select value={step.contractKey} onValueChange={(v) => handleContractChange(i, v)}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Custom address' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='custom'>Custom address</SelectItem>
                        {contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.isMultiSig ? 'itSelf' : contract.id}>
                            {contract.name}
                            {contract.isMultiSig ? ' (this wallet)' : ''}
                          </SelectItem>
                        ))}
                        <SelectItem value='newContract'>+ New contract</SelectItem>
                      </SelectContent>
                    </Select>,
                    'Pick a saved contract to choose one of its functions, or leave on custom address.'
                  )}

                  {field(
                    'Send to',
                    <AddressBookInput
                      placeholder='Receiver or contract address (0x...)'
                      value={step.to}
                      isInvalid={toInvalid}
                      allowSave
                      onChange={(value) =>
                        updateStep(
                          i,
                          step.contractKey === 'custom'
                            ? { to: value }
                            : { to: value, contractKey: 'custom', functionSig: '', args: {} }
                        )
                      }
                    />
                  )}

                  {abi != null &&
                    functions.length > 0 &&
                    field(
                      'Function to call',
                      <Select value={step.functionSig} onValueChange={(v) => updateStep(i, { functionSig: v, args: {} })}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a function' />
                        </SelectTrigger>
                        <SelectContent>
                          {functions.map((item) => (
                            <SelectItem
                              key={buildRawSignatureFromFunction(item)}
                              value={buildRawSignatureFromFunction(item)}
                            >
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                  {fragment != null && (fragment.inputs ?? []).length > 0 && (
                    <div className='flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3'>
                      <span className='text-sm font-semibold text-foreground'>Arguments</span>
                      {(fragment.inputs ?? []).map((input) =>
                        field(
                          `${String(input.name)} (${String(input.type ?? '')})`,
                          input.type === 'address' ? (
                            <AddressBookInput
                              placeholder={`${String(input.name)} address (0x...)`}
                              value={step.args[String(input.name)] ?? ''}
                              onChange={(value) => updateStep(i, { args: { ...step.args, [String(input.name)]: value } })}
                            />
                          ) : (
                            <TextInput
                              className='md:w-full'
                              placeholder={input.type?.includes('[') ? `JSON array, e.g. ["a", "b"]` : String(input.name)}
                              value={step.args[String(input.name)] ?? ''}
                              onChange={(e) =>
                                updateStep(i, { args: { ...step.args, [String(input.name)]: e.target.value } })
                              }
                            />
                          )
                        )
                      )}
                    </div>
                  )}

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {field(
                      'Value',
                      <EthersInput
                        symbol={nativeSymbol}
                        value={step.value}
                        balanceHint={remainingWei(i)}
                        isInvalid={step.value !== '' && (!isUint(step.value) || exceedsBalance(step, i))}
                        onChange={(wei) => updateStep(i, { value: wei })}
                      />,
                      walletBalance != null
                        ? `Native ${nativeSymbol} sent along with the call. Wallet balance: ${Number(formatUnits(walletBalance.value, walletBalance.decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${nativeSymbol}.`
                        : 'Native currency sent along with the call. Leave 0 for none.'
                    )}
                    {field(
                      'Gas limit',
                      <TextInput
                        className='md:w-full'
                        placeholder='35000'
                        value={step.txnGas}
                        isInvalid={step.txnGas !== '' && !isUint(step.txnGas)}
                        onChange={(e) => updateStep(i, { txnGas: e.target.value.trim() })}
                      />,
                      'Gas forwarded to the inner call.'
                    )}
                  </div>

                  {fragment != null
                    ? field(
                        'Calldata',
                        <div className='break-all rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-xs text-muted-foreground'>
                          {encodedPreview ?? 'Fill in the arguments above to encode the calldata.'}
                        </div>,
                        `Encoded from ${String(fragment.name)}(…) — it updates as you edit the arguments.`
                      )
                    : field(
                        'Calldata',
                        <TextInput
                          className='font-mono md:w-full'
                          placeholder='0x'
                          value={step.data}
                          isInvalid={!isHex(step.data)}
                          spellCheck={false}
                          autoComplete='off'
                          onChange={(e) => updateStep(i, { data: e.target.value.trim() })}
                        />,
                        'Leave 0x to just send value, or paste pre-encoded calldata.'
                      )}
                </div>
              )
            })}
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <Button variant='outline' className='gap-2' onClick={addStep} disabled={bundlerModeEffective}>
                <AddIcon className='h-4 w-4' />
                Add a step
              </Button>
              {isBatch ? (
                <span className='font-mono text-xs text-muted-foreground'>
                  {steps.length} steps · {totalStepGas.toLocaleString()} gas + {BATCH_OVERHEAD_GAS.toLocaleString()} batch
                  overhead
                </span>
              ) : bundlerModeEffective ? (
                <span className='text-xs text-muted-foreground'>
                  Bundler mode is single-step only — the wallet&apos;s execute(to,value,data) entry does not carry a
                  multiRequest sequence.
                </span>
              ) : (
                <span className='text-xs text-muted-foreground'>
                  Adding steps chains several calls into one multisig transaction.
                </span>
              )}
            </div>
            {(template === 'send' || template === 'token') && !isBatch && (
              <button
                type='button'
                onClick={() => setShowAllFields(!showAllFields)}
                className='-mt-2 self-start text-xs text-primary underline-offset-4 hover:underline'
              >
                {showAllFields ? 'Back to the simple form' : 'Show all fields (gas limit, calldata)'}
              </button>
            )}

            <div className='flex flex-col gap-4 rounded-xl border border-border bg-card p-5'>
              <h3 className='text-base font-semibold text-foreground'>Request details</h3>
              {field(
                'Description',
                <TextInput
                  className='md:w-full'
                  placeholder='What is this request for? Other owners will see this.'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              )}
              {suggestion !== '' && description.trim() === '' && (
                <button
                  type='button'
                  onClick={() => setDescription(suggestion)}
                  className='-mt-2 self-start text-left text-xs text-primary underline-offset-4 hover:underline'
                >
                  Use “{suggestion}”
                </button>
              )}
              <button
                type='button'
                onClick={() => setShowOptions(!optionsOpen)}
                disabled={optionsInUse}
                aria-expanded={optionsOpen}
                className='self-start text-xs text-primary underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline'
              >
                {optionsOpen ? '▾' : '▸'} Options: nonce, expiry, batch mode, bundler
              </button>
              {optionsOpen && (
                <div className='flex flex-col gap-4'>
                  {walletType === 'extended' &&
                    !bundlerModeEffective &&
                    field(
                      'Pin to nonce (optional)',
                      <TextInput
                        className='md:w-full'
                        placeholder='Leave empty to use the current nonce'
                        value={pinnedNonce}
                        onChange={(e) => setPinnedNonce(e.target.value)}
                      />,
                      'Binds the request to an exact nonce so it can be pre-signed or ordered explicitly.'
                    )}
                  {modern &&
                    !bundlerModeEffective &&
                    field(
                      'Signatures expire (optional)',
                      <TextInput
                        className='md:w-full'
                        type='datetime-local'
                        placeholder='No expiry'
                        value={expiry}
                        isInvalid={!expiryValid}
                        onChange={(e) => setExpiry(e.target.value)}
                      />,
                      expiryValid
                        ? 'The deadline is signed into every approval; the wallet refuses the request past it. Leave empty for no expiry.'
                        : 'The expiry must be in the future.'
                    )}
                  {isBatch && modern && !bundlerModeEffective && (
                    <div className='flex items-center gap-3'>
                      <Switch checked={strictBatch} onCheckedChange={setStrictBatch} />
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium text-foreground'>Atomic batch (all-or-nothing)</span>
                        <span className='text-xs text-muted-foreground'>
                          Runs through multiRequestStrict: the first failing step reverts every step. Use it when later steps
                          depend on earlier ones (e.g. approve then swap).
                        </span>
                      </div>
                    </div>
                  )}
                  {delegateCallAvailable && (
                    <div className='flex items-center gap-3'>
                      <Switch checked={delegateCall} onCheckedChange={setDelegateCall} />
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium text-foreground'>Execute as DELEGATECALL</span>
                        <span className='text-xs text-muted-foreground'>
                          Runs the calldata in the wallet&apos;s own storage context (operation byte 1). The wallet only accepts
                          this for calls targeting itself. For experts — a wrong payload can corrupt the wallet.
                        </span>
                      </div>
                    </div>
                  )}
                  {bundlerAvailable && (
                    <div className='flex items-center gap-3'>
                      <Switch
                        checked={useBundler}
                        onCheckedChange={(next) => {
                          setUseBundler(next)
                          // DELEGATECALL and a UserOp are mutually exclusive on the
                          // ERC-4337 path: the wallet only accepts a plain CALL into
                          // `execute(to, value, data)` from the EntryPoint.
                          if (next) setDelegateCall(false)
                        }}
                      />
                      <div className='flex flex-col'>
                        <span className='text-sm font-medium text-foreground'>Submit via bundler (ERC-4337)</span>
                        <span className='text-xs text-muted-foreground'>
                          {bundlerConfigured
                            ? 'Owners sign the EntryPoint userOpHash via personal_sign; once the threshold is reached, send the UserOp to the configured bundler.'
                            : 'No bundler configured for this chain — set one on the Owners & settings tab before sending.'}{' '}
                          Batch + DELEGATECALL options are disabled on this path.
                        </span>
                      </div>
                    </div>
                  )}
                  {walletType !== 'extended' && (
                    <p className='text-xs text-muted-foreground'>
                      Pinning a nonce, DELEGATECALL and bundler submission need an Extended wallet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Live preview with the one action */}
          <aside className='flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20'>
            <span className='font-mono text-[11px] uppercase tracking-wider text-muted-foreground'>
              What the other owners will see
            </span>
            <h3 className='text-base font-semibold text-foreground'>
              {description.trim() !== '' ? (
                description
              ) : (
                <span className='text-muted-foreground'>{suggestion !== '' ? suggestion : 'Describe the request'}</span>
              )}
            </h3>
            <dl className='flex flex-col gap-2.5 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='shrink-0 text-muted-foreground'>Action</dt>
                <dd className='text-right font-mono text-xs text-foreground'>{actionSummary}</dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground'>{isBatch ? 'Targets' : 'To'}</dt>
                <dd className='flex flex-col gap-1.5'>
                  {isBatch ? (
                    steps.map((s, i) =>
                      isAddress(s.to) ? (
                        <AddressRow key={i} address={s.to} label={targetLabel(s.to)} />
                      ) : (
                        <span key={i} className='text-xs text-muted-foreground'>
                          Step {i + 1}: no target yet
                        </span>
                      )
                    )
                  ) : isAddress(recipient) ? (
                    <AddressRow address={recipient} label={targetLabel(recipient)} />
                  ) : (
                    <span className='text-xs text-muted-foreground'>No address yet</span>
                  )}
                </dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>Value</dt>
                <dd className='font-mono text-xs text-foreground'>{formatNative(nativeTotal)}</dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>Nonce</dt>
                <dd className='font-mono text-xs text-foreground'>
                  {bundlerModeEffective
                    ? 'EntryPoint'
                    : pinnedNonce !== ''
                      ? `#${pinnedNonce} (pinned)`
                      : currentNonce != null
                        ? `#${currentNonce} (current)`
                        : '…'}
                </dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>Approvals</dt>
                <dd className='text-xs text-foreground'>
                  {threshold != null ? `1 of ${threshold} after you sign` : '…'}
                </dd>
              </div>
            </dl>
            <div className='flex flex-col gap-1.5 border-t border-border pt-4'>
              {ready && signArgs != null && bundlerModeEffective && entryPoint != null ? (
                <SignUserOp
                  wallet={multiSigAddress}
                  entryPoint={entryPoint}
                  nonce={entryPointNonce}
                  bundlerUrl={bundlerUrl}
                  paymasterUrl={paymasterUrl}
                  description={description}
                  args={{
                    ...signArgs,
                    signatures: '',
                    mode: 'userop'
                  }}
                />
              ) : ready && signArgs != null ? (
                <SignRequest
                  multiSigAddress={multiSigAddress}
                  description={description}
                  onSaved={setSubmitted}
                  args={{
                    ...signArgs,
                    signatures: '',
                    ...(pinnedNonce !== '' && /^\d+$/.test(pinnedNonce) ? { txnNonce: pinnedNonce } : {}),
                    ...(modern && expiry !== ''
                      ? { validUntil: String(Math.floor(new Date(expiry).getTime() / 1000)) }
                      : {}),
                    ...(delegateCallAvailable && delegateCall ? { operation: '1' } : {}),
                    ...(batchSteps != null ? { batchSteps } : {}),
                    ...(batchSteps != null && modern && strictBatch ? { strictBatch: true } : {})
                  }}
                />
              ) : (
                <Fragment>
                  {/* Same look and position as SignRequest's button, disabled until the request is complete. */}
                  <div className='flex w-full flex-col gap-2'>
                    <Button variant='default' size='lg' className='w-full' disabled>
                      {bundlerModeEffective ? 'Sign UserOp' : 'Sign transaction request'}
                    </Button>
                    <p className='text-xs text-muted-foreground'>
                      {tokenError != null
                        ? tokenError
                        : sendAmountMissing
                          ? 'Enter the amount to send.'
                          : bundlerModeEffective && !bundlerConfigured
                        ? 'No bundler configured for this chain — set one on the Owners & settings tab.'
                        : bundlerModeEffective && isBatch
                          ? 'Bundler mode is single-step only.'
                          : firstInvalidIndex !== -1
                            ? `${isBatch ? `Step ${firstInvalidIndex + 1}` : 'The request'} ${stepError(steps[firstInvalidIndex], firstInvalidIndex)}.`
                            : 'Add a description so the other owners know what this request does.'}
                    </p>
                  </div>
                </Fragment>
              )}
            </div>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Signing is free. It saves the request so the other owners can review and sign it.
            </p>
          </aside>
        </div>
      </div>
    </Fragment>
  )
}

export default CreateMultiSigRequestForm
