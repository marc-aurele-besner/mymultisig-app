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

export default networks
