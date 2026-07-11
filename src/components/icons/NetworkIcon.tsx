import React from 'react'
import {
  NetworkEthereum,
  NetworkSepolia,
  NetworkGoerli,
  NetworkPolygon,
  NetworkOptimism,
  NetworkArbitrumOne,
  NetworkAvalanche,
  NetworkAvalancheFuji,
  NetworkBinanceSmartChain,
  NetworkGnosis
} from '@web3icons/react'
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ size?: number; variant?: 'mono' | 'branded'; className?: string }>

/* Testnets without their own mark reuse the parent chain's icon. */
const iconsByChainId: Record<number, IconComponent> = {
  1: NetworkEthereum,
  11155111: NetworkSepolia,
  5: NetworkGoerli,
  137: NetworkPolygon,
  80001: NetworkPolygon,
  10: NetworkOptimism,
  420: NetworkOptimism,
  42161: NetworkArbitrumOne,
  421613: NetworkArbitrumOne,
  43114: NetworkAvalanche,
  43113: NetworkAvalancheFuji,
  56: NetworkBinanceSmartChain,
  97: NetworkBinanceSmartChain,
  100: NetworkGnosis,
  10200: NetworkGnosis
}

interface NetworkIconProps {
  chainId: number
  /** Fallback initial when the chain has no icon, e.g. the chain name's first letter */
  name?: string
  size?: number
  className?: string
}

const NetworkIcon: React.FC<NetworkIconProps> = ({ chainId, name, size = 20, className }) => {
  const Icon = iconsByChainId[chainId]

  if (!Icon) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary',
          className
        )}
      >
        {(name ?? '?').slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return <Icon size={size} variant="branded" className={cn('shrink-0', className)} />
}

export default NetworkIcon
