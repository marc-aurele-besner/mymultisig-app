import React, { useState } from 'react'
import { useChainId, useChains } from 'wagmi'
import { ExternalLinkIcon, CheckCircleIcon, AddIcon, InfoIcon, DeleteIcon } from '../icons/ChakraIcons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

import TextInput from '../inputs/TextInput'
import ConfirmationCard from '../cards/ConfirmationCard'
import NumberInput from '../inputs/NumberInput'
import { MultiSigFactory, MultiSigConstructorArgs, WalletType } from '../../models/MultiSigs'
import useCreateMultiSig from '../../hooks/useCreateMultiSig'

interface CreateMultiSigFormProps {
  owner01: string
  factory: MultiSigFactory
}

const CreateMultiSigForm: React.FC<CreateMultiSigFormProps> = ({ owner01, factory }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [name, setName] = useState('')
  const [owners, setOwners] = useState<string[]>([owner01, ''])
  const [threshold, setThreshold] = useState(1)
  const [walletType, setWalletType] = useState<WalletType>('simple')
  const [isOnlyOwnerRequest, setIsOnlyOwnerRequest] = useState(false)

  const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
  const filledOwners = owners.filter((owner) => owner !== '')
  const ownersValid = filledOwners.length > 0 && filledOwners.every(isAddress)
  const thresholdValid = threshold >= 1 && threshold <= filledOwners.length

  const constructorArgs: MultiSigConstructorArgs = {
    contractName: name,
    owners: filledOwners,
    threshold,
    walletType,
    isOnlyOwnerRequest: walletType === 'extended' ? isOnlyOwnerRequest : undefined
  }

  const { data, isPending, isSuccess, writeContract } = useCreateMultiSig(constructorArgs, factory.address)

  const handleOwnerChange = (value: string, input: number) => {
    setOwners(owners.map((owner, index) => (index === input ? value : owner)))
  }
  const addOwnerRow = () => setOwners([...owners, ''])
  const removeOwnerRow = (input: number) => {
    const next = owners.filter((_, index) => index !== input)
    setOwners(next)
    const filled = next.filter((owner) => owner !== '').length
    if (threshold > filled && filled > 0) setThreshold(filled)
  }

  const handleCreateMultiSig = () => {
    if (writeContract != null) writeContract()
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`
  const explorerUrl = chain?.blockExplorers?.default?.url

  const stepBadge = (step: string) => (
    <span className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">{step}</span>
  )

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 1')}
          <span className="text-lg font-semibold text-foreground">Choose Wallet Type</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={walletType === 'simple' ? 'default' : 'outline'}
            onClick={() => setWalletType('simple')}
          >
            Simple
          </Button>
          <Button
            variant={walletType === 'extended' ? 'default' : 'outline'}
            onClick={() => setWalletType('extended')}
          >
            Extended
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {walletType === 'simple'
            ? 'Standard multisig: owners, threshold, and transaction execution.'
            : 'Adds inactivity delegation, nonce invalidation, explicit-nonce execution, and an owner-only request policy.'}
        </p>
        {walletType === 'extended' && (
          <div className="mt-3 flex items-center gap-3">
            <Switch checked={isOnlyOwnerRequest} onCheckedChange={setIsOnlyOwnerRequest} />
            <span className="text-sm text-foreground">Only owners can create requests</span>
          </div>
        )}
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 2')}
          <span className="text-lg font-semibold text-foreground">Name Your MultiSig</span>
        </div>
        <TextInput
          placeholder="Enter a name for your MultiSig wallet"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 3')}
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
          {owners.slice(1).map((owner, index) => (
            <div key={`owner-${index + 1}`} className="flex w-full items-center gap-2">
              <TextInput
                placeholder={`Owner ${index + 2} address (0x...)`}
                value={owner}
                onChange={(e) => handleOwnerChange(e.target.value, index + 1)}
              />
              <Button
                variant="outline"
                size="icon"
                aria-label="Remove owner"
                onClick={() => removeOwnerRow(index + 1)}
              >
                <DeleteIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="gap-2 self-start" onClick={addOwnerRow}>
            <AddIcon className="h-4 w-4" />
            Add owner
          </Button>
        </div>
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          {stepBadge('Step 4')}
          <span className="text-lg font-semibold text-foreground">Set Threshold</span>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <InfoIcon className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Number of signatures required to execute a transaction ({threshold} of {filledOwners.length}{' '}
            owners)
          </span>
        </div>
        <NumberInput
          placeholder="Threshold"
          value={String(threshold)}
          min={1}
          max={Math.max(filledOwners.length, 1)}
          step={1}
          onChange={(_, valueAsNumber) => setThreshold(valueAsNumber)}
          hasStepper
        />
      </div>

      <div className="my-4 w-full border-t border-border" />

      <div className="w-full pt-2">
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleCreateMultiSig}
          disabled={writeContract == null || !name || !ownersValid || !thresholdValid}
        >
          <AddIcon className="h-4 w-4" />
          Create {walletType === 'extended' ? 'Extended ' : ''}MultiSig
        </Button>
        {!name && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Please enter a name for your MultiSig
          </p>
        )}
        {name && !ownersValid && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            All owner fields must contain valid addresses
          </p>
        )}
        {name && ownersValid && !thresholdValid && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Threshold must be between 1 and the number of owners
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
            {explorerUrl && (
              <Button variant="outline" size="default" className="gap-2" asChild>
                <a href={`${explorerUrl}/tx/${data}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4" />
                  View on Explorer
                </a>
              </Button>
            )}
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
