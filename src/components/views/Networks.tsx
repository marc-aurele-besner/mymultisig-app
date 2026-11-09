import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AddIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import NetworkIcon from '../icons/NetworkIcon'
import PageHero from '../layout/PageHero'
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

const requestNetworkUrl =
  'https://github.com/marc-aurele-besner/mymultisig-app/issues/new' +
  `?title=${encodeURIComponent('Network request: ')}` +
  `&body=${encodeURIComponent(
    'Which network should MyMultiSig support (name and chain id)?\n\nIs it a mainnet or a testnet?\n\nHow would your team use it?\n'
  )}`

// Hero visual: every supported network's mark, popping in one after another.
const NetworkCloud: React.FC = () => (
  <div
    className='grid grid-cols-5 gap-3 rounded-xl border border-border bg-card p-5 shadow-[0_0_80px_-24px] shadow-primary/25'
    role='img'
    aria-label={`${networks.length} supported networks`}
  >
    {networks.map((chain, index) => (
      <motion.span
        key={chain.id}
        title={chain.name}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.5 + index * 0.05, ease: [0.25, 1, 0.5, 1] }}
        className='grid aspect-square place-items-center rounded-xl bg-muted'
      >
        <NetworkIcon chainId={chain.id} name={chain.name} size={26} />
      </motion.span>
    ))}
  </div>
)

const NetworkGrid: React.FC<{ chains: typeof networks }> = ({ chains }) => (
  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {chains.map((chain) => (
      <motion.div
        key={chain.id}
        variants={itemVariants}
        className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
            <NetworkIcon chainId={chain.id} name={chain.name} size={18} />
            <span className="truncate">{chain.name}</span>
          </h3>
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
    <div className="flex w-full flex-col gap-10 md:gap-12">
      <PageHero
        eyebrow="SUPPORTED NETWORKS"
        title={`One multisig, ${mainnets.length} EVM mainnets`}
        lead={
          <>
            MyMultiSig deploys the same open-source contract on every supported network, so a wallet works the same
            way on Ethereum as it does on Polygon, Arbitrum, or Gnosis. Testnets are first-class: try the full
            create, sign, and execute flow with free test funds before committing real assets.
          </>
        }
        actions={
          <>
            <Button size="lg" className="gap-2" asChild>
              <Link href="/create-multisig">
                <AddIcon className="h-4 w-4" />
                Create a multisig
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">Read the guides</Link>
            </Button>
          </>
        }
        visual={<NetworkCloud />}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="flex flex-col gap-10"
      >
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
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-primary/40 bg-primary/5 p-6 md:p-8">
        <div className="min-w-0 flex-1 basis-72">
          <p className="font-mono text-xs tracking-[0.2em] text-primary">MISSING A NETWORK?</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            Tell us which chain your team is on.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The contract runs on any EVM network. Open a request with the chain name and id and we will look at
            adding it. On a network that is listed but not active yet, you can also deploy the factory yourself from
            the network selector in the top bar.
          </p>
        </div>
        <Button size="lg" asChild className="gap-2">
          <a href={requestNetworkUrl} target="_blank" rel="noopener noreferrer">
            Request a network
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}

export default Networks
