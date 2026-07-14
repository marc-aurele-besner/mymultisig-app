import React, { useEffect } from 'react'

import BigCard from '../cards/BigCard'
import MultiSigHeader from './MultiSigHeader'
import MultiSigNav from './MultiSigNav'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigPageLayoutProps {
  multiSigAddress: `0x${string}`
  children: React.ReactNode
}

// Shared shell for every /multisig/[address] subpage: wallet header, tab
// navigation, and consistent spacing/width for the page content.
const MultiSigPageLayout: React.FC<MultiSigPageLayoutProps> = ({ multiSigAddress, children }) => {
  const { setSelectedMultiSigAddress } = useMultiSigs()

  useEffect(() => {
    if (/^0x[a-fA-F0-9]{40}$/.test(multiSigAddress)) {
      setSelectedMultiSigAddress(multiSigAddress)
    }
  }, [multiSigAddress, setSelectedMultiSigAddress])

  return (
    <div className='flex justify-center'>
      <BigCard className='max-w-[1200px]'>
        <div className='flex w-full flex-col gap-6'>
          <MultiSigHeader multiSigAddress={multiSigAddress} />
          <MultiSigNav multiSigAddress={multiSigAddress} />
          <div className='w-full'>{children}</div>
        </div>
      </BigCard>
    </div>
  )
}

export default MultiSigPageLayout
