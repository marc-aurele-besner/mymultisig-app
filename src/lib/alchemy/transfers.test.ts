import { mapAssetTransfers, RawAssetTransfer } from './transfers'

describe('mapAssetTransfers', () => {
  const native: RawAssetTransfer = {
    uniqueId: '0xabc:external:0xdef',
    hash: '0xabc',
    blockNum: '0x1a4',
    from: '0x1111111111111111111111111111111111111111',
    asset: 'ETH',
    value: 0.5,
    category: 'external',
    metadata: { blockTimestamp: '2026-07-01T12:00:00.000Z' }
  }

  it('maps a native transfer to the wire shape with decimal block and unix seconds', () => {
    const [entry] = mapAssetTransfers([native])
    expect(entry).toEqual({
      id: '0xabc:external:0xdef',
      hash: '0xabc',
      blockNumber: '420',
      timestamp: Date.parse('2026-07-01T12:00:00.000Z') / 1000,
      from: '0x1111111111111111111111111111111111111111',
      asset: 'ETH',
      value: 0.5,
      category: 'external'
    })
  })

  it('leaves timestamp undefined when the indexer omits block metadata', () => {
    const [entry] = mapAssetTransfers([{ ...native, metadata: undefined }])
    expect(entry.timestamp).toBeUndefined()
  })

  it('keeps token transfers with unknown value or asset as nulls', () => {
    const [entry] = mapAssetTransfers([{ ...native, category: 'erc20', asset: null, value: null }])
    expect(entry.asset).toBeNull()
    expect(entry.value).toBeNull()
    expect(entry.category).toBe('erc20')
  })

  it('drops rows missing the fields needed to place them in the feed', () => {
    expect(mapAssetTransfers([{ ...native, uniqueId: undefined }])).toEqual([])
    expect(mapAssetTransfers([{ ...native, blockNum: undefined }])).toEqual([])
    expect(mapAssetTransfers([{ ...native, from: undefined }])).toEqual([])
  })
})
