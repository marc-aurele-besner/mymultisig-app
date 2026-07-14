import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { v4 } from 'uuid'
import { useAccount, useChainId, useChains } from 'wagmi'

import { Contract } from '../../models/Contracts'
import AddContactForm from '../forms/AddContactForm'
import useContracts from '../../states/contracts'
import { persistSavedContract } from '../../utils/accountSync'

const NewContract: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { address } = useAccount()
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const addContract = useContracts((state) => state.addContract)
  const [contract, setContract] = useState<Contract>({
    chainId: chain ? chain.id : 1,
    chainName: chain ? chain.name : 'Ethereum',
    id: v4(),
    name: '',
    address: '0x',
    creator: address || '0x',
    abi: [],
    isMultiSig: false,
    isPublic: false,
    isVerified: false,
    isWhitelisted: false,
    isChainSpecific: false,
    isWalletSpecific: true
  })

  const handleSubmit = () => {
    addContract(contract)
    persistSavedContract(contract, address)
    setOpen(false)
  }

  useEffect(() => {
    setOpen(true)
  }, [])

  if (!address) return <p className="text-foreground">Not connected</p>

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Contract</DialogTitle>
        </DialogHeader>
        <div>
          <AddContactForm contract={contract} setContract={setContract} />
        </div>
        <DialogFooter>
          <Button variant="default" className="mr-3" onClick={handleSubmit}>
            Create
          </Button>
          <Button variant="destructive" className="mr-3" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewContract
