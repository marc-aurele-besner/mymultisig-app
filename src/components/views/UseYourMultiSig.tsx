import React, { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { DownloadIcon, DeleteIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import BigCard from '../cards/BigCard'
import ErrorCard from '../cards/ErrorCard'
import ConnectWallet from './ConnectWallet'
import MultiSigList from '../multiSigDetails/MultiSigList'
import useMultiSigs from '../../states/multiSigs'

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

const UseYourMultiSig: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false)
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { multiSigs, clearAllMultiSig } = useMultiSigs()

  const filteredMultiSigs = chain ? multiSigs.filter((m) => m.chainId === chain.id) : []

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[1000px]">
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
                  Your MultiSig Wallets
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and interact with your multi-signature wallets
              </p>
            </motion.div>

            {!isConnected || address === undefined ? (
              <motion.div variants={itemVariants} className="w-full">
                <div className="flex flex-col gap-4">
                  <ErrorCard>Please connect your wallet first</ErrorCard>
                  <div className="w-full rounded-xl border border-border bg-muted/30 p-6">
                    <ConnectWallet />
                  </div>
                </div>
              </motion.div>
            ) : (
              <Fragment>
                {filteredMultiSigs.length === 0 ? (
                  <motion.div variants={itemVariants} className="w-full">
                    <div className="w-full rounded-xl border border-border bg-muted/30 p-6 text-center">
                      <p className="mb-2 text-lg text-foreground">No MultiSig wallets found</p>
                      <p className="text-sm text-muted-foreground">
                        You don&apos;t have any multi-signature contracts on this network yet. Create
                        one or import an existing one to get started.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="flex w-full flex-col gap-3">
                    <span className="self-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Select a MultiSig
                    </span>
                    {filteredMultiSigs.map((multiSig, index) => (
                      <motion.div
                        key={`${multiSig.address}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="w-full"
                      >
                        <MultiSigList multiSigAddress={multiSig.address} address={address} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.div
                  variants={itemVariants}
                  className="w-full border-t border-border pt-4"
                >
                  <span className="self-start text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </span>
                  <div className="mt-3 flex w-full flex-wrap gap-3">
                    <Button variant="outline" size="default" asChild>
                      <Link href="/importMultiSig" className="gap-2">
                        <DownloadIcon className="h-4 w-4" />
                        Import a MultiSig
                      </Link>
                    </Button>
                    {multiSigs.length > 0 && (
                      <Button
                        variant="outline"
                        size="default"
                        className="gap-2 border-destructive/50 bg-destructive/15 text-destructive hover:bg-destructive/25"
                        onClick={() => clearAllMultiSig()}
                      >
                        <DeleteIcon className="h-4 w-4" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </motion.div>
              </Fragment>
            )}
          </motion.div>
        </div>
      </BigCard>
    </div>
  )
}

export default UseYourMultiSig
