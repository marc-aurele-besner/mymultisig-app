import React, { useState } from 'react'
import { useChainId, useChains } from 'wagmi'
import { keccak256, stringToHex } from 'viem'
import { ExternalLinkIcon, CheckCircleIcon, CheckIcon, AddIcon, DeleteIcon, ArrowBackIcon } from '../icons/ChakraIcons'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { LoadingDots } from '@/components/ui/loading-dots'
import { cn } from '@/lib/utils'

import TextInput from '../inputs/TextInput'
import ConfirmationCard from '../cards/ConfirmationCard'
import { MultiSigFactory, MultiSigConstructorArgs, WalletType, isExtendedWallet } from '../../models/MultiSigs'
import useCreateMultiSig from '../../hooks/useCreateMultiSig'
import useFactoryStats from '../../hooks/useFactoryStats'
import usePredictMultiSigAddress from '../../hooks/usePredictMultiSigAddress'
import { isModernFactory } from '../../utils/contractVersions'

interface CreateMultiSigFormProps {
  owner01: string
  factory: MultiSigFactory
}

const STEPS = ['Wallet type', 'Name & owners', 'Review & deploy'] as const

const WALLET_TYPE_FEATURES: Record<WalletType, { tagline: string; features: string[] }> = {
  simple: {
    tagline: 'The essentials, at the lowest gas overhead.',
    features: [
      'Owners and signature threshold',
      'EIP-712 signed transaction requests',
      'Batch several calls in one transaction'
    ]
  },
  extended: {
    tagline: 'Everything in Simple, plus governance controls.',
    features: [
      'Owner-only request policy',
      'Burn nonces to cancel pre-signed transactions',
      'Pin a request to a specific nonce',
      'Delegate inactive owner seats for recovery'
    ]
  },
  advanced: {
    tagline: 'Everything in Extended, tracked as an Advanced deployment.',
    features: [
      'Timelock on sensitive operations',
      'Transaction guard and target allowlist',
      'Per-owner daily spending allowances',
      'Modules (plugins) and ERC-4337 account abstraction'
    ]
  }
}

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const truncateAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className='flex w-full items-center justify-center gap-0'>
    {STEPS.map((label, index) => (
      <React.Fragment key={label}>
        {index > 0 && (
          <div className='relative h-px w-8 overflow-hidden bg-border sm:w-16'>
            <span
              className={cn(
                'absolute inset-0 origin-left bg-primary transition-transform duration-500 ease-out',
                index <= current ? 'scale-x-100' : 'scale-x-0'
              )}
            />
          </div>
        )}
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs transition-colors duration-300',
              index < current
                ? 'bg-primary/20 text-primary'
                : index === current
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground'
            )}
          >
            {index < current ? <CheckIcon className='h-3.5 w-3.5 animate-pop-in' /> : `0${index + 1}`}
          </span>
          <span
            className={cn(
              'hidden text-sm transition-colors duration-300 sm:inline',
              index === current ? 'font-semibold text-foreground' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
        </div>
      </React.Fragment>
    ))}
  </div>
)

const CreateMultiSigForm: React.FC<CreateMultiSigFormProps> = ({ owner01, factory }) => {
  const chainId = useChainId()
  const chains = useChains()
  const chain = chains.find((c) => c.id === chainId)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [owners, setOwners] = useState<string[]>([owner01, ''])
  const [threshold, setThreshold] = useState(1)
  const [walletType, setWalletType] = useState<WalletType>('simple')
  const [isOnlyOwnerRequest, setIsOnlyOwnerRequest] = useState(false)
  const [deterministic, setDeterministic] = useState(false)
  const [saltText, setSaltText] = useState('')
  // Advanced creation (createMyMultiSigAdvanced) only exists on 0.5.0 factories.
  const modernFactory = isModernFactory(factory.version)
  const availableTypes: readonly WalletType[] = modernFactory
    ? (['simple', 'extended', 'advanced'] as const)
    : (['simple', 'extended'] as const)
  // The salt (hashed from the user's phrase) feeds createDeterministic*: the
  // same phrase + creator + name/owners/threshold reproduces the same wallet
  // address on every chain with the canonical factory set.
  const salt = modernFactory && deterministic && saltText.trim() !== '' ? keccak256(stringToHex(saltText.trim())) : undefined

  const filledOwners = owners.filter((owner) => owner !== '')
  const ownersValid = filledOwners.length > 0 && filledOwners.every(isAddress)
  const duplicateOwners = filledOwners.filter(
    (owner, index) => filledOwners.findIndex((o) => o.toLowerCase() === owner.toLowerCase()) !== index
  )
  const thresholdValid = threshold >= 1 && threshold <= filledOwners.length

  const detailsError = !name.trim()
    ? 'Give your multisig a name'
    : !ownersValid
      ? 'Every owner field must contain a valid address'
      : duplicateOwners.length > 0
        ? `Duplicate owner: ${truncateAddress(duplicateOwners[0])}`
        : !thresholdValid
          ? 'Pick a signature threshold'
          : modernFactory && deterministic && salt == null
            ? 'Enter a salt phrase for the deterministic address'
            : null

  const constructorArgs: MultiSigConstructorArgs = {
    contractName: name,
    owners: filledOwners,
    threshold,
    walletType,
    isOnlyOwnerRequest: isExtendedWallet(walletType) ? isOnlyOwnerRequest : undefined,
    salt
  }

  const { data, isPending, isSuccess, writeContract } = useCreateMultiSig(constructorArgs, factory.address)
  // Only predicted on the review step: the inputs are settled there, so the
  // read does not re-fire on every keystroke of the earlier steps.
  const { predictedAddress } = usePredictMultiSigAddress(constructorArgs, factory.address, salt != null && step === 2)
  const { totalCount, simpleCount, extendedCount, advancedCount, supportsTypeCounts } = useFactoryStats(
    factory.address
  )

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

  const explorerUrl = chain?.blockExplorers?.default?.url

  if (isSuccess && data != null) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='w-full'>
        <div className='flex flex-col gap-4'>
          <div className='w-full rounded-xl border border-primary/50 bg-primary/10 p-4'>
            <div className='flex items-center gap-3'>
              <CheckCircleIcon className='h-5 w-5 animate-pop-in text-primary' />
              <div className='flex flex-col gap-0'>
                <span className='text-sm font-semibold text-primary'>Transaction submitted</span>
                <span className='text-xs text-muted-foreground'>
                  Hash: {data.slice(0, 20)}...{data.slice(-10)}
                </span>
              </div>
            </div>
          </div>
          {explorerUrl && (
            <Button variant='outline' size='default' className='gap-2' asChild>
              <a href={`${explorerUrl}/tx/${data}`} target='_blank' rel='noopener noreferrer'>
                <ExternalLinkIcon className='h-4 w-4' />
                View on Explorer
              </a>
            </Button>
          )}
          <ConfirmationCard hash={data} multiSigFactoryAddress={factory.address} constructorArgs={constructorArgs} />
        </div>
      </motion.div>
    )
  }

  return (
    <div className='flex w-full flex-col gap-6'>
      <StepIndicator current={step} />

      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='w-full'
        >
      {step === 0 && (
        <div className='flex w-full flex-col gap-4'>
          <div className={cn('grid grid-cols-1 gap-4', availableTypes.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {availableTypes.map((type) => (
              <button
                key={type}
                type='button'
                onClick={() => setWalletType(type)}
                aria-pressed={walletType === type}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border p-5 text-left transition-colors',
                  walletType === type
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary/50'
                )}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold capitalize text-foreground'>{type}</span>
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      walletType === type ? 'border-primary bg-primary' : 'border-border'
                    )}
                  >
                    {walletType === type && <CheckCircleIcon className='h-4 w-4 text-primary-foreground' />}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>{WALLET_TYPE_FEATURES[type].tagline}</p>
                <ul className='flex flex-col gap-1'>
                  {WALLET_TYPE_FEATURES[type].features.map((feature) => (
                    <li key={feature} className='flex items-start gap-2 text-sm text-foreground'>
                      <CheckCircleIcon className='mt-0.5 h-3.5 w-3.5 shrink-0 text-primary' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          {isExtendedWallet(walletType) && (
            <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4'>
              <Switch checked={isOnlyOwnerRequest} onCheckedChange={setIsOnlyOwnerRequest} />
              <div className='flex flex-col'>
                <span className='text-sm font-medium text-foreground'>Only owners can create requests</span>
                <span className='text-xs text-muted-foreground'>
                  You can change this later from the wallet settings.
                </span>
              </div>
            </div>
          )}
          {totalCount != null && totalCount > 0 && (
            <p className='text-center text-xs text-muted-foreground'>
              This factory has created {totalCount} wallet{totalCount === 1 ? '' : 's'}
              {supportsTypeCounts
                ? ` (${simpleCount ?? 0} simple, ${extendedCount ?? 0} extended, ${advancedCount ?? 0} advanced)`
                : ''}
              .
            </p>
          )}
          <Button size='lg' className='w-full' onClick={() => setStep(1)}>
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className='flex w-full flex-col gap-6'>
          <div className='w-full'>
            <span className='mb-2 block text-sm font-semibold text-foreground'>Name</span>
            <TextInput
              placeholder='Enter a name for your MultiSig wallet'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className='w-full'>
            <span className='block text-sm font-semibold text-foreground'>Owners</span>
            <p className='mb-3 text-sm text-muted-foreground'>
              Each owner address can sign transaction requests for this wallet.
            </p>
            <div className='flex w-full flex-col gap-3'>
              <div className='relative w-full'>
                <TextInput placeholder={truncateAddress(owner01)} defaultValue={truncateAddress(owner01)} readOnly />
                <span className='absolute right-6 top-1/2 -translate-y-1/2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground'>
                  You
                </span>
              </div>
              {owners.slice(1).map((owner, index) => {
                const isDuplicate =
                  owner !== '' &&
                  owners.some((o, i) => i !== index + 1 && o !== '' && o.toLowerCase() === owner.toLowerCase())
                return (
                  <div key={`owner-${index + 1}`} className='flex w-full flex-col gap-1'>
                    <div className='flex w-full items-center gap-2'>
                      <TextInput
                        placeholder={`Owner ${index + 2} address (0x...)`}
                        value={owner}
                        isInvalid={(owner !== '' && !isAddress(owner)) || isDuplicate}
                        onChange={(e) => handleOwnerChange(e.target.value, index + 1)}
                      />
                      <Button
                        variant='outline'
                        size='icon'
                        aria-label='Remove owner'
                        onClick={() => removeOwnerRow(index + 1)}
                      >
                        <DeleteIcon className='h-4 w-4' />
                      </Button>
                    </div>
                    {owner !== '' && !isAddress(owner) && (
                      <span className='text-xs text-destructive'>This is not a valid address</span>
                    )}
                    {isDuplicate && <span className='text-xs text-destructive'>This address is already an owner</span>}
                  </div>
                )
              })}
              <Button variant='outline' className='gap-2 self-start' onClick={addOwnerRow}>
                <AddIcon className='h-4 w-4' />
                Add owner
              </Button>
            </div>
          </div>

          <div className='w-full'>
            <span className='block text-sm font-semibold text-foreground'>Signature threshold</span>
            <p className='mb-3 text-sm text-muted-foreground'>
              How many owners must sign before a transaction can execute.
            </p>
            <div className='flex flex-wrap gap-2'>
              {Array.from({ length: Math.max(filledOwners.length, 1) }, (_, i) => i + 1).map((value) => (
                <Button
                  key={value}
                  variant={threshold === value ? 'default' : 'outline'}
                  onClick={() => setThreshold(value)}
                >
                  {value} of {Math.max(filledOwners.length, 1)}
                </Button>
              ))}
            </div>
            {thresholdValid && threshold === 1 && filledOwners.length > 1 && (
              <p className='mt-2 text-xs text-muted-foreground'>
                A threshold of 1 lets any single owner execute transactions alone. Consider requiring at least 2
                signatures.
              </p>
            )}
          </div>

          {modernFactory && (
            <div className='flex w-full flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4'>
              <div className='flex items-center gap-3'>
                <Switch checked={deterministic} onCheckedChange={setDeterministic} />
                <div className='flex flex-col'>
                  <span className='text-sm font-medium text-foreground'>Deterministic address (CREATE2)</span>
                  <span className='text-xs text-muted-foreground'>
                    Deploy at an address you can reproduce on every supported chain.
                  </span>
                </div>
              </div>
              {deterministic && (
                <div className='flex w-full flex-col gap-1'>
                  <TextInput
                    placeholder='Salt phrase (e.g. my-team-treasury)'
                    value={saltText}
                    onChange={(e) => setSaltText(e.target.value)}
                  />
                  <span className='text-xs text-muted-foreground'>
                    The same phrase, creator wallet, name, owners and threshold always produce the same address — keep
                    the phrase to redeploy this wallet on another chain.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className='flex w-full gap-2'>
            <Button variant='outline' size='lg' className='gap-2' onClick={() => setStep(0)}>
              <ArrowBackIcon className='h-4 w-4' />
              Back
            </Button>
            <Button size='lg' className='flex-1' onClick={() => setStep(2)} disabled={detailsError != null}>
              Review
            </Button>
          </div>
          {detailsError != null && <p className='text-center text-xs text-muted-foreground'>{detailsError}</p>}
        </div>
      )}

      {step === 2 && (
        <div className='flex w-full flex-col gap-4'>
          <div className='flex w-full flex-col gap-3 rounded-xl border border-border bg-muted/30 p-5 text-sm'>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Network</span>
              <span className='font-semibold text-foreground'>{chain?.name ?? '...'}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Wallet type</span>
              <span className='font-semibold capitalize text-foreground'>{walletType}</span>
            </div>
            {isExtendedWallet(walletType) && (
              <div className='flex justify-between gap-4'>
                <span className='text-muted-foreground'>Request policy</span>
                <span className='font-semibold text-foreground'>
                  {isOnlyOwnerRequest ? 'Owners only' : 'Anyone can propose'}
                </span>
              </div>
            )}
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Name</span>
              <span className='font-semibold text-foreground'>{name}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Threshold</span>
              <span className='font-semibold text-foreground'>
                {threshold} of {filledOwners.length} owner{filledOwners.length === 1 ? '' : 's'}
              </span>
            </div>
            {salt != null && (
              <div className='flex flex-col gap-1 border-t border-border pt-3'>
                <span className='text-muted-foreground'>Deterministic address</span>
                {predictedAddress != null ? (
                  <span className='break-all font-mono text-xs text-foreground'>{predictedAddress}</span>
                ) : (
                  <span className='text-xs text-muted-foreground'>Predicting the wallet address…</span>
                )}
                <span className='text-xs text-muted-foreground'>
                  Redeploying with the same salt phrase and settings reproduces this address on other chains.
                </span>
              </div>
            )}
            <div className='flex flex-col gap-1 border-t border-border pt-3'>
              <span className='text-muted-foreground'>Owners</span>
              {filledOwners.map((owner) => (
                <span key={owner} className='font-mono text-xs text-foreground'>
                  {owner}
                  {owner.toLowerCase() === owner01.toLowerCase() && (
                    <span className='ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground'>
                      You
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <p className='text-center text-xs text-muted-foreground'>
            Owners and threshold can be changed later, but only through a signed multisig transaction.
          </p>

          <div className='flex w-full gap-2'>
            <Button variant='outline' size='lg' className='gap-2' onClick={() => setStep(1)} disabled={isPending}>
              <ArrowBackIcon className='h-4 w-4' />
              Back
            </Button>
            <Button
              size='lg'
              className='flex-1 gap-2'
              onClick={() => writeContract?.()}
              disabled={writeContract == null || detailsError != null || isPending}
            >
              <AddIcon className='h-4 w-4' />
              Deploy {walletType === 'extended' ? 'Extended ' : walletType === 'advanced' ? 'Advanced ' : ''}MultiSig
            </Button>
          </div>

          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='w-full rounded-xl border border-primary bg-primary/10 p-4'
            >
              <div className='flex items-center justify-center gap-3'>
                <LoadingDots />
                <span className='text-sm font-medium text-primary'>
                  Please confirm the transaction in your wallet...
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default CreateMultiSigForm
