import React from 'react'
import { useBalance, useChainId, useChains } from 'wagmi'
import { formatEther, formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { LoadingDots } from '@/components/ui/loading-dots'
import { CoinsIcon, ExternalLinkIcon, ImageIcon, RefreshIcon } from '../icons/ChakraIcons'

import useWalletAssets from '../../hooks/useWalletAssets'
import { NftHolding, TokenHolding } from '../../models/Assets'

interface MultiSigAssetsProps {
  multiSigAddress: `0x${string}`
}

const formatAmount = (value: bigint, decimals: number) =>
  Number(formatUnits(value, decimals)).toLocaleString(undefined, { maximumFractionDigits: 5 })

const truncate = (value: string, head = 8, tail = 6) =>
  value.length > head + tail + 2 ? `${value.slice(0, head)}...${value.slice(-tail)}` : value

// Remote logos and NFT images regularly 404 or point at dead IPFS gateways, so
// every image swaps to an icon placeholder on error instead of a broken glyph.
const AssetImage: React.FC<{
  src: string | null
  alt: string
  fallback: React.ReactNode
  className: string
}> = ({ src, alt, fallback, className }) => {
  const [errored, setErrored] = React.useState(false)
  React.useEffect(() => setErrored(false), [src])
  if (src == null || errored) return <>{fallback}</>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} loading='lazy' />
}

const TokenRow: React.FC<{
  logo: string | null
  symbol: string
  name: string
  amount: string
  badge?: string
  explorerHref?: string
}> = ({ logo, symbol, name, amount, badge, explorerHref }) => (
  <div className='flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40'>
    <AssetImage
      src={logo}
      alt={symbol}
      className='h-8 w-8 shrink-0 rounded-full object-cover'
      fallback={
        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted'>
          <CoinsIcon className='h-4 w-4 text-muted-foreground' />
        </span>
      }
    />
    <div className='flex min-w-0 flex-1 flex-col'>
      <span className='flex items-center gap-2 text-sm font-medium text-foreground'>
        {symbol}
        {badge != null && (
          <span className='rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>{badge}</span>
        )}
      </span>
      <span className='truncate text-xs text-muted-foreground'>{name}</span>
    </div>
    <span className='font-mono text-sm text-foreground'>{amount}</span>
    {explorerHref != null && (
      <a
        href={explorerHref}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={`View ${symbol} on the block explorer`}
        className='text-muted-foreground transition-colors hover:text-foreground'
      >
        <ExternalLinkIcon className='h-3.5 w-3.5' />
      </a>
    )}
  </div>
)

const NftCard: React.FC<{ nft: NftHolding; explorerUrl?: string }> = ({ nft, explorerUrl }) => {
  const title = nft.name ?? (nft.collectionName != null ? `${nft.collectionName} #${truncate(nft.tokenId, 6, 4)}` : `#${truncate(nft.tokenId, 6, 4)}`)
  const card = (
    <>
      <div className='flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-muted'>
        <AssetImage
          src={nft.imageUrl}
          alt={title}
          className='h-full w-full object-cover'
          fallback={<ImageIcon className='h-8 w-8 text-muted-foreground' />}
        />
      </div>
      <span className='truncate text-sm font-medium text-foreground'>{title}</span>
      <span className='truncate text-xs text-muted-foreground'>
        {nft.collectionName ?? truncate(nft.contractAddress)} · #{truncate(nft.tokenId, 6, 4)}
        {nft.tokenType === 'ERC1155' && nft.balance !== '1' && ` · x${nft.balance}`}
      </span>
    </>
  )
  const cardClass = 'flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-2'
  if (explorerUrl != null)
    return (
      <a
        href={`${explorerUrl}/token/${nft.contractAddress}?a=${nft.tokenId}`}
        target='_blank'
        rel='noopener noreferrer'
        className={`${cardClass} transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
      >
        {card}
      </a>
    )
  return <div className={cardClass}>{card}</div>
}

// Assets tab: what the wallet holds — native coin, ERC-20 tokens, and NFTs.
// Native balance is a direct RPC read; tokens and NFTs come from the indexer
// proxy and degrade to a note when the chain or API key does not support it.
const MultiSigAssets: React.FC<MultiSigAssetsProps> = ({ multiSigAddress }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const { data: balance } = useBalance({ address: multiSigAddress, chainId: chain?.id })
  const { assets, isLoading, isError, refetch } = useWalletAssets(multiSigAddress)

  const explorerUrl = chain?.blockExplorers?.default?.url
  const indexerUnavailable = assets?.notConfigured === true || assets?.unsupportedChain === true
  const indexerNote =
    assets?.notConfigured === true
      ? 'Token and NFT balances need an Alchemy API key: set ALCHEMY_API_KEY on the server to enable them.'
      : assets?.unsupportedChain === true
        ? `Token and NFT indexing is not available on ${chain?.name ?? 'this network'}, so only the native balance is shown.`
        : null

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-col gap-2 rounded-xl border border-border p-4'>
        <div className='flex items-baseline justify-between'>
          <h3 className='text-base font-semibold text-foreground'>Tokens</h3>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1.5 px-2 text-xs text-muted-foreground'
            onClick={() => void refetch()}
            disabled={isLoading}
          >
            <RefreshIcon className='h-3.5 w-3.5' />
            Refresh
          </Button>
        </div>
        <TokenRow
          logo={null}
          symbol={balance?.symbol ?? chain?.nativeCurrency.symbol ?? '...'}
          name={chain?.nativeCurrency.name ?? 'Native currency'}
          amount={balance != null ? formatAmount(balance.value, balance.decimals) : '...'}
          badge='native'
        />
        {isLoading && assets == null ? (
          <div className='flex items-center p-2'>
            <LoadingDots size='sm' label='Looking up token balances...' />
          </div>
        ) : isError || assets?.tokensError === true ? (
          <p className='p-2 text-sm text-muted-foreground'>Could not load token balances. Try refreshing.</p>
        ) : indexerNote != null ? (
          <p className='p-2 text-sm text-muted-foreground'>{indexerNote}</p>
        ) : assets != null && assets.tokens.length > 0 ? (
          assets.tokens.map((token: TokenHolding) => (
            <TokenRow
              key={token.contractAddress}
              logo={token.logo}
              symbol={token.symbol !== '' ? token.symbol : truncate(token.contractAddress)}
              name={token.name !== '' ? token.name : token.contractAddress}
              amount={formatAmount(BigInt(token.balance), token.decimals)}
              explorerHref={explorerUrl != null ? `${explorerUrl}/token/${token.contractAddress}` : undefined}
            />
          ))
        ) : (
          <p className='p-2 text-sm text-muted-foreground'>
            No ERC-20 tokens found in this wallet. Tokens sent to {truncate(multiSigAddress)} will show up here.
          </p>
        )}
      </div>

      {!indexerUnavailable && (
        <div className='flex flex-col gap-2 rounded-xl border border-border p-4'>
          <div className='flex items-baseline justify-between'>
            <h3 className='text-base font-semibold text-foreground'>NFTs</h3>
            {assets != null && assets.nftTotalCount > assets.nfts.length && (
              <span className='text-xs text-muted-foreground'>
                showing {assets.nfts.length} of {assets.nftTotalCount}
              </span>
            )}
          </div>
          {isLoading && assets == null ? (
            <div className='flex items-center p-2'>
              <LoadingDots size='sm' label='Looking up NFTs...' />
            </div>
          ) : isError || assets?.nftsError === true ? (
            <p className='p-2 text-sm text-muted-foreground'>Could not load NFTs. Try refreshing.</p>
          ) : assets != null && assets.nfts.length > 0 ? (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
              {assets.nfts.map((nft) => (
                <NftCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} explorerUrl={explorerUrl} />
              ))}
            </div>
          ) : (
            <p className='p-2 text-sm text-muted-foreground'>
              No NFTs found in this wallet. Collectibles it receives will show up here.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSigAssets
