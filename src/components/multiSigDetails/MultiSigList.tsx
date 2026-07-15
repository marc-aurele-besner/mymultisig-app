import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigList: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[1]) return null

  const isOwner = Boolean(data[5])

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
          {!isOwner && (
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground">
              view only
            </span>
          )}
        </span>
        <span className="truncate font-mono text-xs text-muted-foreground">{multiSigAddress}</span>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
        Open
        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export default MultiSigList
