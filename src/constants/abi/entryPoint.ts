// Minimal surface of the canonical ERC-4337 EntryPoint v0.7
// (0x0000000071727De22E5E9d8BDe0dFeC0CEB6a7d7, identical on every chain):
// just the deposit bookkeeping the app needs to show and prefund a wallet's
// gas balance. The full EntryPoint ABI is not shipped by mymultisig-contract.
export const EntryPointAbi = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'depositTo',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
] as const
