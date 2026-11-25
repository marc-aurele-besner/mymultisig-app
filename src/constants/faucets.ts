import { sepolia } from 'viem/chains'

export interface Faucet {
  name: string
  url: string
}

// Where to get free test coins, per testnet chain id. Only testnets that are
// still live and have a faucet that needs no mainnet balance are listed;
// deprecated ones (Goerli, Mumbai, ...) are left out on purpose.
export const FAUCETS: Record<number, Faucet[]> = {
  [sepolia.id]: [
    { name: 'Google Cloud faucet', url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia' },
    { name: 'Alchemy faucet', url: 'https://www.alchemy.com/faucets/ethereum-sepolia' }
  ]
}

export const faucetsFor = (chainId: number | undefined): Faucet[] =>
  chainId == null ? [] : (FAUCETS[chainId] ?? [])
