import React, { useEffect } from 'react'

import MultiSigHeader from './MultiSigHeader'
import MultiSigNav from './MultiSigNav'
import useMultiSigs from '../../states/multiSigs'

interface MultiSigPageLayoutProps {
  multiSigAddress: `0x${string}`
  children: React.ReactNode
}

// Shared frame for every /multisig/[address] subpage and for request pages:
// the wallet header, then the page content. The wallet's sections live in
// the app sidebar; the tab strip here only shows below `lg`, where the
// sidebar is hidden.
const MultiSigPageLayout: React.FC<MultiSigPageLayoutProps> = ({ multiSigAddress, children }) => {
  const { setSelectedMultiSigAddress } = useMultiSigs()

  useEffect(() => {
    if (/^0x[a-fA-F0-9]{40}$/.test(multiSigAddress)) {
      setSelectedMultiSigAddress(multiSigAddress)
    }
  }, [multiSigAddress, setSelectedMultiSigAddress])

  return (
    <div className='flex w-full flex-col gap-6'>
      <MultiSigHeader multiSigAddress={multiSigAddress} />
      <MultiSigNav multiSigAddress={multiSigAddress} />
      <div className='w-full'>{children}</div>
    </div>
  )
}

export default MultiSigPageLayout
