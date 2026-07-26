import networks from '../../constants/networks'

// Look up the public block explorer for a chain id (e.g. 1 → 'https://etherscan.io').
// Returns null when the chain id is unknown or the viem Chain has no
// blockExplorers metadata. Used by the notification dispatcher to build
// the "View on explorer" button. The shape mirrors the rest of the
// integration code: viem's chain.blockExplorers.default.url is the
// canonical source (see e.g. src/components/cards/ConfirmationCard.tsx).

export const explorerUrlForChain = (chainId: number | null): string | null => {
  if (chainId == null) return null
  const chain = networks.find((c) => c.id === chainId)
  return chain?.blockExplorers?.default?.url ?? null
}