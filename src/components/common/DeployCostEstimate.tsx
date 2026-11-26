import React from 'react'

import { cn } from '@/lib/utils'
import networks from '../../constants/networks'
import useDeployCost from '../../hooks/useDeployCost'
import { GAS_COIN_IDS, formatUsd } from '../../lib/deployCost/estimate'

export interface DeployCostEstimateProps {
  // The chain the deploy would run on. Omit to list the main networks.
  chainId?: number
  className?: string
}

// Tells a newcomer what deploying costs before the wallet prompt shows a
// gas figure: free on a testnet, an estimated USD amount on a mainnet.
const DeployCostEstimate: React.FC<DeployCostEstimateProps> = ({ chainId, className }) => {
  const { entries, isLoading } = useDeployCost()
  const chain = networks.find((c) => c.id === chainId)
  const isTestnet = chain != null && GAS_COIN_IDS[chain.id] == null
  const own = entries.find((e) => e.chainId === chainId)
  const highlight = ['Ethereum', 'Polygon'].flatMap((n) => entries.filter((e) => e.name === n))

  let text: string
  if (isTestnet) {
    text = `Deploying on ${chain.name} is free: it uses test coins with no value.`
  } else if (chainId != null && own != null) {
    text = `Deploying costs about ${formatUsd(own.usd)} on ${own.name} (one-time network fee, paid from your wallet). It is free on a testnet.`
  } else if (chainId == null && highlight.length > 0) {
    text = `Network fee: ${highlight.map((e) => `about ${formatUsd(e.usd)} on ${e.name}`).join(', ')}, free on Sepolia (testnet).`
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
