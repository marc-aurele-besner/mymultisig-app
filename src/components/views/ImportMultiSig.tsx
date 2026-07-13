import React, { useState, useEffect } from 'react'
import { useChainId, useChains } from 'wagmi'

import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ImportMultiSigForm from '../forms/ImportMultiSigForm'
import DiscoverMultiSigs from '../forms/DiscoverMultiSigs'
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
      <BigCard className="min-h-[50vh] max-w-[1200px]">
        <div className="flex flex-col items-center">
          <h2 className="pb-4 text-2xl font-bold text-foreground">
            Import your existing MultiSig
          </h2>
          {multiSigFactory != null ? (
            <div className="flex w-full flex-col gap-8">
              <ImportMultiSigForm factory={multiSigFactory} />
              <div className="w-full border-t border-border" />
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
