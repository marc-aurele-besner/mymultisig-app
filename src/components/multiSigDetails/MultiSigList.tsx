import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'

interface MultiSigListProps {
  multiSigAddress: `0x${string}`
  address: `0x${string}`
}

const MultiSigList: React.FC<MultiSigListProps> = ({ multiSigAddress, address }) => {
  const { data } = useMultiSigDetails(multiSigAddress, address)

  if (!data || !data[1] || !data[5]) return null

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 pt-2 text-xl font-bold text-foreground">
          {data[0]?.toString()}
        </span>
        <span className="px-2 pt-2 text-sm font-bold text-muted-foreground">
          {multiSigAddress}
        </span>
        <Link href={`/multisig/${multiSigAddress}`} className="ml-auto mr-8">
          <Button>Select</Button>
        </Link>
      </div>
    </div>
  )
}

export default MultiSigList
