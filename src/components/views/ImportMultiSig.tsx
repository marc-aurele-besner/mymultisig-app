import React, { useState, useEffect } from 'react'
import { useChainId, useChains } from 'wagmi'

import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ImportMultiSigForm from '../forms/ImportMultiSigForm'
import DiscoverMultiSigs from '../forms/DiscoverMultiSigs'
import NetworkIcon from '../icons/NetworkIcon'
import multiSigFactories from '../../constants/multiSigFactory'

const ImportMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const multiSigFactory = multiSigFactories.find((f) => f.chainId === chain?.id)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[900px]">
        <div className="flex w-full flex-col gap-10">
          <div>
            <TypedEyebrow text="ADD EXISTING WALLET" className="mb-3" />
            <WordReveal
              text="Import a multisig"
              delay={0.2}
              className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            />
            {chain && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <NetworkIcon chainId={chain.id} name={chain.name} size={16} />
                {chain.name}
              </div>
            )}
          </div>

          {multiSigFactory != null ? (
            <div className="flex w-full flex-col gap-10">
              <ImportMultiSigForm factory={multiSigFactory} />
              <DiscoverMultiSigs factory={multiSigFactory} />
            </div>
          ) : (
            <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
          )}
        </div>
      </BigCard>
    </div>
  )
}

export default ImportMultiSig
