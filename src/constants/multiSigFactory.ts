import contractsAddressDeployed from 'mymultisig-contract/contractsAddressDeployed.json'

import { MultiSigFactory } from '../models/MultiSigs'

const multiSigFactories: MultiSigFactory[] = contractsAddressDeployed.map((contract) => {
  return {
    chainId: contract.chainId,
    chainName: contract.network,
    address: `0x${contract.address.substring(2)}`,
    name: contract.name,
    version: '0.0.4',
    multiSigCount: 0
  }
})

export default multiSigFactories

// 0x45C36f4D95ab36758a87F293aB998d6F5736eCcc
// 0x0811ec2Ec667Ecc9D86c8bEE327C23e4435edFA6
// 0xEa43Ae240bd259aAe6bd5558a1301E87B6D41a71
