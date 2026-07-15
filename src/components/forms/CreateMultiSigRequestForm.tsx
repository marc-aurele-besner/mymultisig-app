import React, { Fragment, useState } from 'react'
import { useAccount } from 'wagmi'
import { encodeFunctionData, type Abi } from 'viem'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import TextInput from '../inputs/TextInput'
import AddressBookInput from '../inputs/AddressBookInput'
import SignRequest from '../buttons/SignRequest'
import NewContract from '../modals/NewContract'
import { AddIcon, DeleteIcon } from '../icons/ChakraIcons'
import useContracts from '../../states/contracts'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import { buildRawSignatureFromFunction } from '../../utils/buildFunctionSignature'

interface CreateMultiSigRequestFormProps {
  multiSigAddress: `0x${string}`
}

// One request = one or more steps. A single step signs as a plain request;
// several steps are wrapped into one multiRequest (batch) transaction.
interface RequestStep {
  contractKey: string // 'custom' | 'itSelf' | saved contract id
  to: string
  functionSig: string // '' = raw calldata
  args: Record<string, string>
  value: string
  txnGas: string
  data: string
}

const EMPTY_STEP: RequestStep = {
  contractKey: 'custom',
  to: '',
  functionSig: '',
  args: {},
  value: '0',
  txnGas: '35000',
  data: '0x'
}

// Gas consumed by the multiRequest loop itself, on top of the inner calls.
const BATCH_OVERHEAD_GAS = 50000

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)
const isUint = (value: string) => /^\d+$/.test(value)
const isHex = (value: string) => /^0x[a-fA-F0-9]*$/.test(value)

const writeableFunctions = (abi: JsonFragment[] | null) =>
  abi?.filter(
    (item) => item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
  ) ?? []

const fragmentFor = (abi: JsonFragment[] | null, functionSig: string) =>
  functionSig !== '' ? abi?.find((item) => buildRawSignatureFromFunction(item) === functionSig) : undefined

// Encoded calldata for a step: from the selected function + args when a
// contract function is chosen, otherwise the raw calldata field.
const encodeStepData = (step: RequestStep, abi: JsonFragment[] | null): `0x${string}` | null => {
  const fragment = fragmentFor(abi, step.functionSig)
  if (fragment != null) {
    try {
      const args = (fragment.inputs ?? []).map((input) => {
        const raw = step.args[String(input.name)] ?? ''
        return input.type != null && input.type.includes('[') ? JSON.parse(raw) : raw
      })
      return encodeFunctionData({
        abi: [fragment] as unknown as Abi,
        functionName: String(fragment.name),
        args
      })
    } catch {
      return null
    }
  }
  return isHex(step.data) ? (step.data as `0x${string}`) : null
}

const CreateMultiSigRequestForm: React.FC<CreateMultiSigRequestFormProps> = ({ multiSigAddress }) => {
  const [steps, setSteps] = useState<RequestStep[]>([{ ...EMPTY_STEP }])
  const [description, setDescription] = useState('')
  const [pinnedNonce, setPinnedNonce] = useState('')
  const [newContractKey, setNewContractKey] = useState(0)
  const [showNewContract, setShowNewContract] = useState(false)
  const contracts = useContracts((state) => state.contracts)
  const { address } = useAccount()
  const { walletType, allowOnlyOwnerRequest } = useWalletType(multiSigAddress)
  const { data: detailsData } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  // Extended wallets can restrict request creation to owners; the API enforces
  // the same rule server-side.
  const isOwner = detailsData != null ? Boolean(detailsData[5]) : undefined
  const blockedByPolicy = allowOnlyOwnerRequest && isOwner === false

  const abiForStep = (step: RequestStep): JsonFragment[] | null => {
    if (step.contractKey === 'itSelf') return MyMultiSig as JsonFragment[]
    const contract = contracts.find((c) => c.id === step.contractKey)
    return contract?.abi ?? null
  }

  const updateStep = (index: number, patch: Partial<RequestStep>) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)))
  }
  const addStep = () => setSteps([...steps, { ...EMPTY_STEP }])
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index))

  const handleContractChange = (index: number, key: string) => {
    if (key === 'newContract') {
      setNewContractKey((k) => k + 1)
      setShowNewContract(true)
      return
    }
    if (key === 'custom') {
      updateStep(index, { contractKey: 'custom', functionSig: '', args: {} })
      return
    }
    const to = key === 'itSelf' ? multiSigAddress : (contracts.find((c) => c.id === key)?.address ?? '')
    updateStep(index, { contractKey: key, to, functionSig: '', args: {}, data: '0x' })
  }

  // What is stopping this step from being valid, in words the user can act on.
  const stepError = (step: RequestStep): string | null => {
    if (!isAddress(step.to)) return 'needs a valid target address'
    if (!isUint(step.value)) return 'needs a whole number for value'
    if (!isUint(step.txnGas)) return 'needs a whole number for gas'
    const fragment = fragmentFor(abiForStep(step), step.functionSig)
    if (fragment != null) {
      if ((fragment.inputs ?? []).some((input) => (step.args[String(input.name)] ?? '').trim() === ''))
        return 'needs every function argument filled in'
      if (encodeStepData(step, abiForStep(step)) == null) return 'has arguments that do not encode'
      return null
    }
    if (!isHex(step.data)) return 'has calldata that is not valid hex'
    return null
  }

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div key={label} className='flex w-full flex-col gap-1.5'>
      <span className='text-sm font-semibold text-foreground'>{label}</span>
      {children}
      {hint != null && <span className='text-xs text-muted-foreground'>{hint}</span>}
    </div>
  )

  const firstInvalidIndex = steps.findIndex((s) => stepError(s) != null)
  const stepsValid = firstInvalidIndex === -1
  const ready = stepsValid && description.trim() !== ''
  const isBatch = steps.length > 1
  const totalStepGas = steps.reduce((sum, s) => (isUint(s.txnGas) ? sum + Number(s.txnGas) : sum), 0)

  // Sign args: a single step goes out as-is; several steps self-call
  // multiRequest so all of them run in one multisig transaction.
  let signArgs: { to: `0x${string}`; value: string; data: `0x${string}`; txnGas: string } | null = null
  let batchSteps: { to: `0x${string}`; value: string; data: `0x${string}`; txnGas: string }[] | undefined
  if (ready) {
    const encodedSteps = steps.map((s) => encodeStepData(s, abiForStep(s)))
    if (encodedSteps.every((d): d is `0x${string}` => d != null)) {
      if (!isBatch) {
        signArgs = {
          to: steps[0].to as `0x${string}`,
          value: steps[0].value,
          data: encodedSteps[0],
          txnGas: steps[0].txnGas
        }
      } else {
        try {
          const encoded = encodeFunctionData({
            abi: MyMultiSig as Abi,
            functionName: 'multiRequest',
            args: [
              steps.map((s) => s.to),
              steps.map((s) => BigInt(s.value)),
              encodedSteps,
              steps.map((s) => BigInt(s.txnGas))
            ]
          })
          signArgs = {
            to: multiSigAddress,
            value: '0',
            data: encoded,
            txnGas: String(totalStepGas + BATCH_OVERHEAD_GAS)
          }
          batchSteps = steps.map((s, i) => ({
            to: s.to as `0x${string}`,
            value: s.value,
            data: encodedSteps[i],
            txnGas: s.txnGas
          }))
        } catch {
          signArgs = null
        }
      }
    }
  }

  if (blockedByPolicy)
    return (
      <div className='rounded-lg border border-border p-4'>
        <p className='text-sm text-muted-foreground'>
          This wallet only accepts transaction requests from its owners, and the connected account is not an owner.
        </p>
      </div>
    )

  return (
    <Fragment>
      {showNewContract && <NewContract key={newContractKey} />}
      <div className='flex w-full flex-col gap-4'>
        {isBatch && (
          <p className='text-sm text-muted-foreground'>
            All steps run in order inside one multisig transaction. A failed step is reported per-step and does not
            revert the others.
          </p>
        )}

        {steps.map((step, i) => {
          const abi = abiForStep(step)
          const functions = writeableFunctions(abi)
          const fragment = fragmentFor(abi, step.functionSig)
          const encodedPreview = fragment != null ? encodeStepData(step, abi) : null
          const toInvalid = step.to.startsWith('0x') && step.to.length > 2 && !isAddress(step.to)
          return (
            <div key={i} className='flex flex-col gap-4 rounded-xl border border-border p-4'>
              <div className='flex items-center justify-between'>
                <h3 className='flex items-baseline gap-2 text-base font-semibold text-foreground'>
                  {isBatch && <span className='font-mono text-sm text-primary'>{String(i + 1).padStart(2, '0')}</span>}
                  {isBatch ? `Step ${i + 1}` : 'What should this request do?'}
                </h3>
                {isBatch && (
                  <Button variant='outline' size='icon' aria-label={`Remove step ${i + 1}`} onClick={() => removeStep(i)}>
                    <DeleteIcon className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {field(
                'Contract (optional)',
                <Select value={step.contractKey} onValueChange={(v) => handleContractChange(i, v)}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Custom address' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='custom'>Custom address</SelectItem>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.isMultiSig ? 'itSelf' : contract.id}>
                        {contract.name}
                        {contract.isMultiSig ? ' (this wallet)' : ''}
                      </SelectItem>
                    ))}
                    <SelectItem value='newContract'>+ New contract</SelectItem>
                  </SelectContent>
                </Select>,
                'Pick a saved contract to choose one of its functions, or leave on custom address.'
              )}

              {field(
                'Send to',
                <AddressBookInput
                  placeholder='Receiver or contract address (0x...)'
                  value={step.to}
                  isInvalid={toInvalid}
                  allowSave
                  onChange={(value) =>
                    updateStep(
                      i,
                      step.contractKey === 'custom'
                        ? { to: value }
                        : { to: value, contractKey: 'custom', functionSig: '', args: {} }
                    )
                  }
                />
              )}

              {abi != null &&
                functions.length > 0 &&
                field(
                  'Function to call',
                  <Select
                    value={step.functionSig}
                    onValueChange={(v) => updateStep(i, { functionSig: v, args: {} })}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a function' />
                    </SelectTrigger>
                    <SelectContent>
                      {functions.map((item) => (
                        <SelectItem key={buildRawSignatureFromFunction(item)} value={buildRawSignatureFromFunction(item)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

              {fragment != null && (fragment.inputs ?? []).length > 0 && (
                <div className='flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3'>
                  <span className='text-sm font-semibold text-foreground'>Arguments</span>
                  {(fragment.inputs ?? []).map((input) =>
                    field(
                      `${String(input.name)} (${String(input.type ?? '')})`,
                      input.type === 'address' ? (
                        <AddressBookInput
                          placeholder={`${String(input.name)} address (0x...)`}
                          value={step.args[String(input.name)] ?? ''}
                          onChange={(value) => updateStep(i, { args: { ...step.args, [String(input.name)]: value } })}
                        />
                      ) : (
                        <TextInput
                          className='md:w-full'
                          placeholder={input.type?.includes('[') ? `JSON array, e.g. ["a", "b"]` : String(input.name)}
                          value={step.args[String(input.name)] ?? ''}
                          onChange={(e) => updateStep(i, { args: { ...step.args, [String(input.name)]: e.target.value } })}
                        />
                      )
                    )
                  )}
                </div>
              )}

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {field(
                  'Value (wei)',
                  <TextInput
                    className='md:w-full'
                    placeholder='0'
                    value={step.value}
                    isInvalid={step.value !== '' && !isUint(step.value)}
                    onChange={(e) => updateStep(i, { value: e.target.value.trim() })}
                  />,
                  'Native currency sent along with the call. Leave 0 for none.'
                )}
                {field(
                  'Gas limit',
                  <TextInput
                    className='md:w-full'
                    placeholder='35000'
                    value={step.txnGas}
                    isInvalid={step.txnGas !== '' && !isUint(step.txnGas)}
                    onChange={(e) => updateStep(i, { txnGas: e.target.value.trim() })}
                  />,
                  'Gas forwarded to the inner call.'
                )}
              </div>

              {fragment != null
                ? field(
                    'Calldata',
                    <div className='break-all rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-xs text-muted-foreground'>
                      {encodedPreview ?? 'Fill in the arguments above to encode the calldata.'}
                    </div>,
                    `Encoded from ${String(fragment.name)}(…) — it updates as you edit the arguments.`
                  )
                : field(
                    'Calldata',
                    <TextInput
                      className='font-mono md:w-full'
                      placeholder='0x'
                      value={step.data}
                      isInvalid={!isHex(step.data)}
                      spellCheck={false}
                      autoComplete='off'
                      onChange={(e) => updateStep(i, { data: e.target.value.trim() })}
                    />,
                    'Leave 0x to just send value, or paste pre-encoded calldata.'
                  )}
            </div>
          )
        })}

        <div className='flex flex-wrap items-center justify-between gap-2'>
          <Button variant='outline' className='gap-2' onClick={addStep}>
            <AddIcon className='h-4 w-4' />
            Add a step
          </Button>
          {isBatch ? (
            <span className='font-mono text-xs text-muted-foreground'>
              {steps.length} steps · {totalStepGas.toLocaleString()} gas + {BATCH_OVERHEAD_GAS.toLocaleString()} batch
              overhead
            </span>
          ) : (
            <span className='text-xs text-muted-foreground'>
              Adding steps chains several calls into one multisig transaction.
            </span>
          )}
        </div>

        <div className='flex flex-col gap-4 rounded-xl border border-border p-4'>
          <h3 className='text-base font-semibold text-foreground'>Request details</h3>
          {field(
            'Description',
            <TextInput
              className='md:w-full'
              placeholder='What is this request for? Other owners will see this.'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}
          {walletType === 'extended' &&
            field(
              'Pin to nonce (optional)',
              <TextInput
                className='md:w-full'
                placeholder='Leave empty to use the current nonce'
                value={pinnedNonce}
                onChange={(e) => setPinnedNonce(e.target.value)}
              />,
              'Binds the request to an exact nonce so it can be pre-signed or ordered explicitly.'
            )}
        </div>

        {ready && signArgs != null ? (
          <div className='flex justify-end'>
            <SignRequest
              multiSigAddress={multiSigAddress}
              description={description}
              args={{
                ...signArgs,
                signatures: '',
                ...(pinnedNonce !== '' && /^\d+$/.test(pinnedNonce) ? { txnNonce: pinnedNonce } : {}),
                ...(batchSteps != null ? { batchSteps } : {})
              }}
            />
          </div>
        ) : (
          <p className='text-center text-xs text-muted-foreground'>
            {firstInvalidIndex !== -1
              ? `${isBatch ? `Step ${firstInvalidIndex + 1}` : 'The request'} ${stepError(steps[firstInvalidIndex])}.`
              : 'Add a description so the other owners know what this request does.'}
          </p>
        )}
      </div>
    </Fragment>
  )
}

export default CreateMultiSigRequestForm
