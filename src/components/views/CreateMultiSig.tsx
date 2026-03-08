import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, useChains } from 'wagmi'
import { motion } from 'framer-motion'

import BigCard from '../cards/BigCard'
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
  const { isConnected, address } = useAccount()
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
      <BigCard className="min-h-[60vh] max-w-[900px]">
        <div className="flex w-full justify-center py-4 md:py-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col gap-6"
          >
            <motion.div variants={itemVariants} className="w-full text-center">
              <h1 className="mb-2 text-2xl font-extrabold md:text-4xl">
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Create Your MultiSig
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Set up a new multi-signature wallet in just a few steps
              </p>
            </motion.div>

            {!isConnected || address === undefined || multiSigFactory === undefined ? (
              <motion.div variants={itemVariants} className="w-full">
                <div className="flex flex-col gap-4">
                  {(!isConnected || address === undefined) && (
                    <ErrorCard>Please connect your wallet first</ErrorCard>
                  )}
                  {multiSigFactory === undefined && isConnected && (
                    <ErrorCard>No MultiSig Factory contract detected on this network</ErrorCard>
                  )}
                  <div className="w-full rounded-xl border border-border bg-muted/30 p-6">
                    <ConnectWallet />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} className="w-full">
                <CreateMultiSigForm
                  owner01={address.toString()}
                  factory={multiSigFactory}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </BigCard>
    </div>
  )
}

export default CreateMultiSig
