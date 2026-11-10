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

// Testnets grouped under the mainnet they belong to. A testnet shares its
// mainnet's mark, so the hero shows each mark once and names the testnets.
const TESTNETS_OF: Record<number, number[]> = {
  1: [11155111, 5],
  137: [80001],
  10: [420],
  42161: [421613],
  43114: [43113],
  56: [97],
  100: [10200]
}

const families = mainnets.map((chain) => ({
  chain,
  testnets: (TESTNETS_OF[chain.id] ?? [])
    .map((id) => testnets.find((testnet) => testnet.id === id))
    .filter((testnet): testnet is (typeof networks)[number] => testnet != null)
}))

// Hero visual: one row per network family, each mark shown once.
const NetworkFamilies: React.FC = () => (
  <ul
    className='flex flex-col rounded-xl border border-border bg-card p-2 shadow-[0_0_80px_-24px] shadow-primary/25'
    aria-label='Supported networks and their testnets'
  >
    {families.map(({ chain, testnets: family }, index) => (
      <motion.li
        key={chain.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.5 + index * 0.07, ease: [0.25, 1, 0.5, 1] }}
        className='flex items-center gap-3 border-t border-border px-3 py-2.5 first:border-t-0'
      >
        <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted'>
          <NetworkIcon chainId={chain.id} name={chain.name} size={20} />
        </span>
        <span className='min-w-0 flex-1 truncate text-sm font-semibold text-foreground'>{chain.name}</span>
        <span className='flex flex-wrap justify-end gap-1'>
          {family.map((testnet) => (
            <span
              key={testnet.id}
              className='rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground'
            >
              {testnet.name.replace(chain.name, '').trim() || testnet.name}
            </span>
          ))}
        </span>
      </motion.li>
    ))}
  </ul>
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
        visual={<NetworkFamilies />}
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
