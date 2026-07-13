import contractsAddressDeployed from 'mymultisig-contract/contractsAddressDeployed.json'

import { MultiSigFactory } from '../models/MultiSigs'

// The contract package tags deployments with hardhat network names; the chain
// ids in the manifest are not always reliable (the sepolia entry shipped with
// goerli's id), so the network name is the source of truth here.
const NETWORK_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  goerli: 5,
  sepolia: 11155111,
  polygon: 137,
  amoy: 80002,
  bnb: 56,
  bnbTestnet: 97
}

const multiSigFactories: MultiSigFactory[] = contractsAddressDeployed.map((contract) => {
  return {
    chainId: NETWORK_CHAIN_IDS[contract.network] ?? contract.chainId,
    chainName: contract.network,
    address: `0x${contract.address.substring(2)}`,
    name: contract.name,
    version: contract.extra.factoryVersion,
    multiSigCount: 0
  }
})

export default multiSigFactories
