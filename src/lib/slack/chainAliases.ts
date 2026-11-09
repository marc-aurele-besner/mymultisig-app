// Chain names accepted by the Slack slash commands, mapped to chain ids.
// Ids rather than names because viem's display names don't match what
// people type (mainnet.name is "Ethereum", optimism.name is "OP Mainnet").
//
// Pure data with no server imports, so the settings page can use it to
// prefill `/bind` commands. The first alias listed for an id is the one
// chainAliasFor returns, so keep the most readable name first.
export const CHAIN_ALIASES: Record<string, number> = {
  mainnet: 1,
  eth: 1,
  ethereum: 1,
  sepolia: 11155111,
  goerli: 5,
  polygon: 137,
  poly: 137,
  matic: 137,
  mumbai: 80001,
  optimism: 10,
  op: 10,
  'optimism-goerli': 420,
  'op-goerli': 420,
  arbitrum: 42161,
  arb: 42161,
  'arbitrum-goerli': 421613,
  'arb-goerli': 421613,
  avalanche: 43114,
  avax: 43114,
  fuji: 43113,
  bsc: 56,
  bnb: 56,
  'bsc-testnet': 97,
  'bnb-testnet': 97,
  gnosis: 100,
  chiado: 10200
}

// The name to show in a `/bind` command for a chain id. Falls back to the
// numeric id, which the commands also accept.
export const chainAliasFor = (chainId: number): string =>
  Object.keys(CHAIN_ALIASES).find((alias) => CHAIN_ALIASES[alias] === chainId) ?? String(chainId)

export const bindCommandFor = (chainId: number, address: string): string =>
  `/bind ${chainAliasFor(chainId)} ${address}`
