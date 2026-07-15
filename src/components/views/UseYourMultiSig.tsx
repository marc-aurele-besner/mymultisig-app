import React, { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount, useChainId, useChains } from 'wagmi'
import { AddIcon, ImportIcon, DeleteIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TypedEyebrow, WordReveal } from '@/components/ui/reveal'
import BigCard from '../cards/BigCard'
import ConnectWallet from './ConnectWallet'
import MultiSigList from '../multiSigDetails/MultiSigList'
import NetworkIcon from '../icons/NetworkIcon'
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col gap-8"
        >
          <motion.div variants={itemVariants}>
            <TypedEyebrow text="YOUR MULTISIGS" className="mb-3" />
            <WordReveal
              text="Open a multisig"
              delay={0.2}
              className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl"
            />
            {chain && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <NetworkIcon chainId={chain.id} name={chain.name} size={16} />
                  {chain.name}
                </span>
                {isConnected && (
                  <>
                    <span aria-hidden className="text-border">/</span>
                    <span className="font-mono text-xs">
                      {filteredMultiSigs.length} saved in this browser
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>

          {!isConnected || address === undefined ? (
            <motion.div variants={itemVariants} className="rounded-xl border border-border bg-muted/30 p-6">
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Connect a wallet to see the multisigs saved in this browser and open them.
              </p>
              <ConnectWallet />
            </motion.div>
          ) : (
            <Fragment>
              {filteredMultiSigs.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border p-6 md:p-8"
                >
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      No multisigs on {chain?.name ?? 'this network'} yet
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Create a new one, or import one you already own. Multisigs on other networks
                      show up when you switch network in the header.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/createMultiSig" className="gap-2">
                        <AddIcon className="h-4 w-4" />
                        Create a multisig
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/importMultiSig" className="gap-2">
                        <ImportIcon className="h-4 w-4" />
                        Import a multisig
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="flex w-full flex-col gap-2.5">
                  {filteredMultiSigs.map((multiSig, index) => (
                    <motion.div
                      key={`${multiSig.address}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <MultiSigList multiSigAddress={multiSig.address} address={address} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-3 border-t border-border pt-6"
              >
                {filteredMultiSigs.length > 0 && (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/createMultiSig" className="gap-2">
                        <AddIcon className="h-4 w-4" />
                        Create a multisig
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/importMultiSig" className="gap-2">
                        <ImportIcon className="h-4 w-4" />
                        Import a multisig
                      </Link>
                    </Button>
                  </>
                )}
                {multiSigs.length > 0 && (
                  <Button
                    variant="ghost"
                    className="ml-auto gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => clearAllMultiSig()}
                  >
                    <DeleteIcon className="h-4 w-4" />
                    Remove all from this browser
                  </Button>
                )}
              </motion.div>
            </Fragment>
          )}
        </motion.div>
      </BigCard>
    </div>
  )
}

export default UseYourMultiSig
