import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAccount, useChainId } from 'wagmi'
import { LockIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import AddressRow from '../common/AddressRow'
import SectionCard from '../common/SectionCard'

import AdminActionForm from '../forms/AdminActionForm'
import ExtendedGovernancePanel from '../multiSigDetails/ExtendedGovernancePanel'
import AdvancedFeaturesPanel from '../multiSigDetails/AdvancedFeaturesPanel'
import SpendingAllowancePanel from '../multiSigDetails/SpendingAllowancePanel'
import MessageSigningPanel from '../multiSigDetails/MessageSigningPanel'
import AccountAbstractionPanel from '../multiSigDetails/AccountAbstractionPanel'
import MultiSigRpcPanel from '../multiSigDetails/MultiSigRpcPanel'
import { isModernWallet } from '../../utils/contractVersions'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import useAdminEventSync from '../../hooks/useAdminEventSync'
import useMultiSigs from '../../states/multiSigs'
import { useAddressLabels } from '../../states/addressBook'
import { EOL_NONCE_THRESHOLD } from '../../constants/limits'

interface MultiSigSettingsProps {
  multiSigAddress: `0x${string}`
}

const SECTIONS = [
  { id: 'owners', label: 'Owners & administration' },
  { id: 'governance', label: 'Governance' },
  { id: 'signing', label: 'Allowance & signing' },
  { id: 'aa', label: 'Account abstraction' },
  { id: 'connection', label: 'Connection' }
] as const

type SectionId = (typeof SECTIONS)[number]['id']

// Shown in place of a panel the wallet cannot use, so the feature and what
// it needs stay discoverable instead of silently missing.
const Locked: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className='flex items-start gap-3 rounded-xl border border-dashed border-border p-5'>
    <LockIcon className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
    <div>
      <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
      <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{children}</p>
    </div>
  </div>
)

// Settings tab content; the wallet header and tab navigation come from
// MultiSigPageLayout. The panels are grouped into sections (?section=) so the
// page is not one long scroll.
const MultiSigSettings: React.FC<MultiSigSettingsProps> = ({ multiSigAddress }) => {
  const router = useRouter()
  const { address } = useAccount()
  const chainId = useChainId()
  const { labelFor } = useAddressLabels(chainId)
  const { multiSigDetails, data, onChainOwners, refetchOwners } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  const { walletType } = useWalletType(multiSigAddress)
  const { multiSigs } = useMultiSigs()
  useAdminEventSync(multiSigAddress, refetchOwners)
  const stored = multiSigs.find((m) => m.address.toLowerCase() === multiSigAddress.toLowerCase())
  // 0.5.0 wallets report the authoritative list via getOwners(); older
  // deployments fall back to the locally tracked one.
  const owners = onChainOwners ?? stored?.owners ?? []

  if (multiSigDetails == null) return null

  const nonceRaw = data != null ? BigInt(data[4] as bigint) : 0n
  const nearEndOfLife = nonceRaw >= EOL_NONCE_THRESHOLD

  const extended = walletType === 'extended'
  const modern = isModernWallet(multiSigDetails.version)
  const requested = typeof router.query.section === 'string' ? router.query.section : ''
  // Existing links (RPC error toast, /settings/rpc) point at the #rpc anchor,
  // which lives in the Connection section.
  const section: SectionId = SECTIONS.some((s) => s.id === requested)
    ? (requested as SectionId)
    : router.asPath.endsWith('#rpc')
      ? 'connection'
      : 'owners'

  return (
    <div className='flex w-full flex-col gap-6'>
      {nearEndOfLife && (
        <div className='w-full rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive'>
          This wallet is approaching its end of life: fewer than 1000 transaction nonces remain. Plan a migration to a
          new wallet.
        </div>
      )}

      <div className='grid items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8'>
        <nav
          aria-label='Settings sections'
          className='-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0'
        >
          {SECTIONS.map((item) => (
            <Link
              key={item.id}
              href={{ pathname: router.pathname, query: { ...router.query, section: item.id } }}
              scroll={false}
              aria-current={section === item.id ? 'page' : undefined}
              className={cn(
                'flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-md px-2.5 text-sm transition-colors',
                section === item.id
                  ? 'bg-primary/15 font-semibold text-foreground'
                  : 'font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='flex min-w-0 flex-col gap-4'>
          {section === 'owners' && (
            <>
              <SectionCard
                title='Owners'
                flush
                action={
                  <span className='font-mono text-xs text-muted-foreground'>
                    {multiSigDetails.threshold} of {multiSigDetails.ownerCount} to execute
                  </span>
                }
              >
                {owners.length > 0 ? (
                  <ul className='divide-y divide-border'>
                    {owners.map((owner) => (
                      <li key={owner} className='px-5 py-3'>
                        <AddressRow
                          address={owner}
                          label={labelFor(owner)}
                          full
                          isYou={address != null && owner.toLowerCase() === address.toLowerCase()}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='p-5 text-sm text-muted-foreground'>
                    Wallets deployed before 0.5.0 store owners as a bare mapping (no getOwners()), so the app tracks
                    the list locally: it is seeded at create/import time and kept in sync from the wallet&apos;s
                    OwnerAdded / OwnerRemoved events as owner operations execute. {multiSigDetails.ownerCount} owner
                    {multiSigDetails.ownerCount === 1 ? ' is' : 's are'} registered on-chain.
                  </p>
                )}
              </SectionCard>
              <AdminActionForm multiSigAddress={multiSigAddress} />
            </>
          )}

          {section === 'governance' &&
            (extended ? (
              <>
                <ExtendedGovernancePanel multiSigAddress={multiSigAddress} owners={owners} />
                {/* 0.5.0 surface: the panel hides itself when the wallet lacks it. */}
                <AdvancedFeaturesPanel multiSigAddress={multiSigAddress} />
              </>
            ) : (
              <Locked title='Governance needs an Extended wallet'>
                Owner-only requests, nonce burning, nonce pinning, seat delegation, and the 0.5.0 protections
                (timelock, guard, allowlist, modules) are part of the Extended wallet type. This wallet is Simple.
              </Locked>
            ))}

          {section === 'signing' && (
            <>
              {extended ? (
                <SpendingAllowancePanel multiSigAddress={multiSigAddress} />
              ) : (
                <Locked title='Spending allowances need an Extended wallet'>
                  A daily allowance lets one owner send small amounts with only their own signature.
                </Locked>
              )}
              {modern ? (
                <MessageSigningPanel multiSigAddress={multiSigAddress} />
              ) : (
                <Locked title='Message signing needs version 0.5.0'>
                  This wallet predates 0.5.0 and has no on-chain message registry (EIP-1271).
                </Locked>
              )}
              {extended && (
                <p className='text-xs text-muted-foreground'>
                  The allowance panel only appears once an owner has a daily cap. Set one under Owners &amp;
                  administration.
                </p>
              )}
            </>
          )}

          {section === 'aa' &&
            (extended ? (
              <>
                <AccountAbstractionPanel multiSigAddress={multiSigAddress} />
                <p className='text-xs text-muted-foreground'>
                  The panel only appears on wallets deployed with an ERC-4337 EntryPoint (0.5.0 Extended).
                </p>
              </>
            ) : (
              <Locked title='Account abstraction needs an Extended wallet'>
                Bundler submission, gas deposits and paymasters (ERC-4337) are available on 0.5.0 Extended wallets.
              </Locked>
            ))}

          {section === 'connection' && <MultiSigRpcPanel multiSigAddress={multiSigAddress} />}
        </div>
      </div>
    </div>
  )
}

export default MultiSigSettings
