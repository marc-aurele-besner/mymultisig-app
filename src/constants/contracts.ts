import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { v4 } from 'uuid'

import { Contract } from '../models/Contracts'

const contracts: Contract[] = [
  {
    chainId: 5,
    chainName: 'goerli',
    id: v4(),
    name: 'MyMultiSig',
    address: `0x`,
    creator: `0x`,
    abi: MyMultiSig,
    isPublic: true,
    isVerified: true,
    isWhitelisted: true,
    isChainSpecific: false,
    isWalletSpecific: false
  }
]

export default contracts
