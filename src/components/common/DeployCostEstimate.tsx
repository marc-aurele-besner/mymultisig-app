import React from 'react'

import { cn } from '@/lib/utils'
import networks from '../../constants/networks'
import useDeployCost from '../../hooks/useDeployCost'
import { DEPLOY_GAS_BY_TYPE, GAS_COIN_IDS, formatUsd, type DeployCostEntry } from '../../lib/deployCost/estimate'

export interface DeployCostEstimateProps {
  // The chain the deploy would run on. Omit to list the main networks.
  chainId?: number
  // Wallet type being deployed; picks the fallback gas figure.
  walletType?: 'simple' | 'extended' | 'advanced'
  // Gas estimated from the real factory call. Wins over the per-type figure.
  gasUnits?: number
  // Lets stories and tests supply the fee data instead of fetching it.
  estimate?: { entries: DeployCostEntry[]; isLoading: boolean }
  className?: string
}

// Tells a newcomer what deploying costs before the wallet prompt shows a
// gas figure: free on a testnet, an estimated USD amount on a mainnet.
const DeployCostEstimate: React.FC<DeployCostEstimateProps> = ({
  chainId,
  walletType = 'simple',
  gasUnits,
  estimate,
  className
}) => {
  const fetched = useDeployCost()
  const { entries, isLoading } = estimate ?? fetched
  const gas = gasUnits ?? DEPLOY_GAS_BY_TYPE[walletType]
  const usd = (e: DeployCostEntry) => e.usdPerGas * gas
  const chain = networks.find((c) => c.id === chainId)
  const isTestnet = chain != null && GAS_COIN_IDS[chain.id] == null
  const own = entries.find((e) => e.chainId === chainId)
  const highlight = ['Ethereum', 'Polygon'].flatMap((n) => entries.filter((e) => e.name === n))

  let text: string
  if (isTestnet) {
    text = `Deploying on ${chain.name} is free: it uses test coins with no value.`
  } else if (chainId != null && own != null) {
    text = `Deploying costs about ${formatUsd(usd(own))} on ${own.name} (one-time network fee, paid from your wallet). It is free on a testnet.`
  } else if (chainId == null && highlight.length > 0) {
    text = `Network fee: ${highlight.map((e) => `about ${formatUsd(usd(e))} on ${e.name}`).join(', ')}, free on Sepolia (testnet).`
  } else if (isLoading) {
    text = 'Estimating the network fee…'
  } else {
    text = 'The network fee is shown by your wallet before you confirm. It is free on a testnet.'
  }

  return (
    <p
      className={cn(
        'rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground',
        className
      )}
      data-testid='deploy-cost'
    >
      {text} <span className='opacity-70'>Estimate; the live fee can differ.</span>
    </p>
  )
}

export default DeployCostEstimate
