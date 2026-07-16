import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import NetworkIcon from '../icons/NetworkIcon'
import { MultiSig } from '../../models/MultiSigs'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
  // Stored wallet record: supplies the network badge and the version fallback
  // when the live reads have not answered (or the wallet is on another chain).
  multiSig?: MultiSig
}

const MultiSigList: React.FC<MultiSigListProps> = ({ multiSigAddress, address, multiSig }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[1]) return null

  const isOwner = Boolean(data[5])
  // Prefer the wallet's live version() (it is the EIP-712 domain version);
  // the stored record covers the brief window before the read answers.
  const version = data[1] != null ? String(data[1]) : (multiSig?.version ?? '')

  return (
    <Link
      href={`/multisig/${multiSigAddress}`}
      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-background/40 px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="truncate">{data[0]?.toString()}</span>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground">
            {Number(data[2])} of {Number(data[3])}
          </span>
          {version !== '' && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground">
              v{version}
            </span>
          )}
          {!isOwner && (
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground">
              view only
            </span>
          )}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {multiSig != null && (
            <span className="flex shrink-0 items-center gap-1">
              <NetworkIcon chainId={multiSig.chainId} name={multiSig.chainName} size={12} />
              {multiSig.chainName}
            </span>
          )}
          <span className="truncate font-mono">{multiSigAddress}</span>
        </span>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
        Open
        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export default MultiSigList
