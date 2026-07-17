import { NextApiRequest, NextApiResponse } from 'next'

import { alchemyNetworkSlug } from '../../constants/alchemyNetworks'
import { NftHolding, TokenHolding } from '../../models/Assets'

const FUNCTION = 'get-assets'

// Caps keep a single request bounded; wallets holding more than this show a
// "showing first N" hint client-side (NFT totalCount is returned separately).
const MAX_TOKENS = 50
const MAX_NFTS = 50

// Assets are public on-chain data keyed only by address + chain, so like
// getABI this route needs no SIWE session — it only keeps the key server-side.
const apiKey = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

interface RawTokenBalance {
  contractAddress: string
  tokenBalance: string | null
  error?: string | null
}

const fetchTokens = async (slug: string, address: string): Promise<TokenHolding[]> => {
  const rpcUrl = `https://${slug}.g.alchemy.com/v2/${apiKey}`
  const balanceRes = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'alchemy_getTokenBalances', params: [address, 'erc20'] })
  })
  if (!balanceRes.ok) throw new Error(`Token balances request failed (${balanceRes.status})`)
  const balanceJson = await balanceRes.json()
  if (balanceJson.error != null) throw new Error(String(balanceJson.error.message ?? 'Token balances RPC error'))

  const rawBalances: RawTokenBalance[] = Array.isArray(balanceJson.result?.tokenBalances)
    ? balanceJson.result.tokenBalances
    : []
  const held = rawBalances
    .filter((t) => t.error == null && t.tokenBalance != null && BigInt(t.tokenBalance) > 0n)
    .slice(0, MAX_TOKENS)
  if (held.length === 0) return []

  // One batched JSON-RPC call for all metadata; ids map answers back to tokens.
  const metadataRes = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      held.map((t, i) => ({ jsonrpc: '2.0', id: i, method: 'alchemy_getTokenMetadata', params: [t.contractAddress] }))
    )
  })
  if (!metadataRes.ok) throw new Error(`Token metadata request failed (${metadataRes.status})`)
  const metadataJson = await metadataRes.json()
  const metadataById = new Map<number, Record<string, unknown>>()
  if (Array.isArray(metadataJson)) {
    for (const entry of metadataJson) {
      if (entry?.result != null) metadataById.set(Number(entry.id), entry.result)
    }
  }

  return held
    .map((t, i) => {
      const metadata = metadataById.get(i)
      return {
        contractAddress: t.contractAddress,
        balance: BigInt(t.tokenBalance as string).toString(),
        decimals: Number(metadata?.decimals ?? 18),
        symbol: String(metadata?.symbol ?? ''),
        name: String(metadata?.name ?? ''),
        logo: metadata?.logo != null ? String(metadata.logo) : null
      }
    })
    // Entries without a symbol or name are unreadable (often spam); drop them.
    .filter((t) => t.symbol !== '' || t.name !== '')
}

const fetchNfts = async (slug: string, address: string): Promise<{ nfts: NftHolding[]; totalCount: number }> => {
  const nftUrl =
    `https://${slug}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner` +
    `?owner=${address}&withMetadata=true&pageSize=${MAX_NFTS}`
  const res = await fetch(nftUrl)
  if (!res.ok) throw new Error(`NFT request failed (${res.status})`)
  const json = await res.json()
  const owned: Record<string, any>[] = Array.isArray(json.ownedNfts) ? json.ownedNfts : []
  const nfts = owned.map((nft) => ({
    contractAddress: String(nft.contract?.address ?? ''),
    tokenId: String(nft.tokenId ?? ''),
    tokenType: String(nft.tokenType ?? nft.contract?.tokenType ?? ''),
    name: nft.name != null ? String(nft.name) : null,
    collectionName: nft.contract?.name != null ? String(nft.contract.name) : null,
    imageUrl:
      nft.image?.thumbnailUrl != null
        ? String(nft.image.thumbnailUrl)
        : nft.image?.cachedUrl != null
          ? String(nft.image.cachedUrl)
          : null,
    balance: String(nft.balance ?? '1')
  }))
  return { nfts, totalCount: Number(json.totalCount ?? nfts.length) }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Function `%s` invoked', FUNCTION)
  const raw = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { address, chainId } = (raw ?? {}) as { address?: unknown; chainId?: unknown }
  if (typeof address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(address) || typeof chainId !== 'number') {
    return res.status(400).json({ message: 'Invalid address or chainId' })
  }

  // The key is optional (see .env.example); degrade instead of failing at boot
  // like routes whose whole feature depends on their key.
  if (apiKey == null || apiKey === '') {
    return res.status(200).json({
      message: 'Indexer not configured',
      content: { tokens: [], nfts: [], nftTotalCount: 0, tokensError: false, nftsError: false, notConfigured: true }
    })
  }
  const slug = alchemyNetworkSlug(chainId)
  if (slug === undefined) {
    return res.status(200).json({
      message: 'Chain not supported by indexer',
      content: { tokens: [], nfts: [], nftTotalCount: 0, tokensError: false, nftsError: false, unsupportedChain: true }
    })
  }

  // Tokens and NFTs fail independently (NFT API coverage varies by chain), so
  // one side erroring still returns the other.
  const [tokensResult, nftsResult] = await Promise.allSettled([fetchTokens(slug, address), fetchNfts(slug, address)])
  if (tokensResult.status === 'rejected') console.log('Token fetch failed:', tokensResult.reason)
  if (nftsResult.status === 'rejected') console.log('NFT fetch failed:', nftsResult.reason)

  return res.status(200).json({
    message: 'Data retrieved',
    content: {
      tokens: tokensResult.status === 'fulfilled' ? tokensResult.value : [],
      nfts: nftsResult.status === 'fulfilled' ? nftsResult.value.nfts : [],
      nftTotalCount: nftsResult.status === 'fulfilled' ? nftsResult.value.totalCount : 0,
      tokensError: tokensResult.status === 'rejected',
      nftsError: nftsResult.status === 'rejected'
    }
  })
}

export default handler
