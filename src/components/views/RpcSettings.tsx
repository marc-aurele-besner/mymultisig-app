import React from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'

import BigCard from '../cards/BigCard'
import RpcUrlField from '../inputs/RpcUrlField'
import { Button } from '@/components/ui/button'
import useRpcConfig, { parseMultisigRpcKey } from '../../states/rpcConfig'
import truncateAddress from '../../utils/truncateAddress'

// /settings/rpc: custom RPC URLs for the connected wallet (one per chain) and
// an overview of the per-multisig URLs saved from each multisig's settings tab.
const RpcSettings: React.FC = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const queryClient = useQueryClient()
  const byWallet = useRpcConfig((state) => state.byWallet)
  const byMultisig = useRpcConfig((state) => state.byMultisig)
  const setWalletRpcUrl = useRpcConfig((state) => state.setWalletRpcUrl)
  const setMultisigRpcUrl = useRpcConfig((state) => state.setMultisigRpcUrl)

  const walletUrls = address != null ? (byWallet[address.toLowerCase()] ?? {}) : {}
  const currentChain = chains.find((c) => c.id === chainId)
  const otherChains = chains.filter((c) => c.id !== chainId)
  const configuredElsewhere = otherChains.filter((c) => walletUrls[c.id] != null).length
  const multisigEntries = Object.entries(byMultisig)
    .map(([key, url]) => ({ key, url, parsed: parseMultisigRpcKey(key) }))
    .filter((entry) => entry.parsed != null)

  const fieldFor = (chain: { id: number; name: string }) =>
    address != null && (
      <RpcUrlField
        key={chain.id}
        id={`rpc-url-${chain.id}`}
        label={`${chain.name} (chain ${chain.id})`}
        chainId={chain.id}
        value={walletUrls[chain.id]}
        onSave={(url) => setWalletRpcUrl(address, chain.id, url)}
      />
    )

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1000px]'>
        <div className='flex w-full flex-col gap-6'>
          <div>
            <p className='mb-3 font-mono text-xs tracking-[0.2em] text-primary'>SETTINGS</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>RPC endpoints</h1>
            <p className='mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground'>
              The app reads the chain through public RPCs, which rate limit quickly. Save your own RPC URL (Alchemy,
              Infura, QuickNode, a self-hosted node…) to use instead. URLs are stored only in this browser and are
              tested against the network before they are saved. If your endpoint fails, the app falls back to the
              default one.
            </p>
          </div>

          <section className='flex flex-col gap-4 rounded-lg border border-border p-4'>
            <div>
              <h2 className='text-xl font-bold text-foreground'>For your wallet</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                Used for every request the app makes while this wallet is connected
                {address != null && (
                  <>
                    {' '}
                    (<span className='font-mono text-foreground'>{truncateAddress(address)}</span>)
                  </>
                )}
                .
              </p>
            </div>

            {address == null ? (
              <p className='text-sm text-muted-foreground'>Connect a wallet to save RPC URLs for it.</p>
            ) : (
              <>
                {currentChain != null && fieldFor(currentChain)}
                <details className='group rounded-md border border-border p-3'>
                  <summary className='cursor-pointer text-sm font-medium text-foreground'>
                    Other networks
                    {configuredElsewhere > 0 && (
                      <span className='ml-2 text-muted-foreground'>({configuredElsewhere} configured)</span>
                    )}
                  </summary>
                  <div className='mt-4 flex flex-col gap-5'>{otherChains.map(fieldFor)}</div>
                </details>
              </>
            )}
          </section>

          <section className='flex flex-col gap-4 rounded-lg border border-border p-4'>
            <div>
              <h2 className='text-xl font-bold text-foreground'>For a multisig</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                A multisig RPC URL wins over the wallet one while that multisig is open. Set it from the multisig&apos;s
                Settings tab.
              </p>
            </div>
            {multisigEntries.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No multisig has a custom RPC URL yet.</p>
            ) : (
              <ul className='flex flex-col gap-3'>
                {multisigEntries.map(({ key, url, parsed }) => (
                  <li
                    key={key}
                    className='flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between'
                  >
                    <div className='min-w-0'>
                      <Link
                        href={`/multisig/${parsed!.multisig}/settings#rpc`}
                        className='font-mono text-sm text-foreground underline-offset-4 hover:underline'
                      >
                        {truncateAddress(parsed!.multisig)}
                      </Link>
                      <span className='ml-2 text-xs text-muted-foreground'>
                        {chains.find((c) => c.id === parsed!.chainId)?.name ?? `chain ${parsed!.chainId}`}
                      </span>
                      <p className='truncate font-mono text-xs text-muted-foreground'>{url}</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setMultisigRpcUrl(parsed!.chainId, parsed!.multisig, null)
                        void queryClient.invalidateQueries()
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </BigCard>
    </div>
  )
}

export default RpcSettings
