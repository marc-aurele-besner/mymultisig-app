import { mainnet, goerli, hardhat, Chain } from 'wagmi/chains'

const anvil9999: Chain = {
  id: 9999,
  network: 'anvil9999',
  name: 'anvil9999',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545']
    },
    public: {
      http: ['http://localhost:8545']
    }
  }
}

const networks: Chain[] = [mainnet, hardhat, goerli, anvil9999]

export default networks
