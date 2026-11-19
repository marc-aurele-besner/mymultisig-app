import {
  mainnet,
  goerli,
  sepolia,
  polygon,
  polygonMumbai,
  optimism,
  optimismGoerli,
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  gnosis,
  gnosisChiado,
  type Chain
} from 'viem/chains'

const networks: Chain[] = [
  // Ethereum
  mainnet,
  sepolia,
  goerli,
  // Polygon
  polygon,
  polygonMumbai,
  // Optimism
  optimism,
  optimismGoerli,
  // Arbitrum
  arbitrum,
  arbitrumGoerli,
  // Avalanche
  avalanche,
  avalancheFuji,
  // BNB Chain
  bsc,
  bscTestnet,
  // Gnosis
  gnosis,
  gnosisChiado
]

// The chain a first-time, disconnected visitor starts on. A testnet, so the
// first thing a newcomer tries costs nothing. Returning visitors keep the
// chain wagmi persisted, and a connected wallet reports its own chain.
export const DEFAULT_CHAIN: Chain = sepolia

export default networks
