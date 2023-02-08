import { MultiSigFactory } from '../models/MultiSigs'

const multiSigFactories: MultiSigFactory[] = [
  {
    chainId: 31337,
    chainName: 'localhost',
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    name: 'MyMultiSigFactory',
    version: '0.0.2',
    multiSigCount: 0,
  },
]

export default multiSigFactories
