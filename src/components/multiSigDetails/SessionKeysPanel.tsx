import React, { useState } from 'react'
import { encodeFunctionData, formatUnits, type Abi } from 'viem'
import { useAccount, useChainId, useChains } from 'wagmi'
import MyMultiSigExtended from 'mymultisig-contract/abi/MyMultiSigExtended.json'
import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import AddressRow from '../common/AddressRow'
import SectionCard from '../common/SectionCard'
import AddressBookInput from '../inputs/AddressBookInput'
import SignRequest from '../buttons/SignRequest'
import GrantSessionKeyForm from '../forms/GrantSessionKeyForm'
import useSessionKeys, { SessionKeyEntry } from '../../hooks/useSessionKeys'
import { PLAIN_TRANSFER_SELECTOR, TOKEN_MOVING_SELECTORS } from '../../utils/sessionKeys'
import { useAddressLabels } from '../../states/addressBook'
import { SESSION_KEY_MODULE_ADDRESS } from '../../constants/abi/sessionKeyModule'

interface SessionKeysPanelProps {
  multiSigAddress: `0x${string}`
  owners: string[]
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)

const STATUS_STYLE: Record<SessionKeyEntry['status'], [string, string]> = {
  active: ['Active', 'bg-primary text-primary-foreground'],
  scheduled: ['Scheduled', 'bg-amber-500/15 text-amber-700 dark:text-amber-300'],
  expired: ['Expired', 'bg-muted text-muted-foreground'],
  none: ['Revoked', 'bg-muted text-muted-foreground']
}

const formatTime = (seconds: number) => new Date(seconds * 1000).toLocaleString()

const selectorName = (selector: string) => {
  if (selector.toLowerCase() === PLAIN_TRANSFER_SELECTOR) return 'plain native transfer'
  const known = TOKEN_MOVING_SELECTORS.find((t) => t.selector === selector.toLowerCase())
  return known != null ? known.label.split('(')[0] : selector
}

// Session keys (SessionKeyModule): temporary signers bounded by a time
// window, a target allowlist, an optional function allowlist and a native
// budget. Granting is a threshold-signed request; any single owner can
// revoke a key at once.
const SessionKeysPanel: React.FC<SessionKeysPanelProps> = ({ multiSigAddress, owners }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const nativeSymbol = chain?.nativeCurrency.symbol ?? 'ETH'
  const decimals = chain?.nativeCurrency.decimals ?? 18
  const { address } = useAccount()
  const { labelFor } = useAddressLabels(chainId)
  const isOwner = address != null && owners.some((o) => o.toLowerCase() === address.toLowerCase())
  const {
    supportsModules,
    moduleLoading,
    moduleDeployed,
    deployerAvailable,
    moduleEnabled,
    modules,
    allowlistOn,
    entries,
    logsLoading,
    logsPartial,
    deployModule,
    isDeploying,
    revoke,
    revoking,
    lookUp,
    refresh
  } = useSessionKeys(multiSigAddress)
  const [lookup, setLookup] = useState('')
  const [showGrant, setShowGrant] = useState(false)

  const intro = (
    <p className='text-sm leading-relaxed text-muted-foreground'>
      A session key is a temporary signer that can call chosen contracts for a limited time, without collecting owner
      signatures for each call. Use it for a trading bot, an agent or a hot wallet.
    </p>
  )

  if (!supportsModules) {
    return (
      <SectionCard title='Session keys'>
        {intro}
        <p className='mt-2 text-sm text-muted-foreground'>
          Session keys run as a module, and this wallet has no module support (it needs a 0.5.0 Extended wallet).
        </p>
      </SectionCard>
    )
  }

  if (moduleLoading) {
    return (
      <SectionCard title='Session keys'>
        <p className='text-sm text-muted-foreground'>
          Checking the session-key module on {chain?.name ?? 'this network'}…
        </p>
      </SectionCard>
    )
  }

  if (!moduleDeployed) {
    return (
      <SectionCard title='Session keys'>
        <div className='flex flex-col gap-3'>
          {intro}
          <p className='text-sm text-muted-foreground'>
            The session-key module is not deployed on {chain?.name ?? 'this network'} yet. It is one shared contract at
            the same address on every network (<span className='break-all font-mono'>{SESSION_KEY_MODULE_ADDRESS}</span>
            ), and anyone can deploy it: the deployment has no owner and grants nothing to whoever sends it.
          </p>
          {deployerAvailable ? (
            <Button className='self-start' onClick={() => deployModule()} disabled={isDeploying || address == null}>
              {isDeploying ? 'Deploying…' : 'Deploy the session-key module'}
            </Button>
          ) : (
            <p className='text-sm text-destructive'>
              This network has no canonical CREATE2 deployer (0x4e59…956C), so the module cannot be deployed at its
              shared address here.
            </p>
          )}
        </div>
      </SectionCard>
    )
  }

  if (!moduleEnabled) {
    const data = encodeFunctionData({
      abi: MyMultiSigExtended as Abi,
      functionName: 'enableModule',
      args: [SESSION_KEY_MODULE_ADDRESS]
    })
    return (
      <SectionCard title='Session keys'>
        <div className='flex flex-col gap-3'>
          {intro}
          <p className='text-sm text-muted-foreground'>
            First enable the session-key module on this wallet. This is a multisig request like any other. Once enabled,
            the module can only act through keys the owners grant, and only within each grant&apos;s limits.
          </p>
          {allowlistOn && (
            <p className='text-sm text-amber-700 dark:text-amber-300'>
              The wallet allowlist is on: also allow the module address and every future session target, or the grant
              and the key&apos;s calls will be blocked.
            </p>
          )}
          {isOwner ? (
            <SignRequest
              multiSigAddress={multiSigAddress}
              description={`Enable the session-key module ${SESSION_KEY_MODULE_ADDRESS}`}
              args={{ to: multiSigAddress, value: '0', data, txnGas: '75000', signatures: '' }}
            />
          ) : (
            <p className='text-sm text-muted-foreground'>Connect an owner wallet to propose enabling it.</p>
          )}
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title='Session keys'
      action={
        <Button variant='ghost' size='sm' onClick={refresh} aria-label='Refresh session keys'>
          <RefreshCwIcon className={cn('h-4 w-4', logsLoading && 'animate-spin')} />
        </Button>
      }
    >
      <div className='flex flex-col gap-5'>
        {intro}

        <div className='flex flex-col gap-2'>
          {entries.length === 0 && !logsLoading && (
            <p className='text-sm text-muted-foreground'>No session keys granted yet.</p>
          )}
          {entries.map((entry) => {
            const [statusLabel, statusClass] = STATUS_STYLE[entry.status]
            const live = entry.status === 'active' || entry.status === 'scheduled'
            return (
              <div key={entry.key} className='flex flex-col gap-2 rounded-lg border border-border p-3'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <AddressRow address={entry.key} label={labelFor(entry.key)} />
                  <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', statusClass)}>{statusLabel}</span>
                </div>
                {entry.record != null && live && (
                  <dl className='grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2'>
                    <div>
                      <dt className='inline'>Window: </dt>
                      <dd className='inline text-foreground'>
                        {entry.record.validAfter === 0 ? 'from grant' : formatTime(entry.record.validAfter)} →{' '}
                        {formatTime(entry.record.validUntil)}
                      </dd>
                    </div>
                    <div>
                      <dt className='inline'>Native budget left: </dt>
                      <dd className='inline text-foreground'>
                        {formatUnits(entry.remaining ?? 0n, decimals)} / {formatUnits(entry.record.ethBudget, decimals)}{' '}
                        {nativeSymbol}
                      </dd>
                    </div>
                    <div className='sm:col-span-2'>
                      <dt className='inline'>Functions: </dt>
                      <dd className='inline text-foreground'>
                        {entry.record.restrictSelectors
                          ? entry.selectors.length > 0
                            ? entry.selectors.map(selectorName).join(', ')
                            : 'restricted'
                          : 'any function on its targets'}
                      </dd>
                    </div>
                    {entry.targets.length > 0 && (
                      <div className='flex flex-col gap-1 sm:col-span-2'>
                        <dt>Targets:</dt>
                        {entry.targets.map((target) => (
                          <dd key={target}>
                            <AddressRow address={target} label={labelFor(target)} />
                          </dd>
                        ))}
                      </div>
                    )}
                  </dl>
                )}
                {live && isOwner && (
                  <Button
                    variant='destructive'
                    size='sm'
                    className='self-start'
                    disabled={revoking != null}
                    onClick={() => revoke(entry.key)}
                  >
                    {revoking === entry.key ? 'Revoking…' : 'Revoke now'}
                  </Button>
                )}
              </div>
            )
          })}
          {logsPartial && (
            <p className='text-xs text-muted-foreground'>
              This network&apos;s RPC limits log queries, so older grants may be missing. Look a key up by address:
            </p>
          )}
          <div className='flex flex-wrap items-start gap-2'>
            <div className='min-w-0 flex-1'>
              <AddressBookInput placeholder='Look up a key (0x...)' value={lookup} onChange={setLookup} />
            </div>
            <Button
              variant='outline'
              disabled={!isAddress(lookup)}
              onClick={() => {
                lookUp(lookup as `0x${string}`)
                setLookup('')
              }}
            >
              Look up
            </Button>
          </div>
          {isOwner && (
            <p className='text-xs text-muted-foreground'>
              Any single owner can revoke a key immediately, without other signatures.
            </p>
          )}
        </div>

        <div className='flex flex-col gap-3 border-t border-border pt-4'>
          {isOwner ? (
            showGrant ? (
              <>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-semibold text-foreground'>New session key</span>
                  <Button variant='ghost' size='sm' onClick={() => setShowGrant(false)}>
                    Cancel
                  </Button>
                </div>
                <GrantSessionKeyForm multiSigAddress={multiSigAddress} modules={modules} allowlistOn={allowlistOn} />
              </>
            ) : (
              <Button className='self-start' onClick={() => setShowGrant(true)}>
                Grant a session key
              </Button>
            )
          ) : (
            <p className='text-sm text-muted-foreground'>Connect an owner wallet to grant or revoke session keys.</p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

export default SessionKeysPanel
