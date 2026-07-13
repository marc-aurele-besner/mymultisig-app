import contractsAddressDeployed from 'mymultisig-contract/contractsAddressDeployed.json'

import { MultiSigFactory } from '../models/MultiSigs'

const multiSigFactories: MultiSigFactory[] = contractsAddressDeployed.map((contract) => {
  return {
    chainId: contract.chainId,
    chainName: contract.network,
    address: `0x${contract.address.substring(2)}`,
    name: contract.name,
    version: contract.extra.factoryVersion,
    multiSigCount: 0
  }
})

export default multiSigFactories
