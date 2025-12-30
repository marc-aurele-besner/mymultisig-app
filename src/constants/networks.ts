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
  Chain
} from 'wagmi/chains'

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
