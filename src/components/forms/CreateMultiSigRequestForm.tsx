import React, { Fragment, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'
import { JsonFragment } from '@ethersproject/abi'
import { Button } from '@/components/ui/button'

import SelectContract from '../inputs/SelectContract'
import SelectFunction from '../inputs/SelectFunction'
import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import NewContract from '../modals/NewContract'
import BatchRequestForm from './BatchRequestForm'
import useContracts from '../../states/contracts'
import useAddressBook, { useAddressLabels } from '../../states/addressBook'
import useCallData from '../../hooks/useCallData'
import useMultiSigDetails from '../../hooks/useMultiSigDetails'
import useWalletType from '../../hooks/useWalletType'
import { BuildMultiSigRequest } from '../../models/MultiSigs'
import { buildRawSignatureFromFunction } from '../../utils/buildFunctionSignature'

interface CreateMultiSigRequestFormProps {
  multiSigAddress: `0x${string}`
}

const REQUEST_TYPES = [
  { id: 'contract', label: 'Call a contract', description: 'Pick a contract and function, fill in the arguments.' },
  { id: 'tx', label: 'Send a transaction', description: 'Send value or raw calldata to any address.' },
  { id: 'batch', label: 'Batch', description: 'Chain several calls into one multisig transaction.' }
] as const

const CreateMultiSigRequestForm: React.FC<CreateMultiSigRequestFormProps> = ({ multiSigAddress }) => {
  const [abi, setAbi] = useState<JsonFragment[] | null>(null)
  const [request, setRequest] = useState<BuildMultiSigRequest>({
    to: '0x',
    value: '0',
    txnGas: '35000',
    description: '',
    arguments: {}
  })
  const [type, setType] = useState<string>('contract')
  const [selectedContract, setSelectedContract] = useState<string | undefined>(undefined)
  const [selectedFunction, setSelectedFunction] = useState<string>('')
  const [pinnedNonce, setPinnedNonce] = useState<string>('')
  const contracts = useContracts((state) => state.contracts)
  const chainId = useChainId()
  const { entries: bookEntries, labelFor } = useAddressLabels(chainId)
  const { addEntry } = useAddressBook()
  const [receiverLabel, setReceiverLabel] = useState('')
  const callData = useCallData(abi, selectedFunction, request.to, request.arguments)
  const { address } = useAccount()
  const { walletType, allowOnlyOwnerRequest } = useWalletType(multiSigAddress)
  const { data: detailsData } = useMultiSigDetails(multiSigAddress, address ?? '0x')
  // Extended wallets can restrict request creation to owners; the API enforces
  // the same rule server-side.
  const isOwner = detailsData != null ? Boolean(detailsData[5]) : undefined
  const blockedByPolicy = allowOnlyOwnerRequest && isOwner === false

  const selectedFunctionFragment: JsonFragment | undefined =
    abi != null && selectedFunction
      ? abi.find((item) => buildRawSignatureFromFunction(item) === selectedFunction)
      : undefined

  const handleChangeContract = (e: string) => {
    if (e === 'itSelf') {
      setAbi(MyMultiSig as JsonFragment[])
      handleChangeValue(multiSigAddress, 'to')
    } else {
      const contract = contracts.find((c) => c.id === e)
      if (contract != null) {
        setAbi(contract.abi)
        handleChangeValue(contract.address, 'to')
      }
    }
    setSelectedContract(e)
  }

  const handleChangeValue = (e: string, key: string, argumentKey?: string) => {
    if (key === 'arguments' && argumentKey != null) {
      const newArguments = { ...request.arguments, [argumentKey]: e }
      setRequest({ ...request, [key]: newArguments })
    } else {
      setRequest({ ...request, [key]: e })
    }
  }
  const clearArguments = () => {
    setRequest({ ...request, arguments: {} })
  }

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div key={label} className='flex w-full flex-col gap-1.5'>
      <span className='text-sm font-semibold text-foreground'>{label}</span>
      {children}
      {hint != null && <span className='text-xs text-muted-foreground'>{hint}</span>}
    </div>
  )

  const readyToSign =
    type === 'tx'
      ? /^0x[a-fA-F0-9]{40}$/.test(request.to) && request.description !== ''
      : selectedContract != null && selectedFunction !== '' && request.description !== ''

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
      {selectedContract === 'newContract' && <NewContract />}
      <div className='flex w-full flex-col gap-6'>
        <div className='flex flex-col gap-3'>
          <span className='text-sm font-semibold text-foreground'>What kind of request?</span>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
            {REQUEST_TYPES.map((requestType) => (
              <button
                key={requestType.id}
                type='button'
                onClick={() => setType(requestType.id)}
                aria-pressed={type === requestType.id}
                className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors ${
                  type === requestType.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-muted/30 hover:border-primary/50'
                }`}
              >
                <span className='text-sm font-semibold text-foreground'>{requestType.label}</span>
                <span className='text-xs text-muted-foreground'>{requestType.description}</span>
              </button>
            ))}
          </div>
        </div>

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

        {type === 'batch' ? (
          <BatchRequestForm multiSigAddress={multiSigAddress} txnNonce={pinnedNonce} />
        ) : (
          <Fragment>
            <div className='flex flex-col gap-4 rounded-xl border border-border p-4'>
              <h3 className='text-base font-semibold text-foreground'>Target</h3>
              {type === 'contract' ? (
                <Fragment>
                  {field('Contract to call', <SelectContract onChange={(e) => handleChangeContract(e)} />)}
                  {field(
                    'Function to call',
                    <SelectFunction
                      abi={selectedContract === 'itSelf' ? (MyMultiSig as JsonFragment[]) : abi}
                      onChange={(e) => {
                        clearArguments()
                        setSelectedFunction(e)
                      }}
                    />
                  )}
                  {selectedFunctionFragment != null &&
                    Array.isArray(selectedFunctionFragment.inputs) &&
                    selectedFunctionFragment.inputs.length > 0 && (
                      <div className='flex flex-col gap-3 border-t border-border pt-3'>
                        <span className='text-sm font-semibold text-foreground'>Arguments</span>
                        {selectedFunctionFragment.inputs.map((item: JsonFragment) =>
                          field(
                            String(item.name),
                            <TextInput
                              className='md:w-full'
                              placeholder={String(item.name)}
                              onChange={(e) => handleChangeValue(e.target.value, 'arguments', item.name as string)}
                            />
                          )
                        )}
                      </div>
                    )}
                </Fragment>
              ) : (
                <div className='flex w-full flex-col gap-1.5'>
                  <span className='text-sm font-semibold text-foreground'>Receiver</span>
                  <TextInput
                    className='md:w-full'
                    placeholder='Receiver address (0x...) — saved addresses will be suggested'
                    value={request.to}
                    list='address-book-receivers'
                    onChange={(e) => handleChangeValue(e.target.value, 'to')}
                  />
                  <datalist id='address-book-receivers'>
                    {bookEntries.map((entry) => (
                      <option key={entry.id} value={entry.address}>
                        {entry.label}
                      </option>
                    ))}
                  </datalist>
                  {/^0x[a-fA-F0-9]{40}$/.test(request.to) &&
                    (labelFor(request.to) != null ? (
                      <span className='text-xs text-muted-foreground'>
                        Known as <span className='font-semibold text-foreground'>{labelFor(request.to)}</span> in your
                        address book.
                      </span>
                    ) : (
                      <div className='flex flex-wrap items-center gap-2 pt-1'>
                        <TextInput
                          className='h-auto w-56 py-1.5 md:w-56'
                          placeholder='Label this address (optional)'
                          value={receiverLabel}
                          onChange={(e) => setReceiverLabel(e.target.value)}
                        />
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={receiverLabel.trim() === ''}
                          onClick={() => {
                            addEntry({
                              chainId,
                              address: request.to as `0x${string}`,
                              label: receiverLabel.trim(),
                              kind: 'wallet'
                            })
                            setReceiverLabel('')
                          }}
                        >
                          Save to address book
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className='flex flex-col gap-4 rounded-xl border border-border p-4'>
              <h3 className='text-base font-semibold text-foreground'>Transaction details</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {field(
                  'Value (wei)',
                  <TextInput
                    className='md:w-full'
                    placeholder='0'
                    value={request.value}
                    onChange={(e) => handleChangeValue(e.target.value, 'value')}
                  />,
                  'Native currency sent along with the call.'
                )}
                {field(
                  'Gas limit',
                  <TextInput
                    className='md:w-full'
                    placeholder='35000'
                    value={request.txnGas}
                    onChange={(e) => handleChangeValue(e.target.value, 'txnGas')}
                  />,
                  'Gas forwarded to the inner call.'
                )}
              </div>
              {field(
                'Description',
                <TextInput
                  className='md:w-full'
                  placeholder='What is this request for? Other owners will see this.'
                  value={request.description}
                  onChange={(e) => handleChangeValue(e.target.value, 'description')}
                />
              )}
            </div>

            {readyToSign ? (
              <div className='flex justify-end'>
                <SignRequest
                  multiSigAddress={multiSigAddress}
                  description={request.description}
                  args={{
                    to: request.to,
                    value: request.value,
                    data: type !== 'tx' && callData.callData != null ? `0x${callData.callData.substring(2)}` : '0x',
                    txnGas: request.txnGas,
                    signatures: '',
                    ...(pinnedNonce !== '' && /^\d+$/.test(pinnedNonce) ? { txnNonce: pinnedNonce } : {})
                  }}
                />
              </div>
            ) : (
              <p className='text-center text-xs text-muted-foreground'>
                {type === 'tx'
                  ? 'Enter a valid receiver address and a description to sign the request.'
                  : 'Pick a contract and function, then add a description to sign the request.'}
              </p>
            )}
          </Fragment>
        )}
      </div>
    </Fragment>
  )
}

export default CreateMultiSigRequestForm
