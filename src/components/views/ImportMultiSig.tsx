import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useChainId, useChains } from 'wagmi'
import { InfoIcon } from 'lucide-react'

import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <TypedEyebrow text="ADD EXISTING WALLET" className="mb-3" />
        <WordReveal
          text="Import a multisig"
          delay={0.2}
          className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        />
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {hasMounted && chain && (
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <NetworkIcon chainId={chain.id} name={chain.name} size={16} />
              {chain.name}
            </span>
          )}
          <span>A multisig lives on-chain. Importing only tells this browser where to find it.</span>
        </p>
      </header>

      {/* DiscoverMultiSigs reads the saved multisigs in this browser: mount it client-side only */}
      {!hasMounted ? null : multiSigFactory != null ? (
        <>
          <section className="rounded-xl border border-border bg-card p-5 md:p-6">
            <ImportMultiSigForm factory={multiSigFactory} />
          </section>

          <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              The wallet has to be on the network selected in the top bar. Not sure which address to paste? Ask an
              owner for it, or read{' '}
              <Link href="/docs/import-a-multisig" className="text-primary underline-offset-4 hover:underline">
                the import guide
              </Link>
              .
            </span>
          </p>

          <DiscoverMultiSigs factory={multiSigFactory} />
        </>
      ) : (
        <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
      )}
    </div>
  )
}

export default ImportMultiSig
