import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useChainId } from 'wagmi'

import RpcUrlField from '../inputs/RpcUrlField'
import useRpcConfig, { multisigRpcKey } from '../../states/rpcConfig'
import { RPC_SETTINGS_PATH } from '../../lib/rpc/rpcError'

interface MultiSigRpcPanelProps {
  multiSigAddress: `0x${string}`
}

// Settings tab section (anchor #rpc, the target of the RPC error toast) for a
// custom RPC URL used only while this multisig is open.
const MultiSigRpcPanel: React.FC<MultiSigRpcPanelProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const ref = useRef<HTMLElement>(null)
  const value = useRpcConfig((state) => state.byMultisig[multisigRpcKey(chainId, multiSigAddress)])
  const setMultisigRpcUrl = useRpcConfig((state) => state.setMultisigRpcUrl)

  // The settings tab renders after the wallet details load, so the browser's
  // own #rpc scroll has already run by the time this section exists.
  useEffect(() => {
    if (window.location.hash === '#rpc') ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section id='rpc' ref={ref} className='flex w-full scroll-mt-24 flex-col gap-3 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>RPC endpoint</h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          Use your own RPC URL for this multisig instead of the public one. It is stored only in this browser and
          overrides the URL saved for your wallet in{' '}
          <Link href={RPC_SETTINGS_PATH} className='text-foreground underline underline-offset-4'>
            RPC settings
          </Link>
          .
        </p>
      </div>
      <RpcUrlField
        id={`multisig-rpc-url-${multiSigAddress}`}
        label='RPC URL'
        chainId={chainId}
        value={value}
        onSave={(url) => setMultisigRpcUrl(chainId, multiSigAddress, url)}
      />
    </section>
  )
}

export default MultiSigRpcPanel
