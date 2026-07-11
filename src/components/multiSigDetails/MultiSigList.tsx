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

  if (!data || !data[1] || !data[5]) return null

  return (
    <Link
      href={`/multisig/${multiSigAddress}`}
      className="group flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-background/40 px-4 py-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-base font-semibold text-foreground">
          {data[0]?.toString()}
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
