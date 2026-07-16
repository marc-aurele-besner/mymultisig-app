import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AddIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import networks from '../../constants/networks'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
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

const mainnets = networks.filter((chain) => !chain.testnet)
const testnets = networks.filter((chain) => chain.testnet)

const NetworkGrid: React.FC<{ chains: typeof networks }> = ({ chains }) => (
  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {chains.map((chain) => (
      <motion.div
        key={chain.id}
        variants={itemVariants}
        className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-5"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{chain.name}</h3>
          <span className="font-mono text-xs text-muted-foreground/70">#{chain.id}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Native currency: <span className="font-mono text-xs">{chain.nativeCurrency.symbol}</span>
        </p>
        {chain.blockExplorers?.default && (
          <a
            href={chain.blockExplorers.default.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {chain.blockExplorers.default.name}
            <ExternalLinkIcon boxSize={12} className="shrink-0" />
          </a>
        )}
      </motion.div>
    ))}
  </div>
)

const Networks: React.FC = () => {
  return (
    <div className="flex justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[1200px] flex-col gap-8 py-4 md:gap-10 md:py-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-primary">SUPPORTED NETWORKS</p>
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            One multisig, {mainnets.length} EVM mainnets
          </h1>
          <p className="mx-auto max-w-[700px] text-lg font-medium leading-relaxed text-foreground md:text-xl">
            MyMultiSig deploys the same open-source contract on every supported network, so a wallet works the same way
            on Ethereum as it does on Polygon, Arbitrum, or Gnosis.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mx-auto max-w-[800px] text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Owners, thresholds, and signatures are enforced by the contract onchain — the list below is where that
            contract can live today. Testnets are first-class: try the full create, sign, and execute flow with free
            test funds before committing real assets.
          </p>
        </motion.div>

        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Mainnets ({mainnets.length})
          </h2>
          <NetworkGrid chains={mainnets} />
        </motion.section>

        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Testnets ({testnets.length})
          </h2>
          <NetworkGrid chains={testnets} />
        </motion.section>

        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link href="/create-multisig">
              <AddIcon className="h-4 w-4" />
              Create a multisig
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
            <Link href="/docs">Read the guides</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Networks
