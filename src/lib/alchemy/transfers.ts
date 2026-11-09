// Shapes for Alchemy's alchemy_getAssetTransfers, narrowed to what the activity
// feed needs. Incoming funds emit no contract event, so the feed reads them
// from this indexer instead of eth_getLogs.

export type RawAssetTransfer = {
  uniqueId?: string
  hash?: string
  blockNum?: string
  from?: string
  asset?: string | null
  value?: number | null
  category?: string
  metadata?: { blockTimestamp?: string }
}

// JSON-safe form used on the wire: block numbers are decimal strings.
export type IncomingTransfer = {
  id: string
  hash: `0x${string}`
  blockNumber: string
  // Unix seconds; undefined when the indexer omitted the block timestamp.
  timestamp?: number
  from: string
  asset: string | null
  value: number | null
  category: string
}

export type IncomingTransfersPage = {
  transfers: IncomingTransfer[]
  // Null once the scan has reached the requested fromBlock.
  pageKey: string | null
}

export const mapAssetTransfers = (raw: RawAssetTransfer[]): IncomingTransfer[] =>
  raw.flatMap((t) => {
    if (t.uniqueId == null || t.hash == null || t.blockNum == null || t.from == null) return []
    const millis = t.metadata?.blockTimestamp != null ? Date.parse(t.metadata.blockTimestamp) : NaN
    return [
      {
        id: t.uniqueId,
        hash: t.hash as `0x${string}`,
        blockNumber: BigInt(t.blockNum).toString(),
        timestamp: Number.isFinite(millis) ? Math.floor(millis / 1000) : undefined,
        from: t.from,
        asset: t.asset ?? null,
        value: typeof t.value === 'number' ? t.value : null,
        category: t.category ?? ''
      }
    ]
  })
