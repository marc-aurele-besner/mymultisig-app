import React, { useCallback, useMemo, useState } from 'react'
import { erc20Abi, type Abi } from 'viem'
import { useChainId, useChains, useReadContracts } from 'wagmi'
import { AlertTriangleIcon, PlusIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import AddressBookInput from '../inputs/AddressBookInput'
import EthersInput from '../inputs/EthersInput'
import HexSelectorInput from '../inputs/HexSelectorInput'
import SignRequest from '../buttons/SignRequest'
import { SESSION_KEY_MODULE_ADDRESS } from '../../constants/abi/sessionKeyModule'
import {
  PLAIN_TRANSFER_SELECTOR,
  TOKEN_MOVING_SELECTORS,
  encodeGrantSessionKey,
  grantError,
  grantGas,
  isPickableTarget,
  sessionTargetError,
  tokenTargetRisk
} from '../../utils/sessionKeys'

interface GrantSessionKeyFormProps {
  multiSigAddress: `0x${string}`
  // Modules enabled on the wallet; never offered as targets.
  modules: readonly string[]
  // The wallet's own target allowlist is on: session targets must be on it.
  allowlistOn: boolean
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

// datetime-local works in local time without seconds.
const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
const toUnix = (value: string) => (value === '' ? NaN : Math.floor(new Date(value).getTime() / 1000))

const SELECTOR_EXTRAS = [
  {
    selector: PLAIN_TRANSFER_SELECTOR as `0x${string}`,
    label: 'Plain native transfer (no calldata)',
    hint: 'Needed for sending native coin once selectors are restricted.'
  }
]

// Builds a grantSessionKey call (wallet -> SessionKeyModule) and hands it to
// the regular sign -> execute pipeline: granting needs the full threshold.
const GrantSessionKeyForm: React.FC<GrantSessionKeyFormProps> = ({ multiSigAddress, modules, allowlistOn }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const nativeSymbol = chain?.nativeCurrency.symbol ?? 'ETH'

  const [key, setKey] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState(() => toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000)))
  const [budgetWei, setBudgetWei] = useState('0')
  const [targets, setTargets] = useState<string[]>([''])
  const [selectors, setSelectors] = useState<string[]>([])

  const ctx = useMemo(() => ({ wallet: multiSigAddress, modules }), [multiSigAddress, modules])
  const excludeTarget = useCallback((address: string) => !isPickableTarget(address, ctx), [ctx])

  // Probe each target for ERC-20 metadata: a token target is where the
  // budget gives no protection, so it gets its own warning.
  const validTargets = targets.filter((t) => isAddress(t) && sessionTargetError(t, ctx) == null)
  const { data: tokenProbe } = useReadContracts({
    contracts: validTargets.flatMap((t) => [
      { chainId: chain?.id, address: t as `0x${string}`, abi: erc20Abi, functionName: 'decimals' as const },
      { chainId: chain?.id, address: t as `0x${string}`, abi: erc20Abi, functionName: 'symbol' as const }
    ]),
    allowFailure: true,
    query: { enabled: validTargets.length > 0 }
  })
  const tokenSymbolOf = (target: string): string | null => {
    const index = validTargets.findIndex((t) => t.toLowerCase() === target.toLowerCase())
    if (index < 0 || tokenProbe?.[index * 2]?.status !== 'success') return null
    const symbol = tokenProbe?.[index * 2 + 1]
    return symbol?.status === 'success' ? String(symbol.result) : 'token'
  }
  const tokenTargets = validTargets.filter((t) => tokenSymbolOf(t) != null)
  const tokenRisk = tokenTargets.length > 0 ? tokenTargetRisk(selectors.filter((s) => s !== '')) : null

  const nowSeconds = Math.floor(Date.now() / 1000)
  const input = {
    key,
    validAfter: startsAt === '' ? 0 : toUnix(startsAt),
    validUntil: toUnix(expiresAt),
    ethBudgetWei: budgetWei === '' ? '' : budgetWei,
    targets: targets.filter((t) => t !== ''),
    selectors: selectors.filter((s) => s !== '')
  }
  const error = grantError(input, ctx, nowSeconds)
  const targetHasError = targets.some((t) => t !== '' && sessionTargetError(t, ctx) != null)
  const touched = key !== '' || targets.some((t) => t !== '')

  let encoded: `0x${string}` | null = null
  if (error == null) {
    try {
      encoded = encodeGrantSessionKey(input)
    } catch {
      encoded = null
    }
  }

  const describe = () => {
    const until = new Date(input.validUntil * 1000).toLocaleString()
    return `Grant session key ${key} until ${until}: ${input.targets.length} target${input.targets.length === 1 ? '' : 's'}, ${
      input.selectors.length === 0
        ? 'any function'
        : `${input.selectors.length} selector${input.selectors.length === 1 ? '' : 's'}`
    }, native budget ${budgetWei} wei`
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <label className='text-sm font-semibold text-foreground'>Session key</label>
        <span className='text-xs text-muted-foreground'>
          The temporary signer: a hot wallet, a bot or an agent. It sends its own transactions and pays its own gas.
        </span>
        <AddressBookInput placeholder='Key address (0x...)' value={key} onChange={setKey} allowSave />
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='flex flex-col gap-1'>
          <label htmlFor='session-starts' className='text-sm font-semibold text-foreground'>
            Starts
          </label>
          <Input
            id='session-starts'
            type='datetime-local'
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <span className='text-xs text-muted-foreground'>Leave empty to start as soon as the grant executes.</span>
        </div>
        <div className='flex flex-col gap-1'>
          <label htmlFor='session-expires' className='text-sm font-semibold text-foreground'>
            Expires
          </label>
          <Input
            id='session-expires'
            type='datetime-local'
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <span className='text-xs text-muted-foreground'>
            The grant must execute before this time, so leave room for collecting signatures.
          </span>
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        <span className='text-sm font-semibold text-foreground'>Native budget</span>
        <EthersInput symbol={nativeSymbol} value={budgetWei} onChange={setBudgetWei} />
        <div className='mt-1 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-foreground'>
          <AlertTriangleIcon className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
          <span>
            This budget only caps native {nativeSymbol} sent with each call (the call&apos;s value). It does not count
            ERC-20 tokens: if a token contract is a target, the key can <code>transfer</code> or <code>approve</code>{' '}
            the wallet&apos;s whole balance of it without touching the budget. For token targets, restrict the allowed
            functions below to the ones the key really needs.
          </span>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-foreground'>Allowed targets</span>
          <span className='text-xs text-muted-foreground'>
            Contracts the key may call. The wallet itself, the session-key module and every module enabled on this
            wallet are not allowed.
            {allowlistOn && ' The wallet allowlist is on, so each target must also be allowlisted.'}
          </span>
        </div>
        {targets.map((target, index) => {
          const targetError = target === '' ? null : sessionTargetError(target, ctx)
          const symbol = targetError == null && target !== '' ? tokenSymbolOf(target) : null
          return (
            <div key={index} className='flex flex-col gap-1'>
              <div className='flex items-start gap-2'>
                <div className='min-w-0 flex-1'>
                  <AddressBookInput
                    placeholder='Target contract (0x...)'
                    value={target}
                    exclude={excludeTarget}
                    onChange={(next) => setTargets(targets.map((t, i) => (i === index ? next : t)))}
                  />
                </div>
                {targets.length > 1 && (
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Remove target'
                    onClick={() => setTargets(targets.filter((_, i) => i !== index))}
                  >
                    <XIcon className='h-4 w-4' />
                  </Button>
                )}
              </div>
              {targetError != null && <span className='text-xs text-destructive'>{targetError}</span>}
              {symbol != null && (
                <span className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                  ERC-20 token ({symbol}): transfers and approvals on it are not limited by the budget.
                </span>
              )}
            </div>
          )
        })}
        <Button variant='outline' size='sm' className='self-start' onClick={() => setTargets([...targets, ''])}>
          <PlusIcon className='h-4 w-4' /> Add target
        </Button>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-foreground'>Allowed functions</span>
          <span className='text-xs text-muted-foreground'>
            Optional. With none listed the key may call any function on its targets. The list applies to every target.
            Add &ldquo;Plain native transfer&rdquo; if the key should also send {nativeSymbol} without calldata.
          </span>
        </div>
        {selectors.map((selector, index) => (
          <div key={index} className='flex items-start gap-2'>
            <div className='min-w-0 flex-1'>
              <HexSelectorInput
                abis={[erc20Abi as Abi]}
                extra={SELECTOR_EXTRAS}
                value={selector}
                onChange={(next) => setSelectors(selectors.map((s, i) => (i === index ? next : s)))}
              />
            </div>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Remove function'
              onClick={() => setSelectors(selectors.filter((_, i) => i !== index))}
            >
              <XIcon className='h-4 w-4' />
            </Button>
          </div>
        ))}
        <Button variant='outline' size='sm' className='self-start' onClick={() => setSelectors([...selectors, ''])}>
          <PlusIcon className='h-4 w-4' /> Restrict to a function
        </Button>
        {tokenRisk === 'unrestricted' && (
          <p className='text-xs font-medium text-amber-700 dark:text-amber-300'>
            {tokenTargets.length === 1 ? 'A target is an ERC-20 token' : 'Some targets are ERC-20 tokens'} and no
            function restriction is set: the key could move the wallet&apos;s whole balance of{' '}
            {tokenTargets.length === 1 ? 'it' : 'them'}.
          </p>
        )}
        {tokenRisk === 'token-moving-selectors' && (
          <p className='text-xs font-medium text-amber-700 dark:text-amber-300'>
            The allowed functions include{' '}
            {TOKEN_MOVING_SELECTORS.filter((t) => selectors.some((s) => s.toLowerCase() === t.selector))
              .map((t) => t.label.split('(')[0])
              .join(', ')}
            : on a token target that lets the key move the wallet&apos;s balance of it with no cap.
          </p>
        )}
      </div>

      {/* Target problems are already shown under the offending field. */}
      {touched && error != null && !targetHasError && <p className='text-sm text-destructive'>{error}</p>}
      {encoded != null && (
        <SignRequest
          multiSigAddress={multiSigAddress}
          description={describe()}
          args={{
            to: SESSION_KEY_MODULE_ADDRESS,
            value: '0',
            data: encoded,
            txnGas: grantGas(input.targets.length, input.selectors.length),
            signatures: ''
          }}
        />
      )}
    </div>
  )
}

export default GrantSessionKeyForm
