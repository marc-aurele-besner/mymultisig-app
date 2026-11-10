import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import { motion } from 'framer-motion'

import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
import NetworkIcon from '../icons/NetworkIcon'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import CreateMultiSigForm from '../forms/CreateMultiSigForm'
import multiSigFactories from '../../constants/multiSigFactory'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
}

const CreateMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected: walletConnected, address } = useAccount()
  // Wallet state only exists in the browser: until mounted, render the
  // disconnected variant so the heading and copy are in the static HTML.
  const isConnected = hasMounted && walletConnected
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const multiSigFactory = multiSigFactories.find((f) => f.chainId === chain?.id)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex w-full flex-col gap-6">
      <motion.div variants={itemVariants} className="w-full">
        <TypedEyebrow text="NEW SHARED WALLET" className="mb-3" />
        <WordReveal
          text="Create your multisig"
          delay={0.2}
          className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        />
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {hasMounted && chain && (
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <NetworkIcon chainId={chain.id} name={chain.name} size={16} />
              {chain.name}
            </span>
          )}
          <span>Pick the owners and how many must approve. Deploying is one transaction.</span>
        </p>
      </motion.div>

      {!isConnected || address === undefined || multiSigFactory === undefined ? (
        <motion.div variants={itemVariants} className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {(!isConnected || address === undefined) && <ErrorCard>Please connect your wallet first</ErrorCard>}
          {multiSigFactory === undefined && isConnected && (
            <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
          )}
          <div className="w-full rounded-xl border border-border bg-card p-6">
            <ConnectWallet />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="w-full">
          <CreateMultiSigForm owner01={address.toString()} factory={multiSigFactory} />
        </motion.div>
      )}
    </motion.div>
  )
}

export default CreateMultiSig
