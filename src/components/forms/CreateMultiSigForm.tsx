import React, { useState } from 'react'
import Link from 'next/link'
import { useChainId, useChains } from 'wagmi'
import { ExternalLinkIcon, CheckCircleIcon, AddIcon, InfoIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

import TextInput from '../inputs/TextInput'
import ConfirmationCard from '../cards/ConfirmationCard'
import NumberInput from '../inputs/NumberInput'
import { MultiSigFactory, MultiSig, MultiSigConstructorArgs } from '../../models/MultiSigs'
import useCreateMultiSig from '../../hooks/useCreateMultiSig'

interface CreateMultiSigFormProps {
  owner01: string
  factory: MultiSigFactory
}

const CreateMultiSigForm: React.FC<CreateMultiSigFormProps> = ({ owner01, factory }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [multiSig, setMultiSig] = useState<MultiSig>({
    chainId: chain != null ? chain.id : 1,
    chainName: chain != null ? chain.name : 'Ethereum',
    factoryAddress: factory.address,
    id: factory.multiSigCount + 1,
    name: '',
    version: factory.version,
    address: '0x',
    threshold: 1,
    ownerCount: 1,
    nonce: 0,
    owners: [owner01, '', ''],
    isDeployed: false
  })

  const constructorArgs: MultiSigConstructorArgs = {
    contractName: multiSig.name,
    owners: multiSig.owners,
    threshold: multiSig.threshold
  }

  const { data, isPending, isSuccess, writeContract } = useCreateMultiSig(
    constructorArgs,
    factory.address
  )

  const handleOwnersChange = (event: React.ChangeEvent<HTMLInputElement>, input: number) => {
    setMultiSig({
      ...multiSig,
      owners: multiSig.owners.map((owner, index) =>
        index === input ? event.target.value : owner
      )
    })
  }
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>, input: keyof MultiSig) => {
    setMultiSig({ ...multiSig, [input]: event.target.value })
  }
  const handleAmountChange = (amount: number, input: keyof MultiSig) => {
    setMultiSig({ ...multiSig, [input]: amount })
  }

  const handleCreateMultiSig = () => {
    if (writeContract != null) writeContract()
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`

  const stepBadge = (step: string) => (
    <span className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">{step}</span>
  )

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 1')}
          <span className="text-lg font-semibold text-foreground">Name Your MultiSig</span>
        </div>
        <TextInput
          placeholder="Enter a name for your MultiSig wallet"
          value={multiSig.name}
          onChange={(e) => handleValueChange(e, 'name')}
        />
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 2')}
          <span className="text-lg font-semibold text-foreground">Add Owners</span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Add wallet addresses that will have signing authority
        </p>
        <div className="flex w-full flex-col gap-3">
          <div className="relative w-full">
            <TextInput
              placeholder={truncateAddress(owner01)}
              defaultValue={truncateAddress(owner01)}
              readOnly
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              You
            </span>
          </div>
          <TextInput
            placeholder="Owner 2 address (0x...)"
            onChange={(e) => handleOwnersChange(e, 1)}
          />
          <TextInput
            placeholder="Owner 3 address (0x...)"
            onChange={(e) => handleOwnersChange(e, 2)}
          />
        </div>
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 3')}
          <span className="text-lg font-semibold text-foreground">Set Threshold</span>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <InfoIcon className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Number of signatures required to execute a transaction
          </span>
        </div>
        <NumberInput
          placeholder="Threshold"
          value={String(multiSig.threshold)}
          min={1}
          max={3}
          step={1}
          onChange={(_, valueAsNumber) => handleAmountChange(valueAsNumber, 'threshold')}
          hasStepper
        />
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full pt-2">
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleCreateMultiSig}
          disabled={writeContract == null || !multiSig.name}
        >
          <AddIcon className="h-4 w-4" />
          Create MultiSig
        </Button>
        {!multiSig.name && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Please enter a name for your MultiSig
          </p>
        )}
      </div>

      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-xl border border-primary bg-primary/10 p-4"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">
              Please confirm the transaction in your wallet...
            </span>
          </div>
        </motion.div>
      )}

      {isSuccess && data != null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="flex flex-col gap-4">
            <div className="w-full rounded-xl border border-green-500/50 bg-green-500/10 p-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div className="flex flex-col gap-0">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Transaction Submitted!
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Hash: {data.slice(0, 20)}...{data.slice(-10)}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="default" className="gap-2" asChild>
              <a href={`https://goerli.etherscan.io/tx/${data}`} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4" />
                View on Explorer
              </a>
            </Button>
            <ConfirmationCard
              hash={data}
              multiSigFactoryAddress={factory.address}
              constructorArgs={constructorArgs}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CreateMultiSigForm
