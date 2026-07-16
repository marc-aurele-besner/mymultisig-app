import React, { useState } from 'react'
import { encodeFunctionData, toHex, type Abi } from 'viem'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import TextInput from '../inputs/TextInput'
import SignRequest from '../buttons/SignRequest'
import useMessageSigning from '../../hooks/useMessageSigning'

interface MessageSigningPanelProps {
  multiSigAddress: `0x${string}`
}

const DEFAULT_MESSAGE_GAS = '75000'

const isHex = (value: string) => /^0x[a-fA-F0-9]*$/.test(value)

// EIP-1271 message signing (0.5.0 wallets): the wallet can act as a signer
// for SIWE verifiers, marketplaces or other multisigs by registering a
// message hash on-chain. Registering/unregistering is a signMessage /
// unsignMessage self-call, i.e. a normal multisig request; this panel checks
// a message's status and builds those requests.
const MessageSigningPanel: React.FC<MessageSigningPanelProps> = ({ multiSigAddress }) => {
  const [message, setMessage] = useState('')

  // Plain text is hex-encoded; a 0x string is taken as raw bytes.
  const messageBytes: `0x${string}` | null =
    message === '' ? null : isHex(message) ? (message as `0x${string}`) : toHex(message)
  const { supportsMessageSigning, messageHash, isSigned } = useMessageSigning(multiSigAddress, messageBytes)

  const encodedAction =
    messageBytes != null && isSigned != null
      ? encodeFunctionData({
          abi: MyMultiSig as Abi,
          functionName: isSigned ? 'unsignMessage' : 'signMessage',
          args: [messageBytes]
        })
      : null

  return (
    <div className='flex w-full flex-col gap-3 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>Message signing (EIP-1271)</h3>
        <p className='text-sm text-muted-foreground'>
          This wallet can sign messages for other applications (Sign-In with Ethereum, marketplaces, other multisigs).
          Once the owners approve a signMessage request, any verifier calling isValidSignature accepts the message.
        </p>
      </div>
      <div className='flex flex-col gap-1.5'>
        <span className='text-sm font-semibold text-foreground'>Message</span>
        <TextInput
          className='md:w-full'
          placeholder='Plain text, or 0x-prefixed bytes'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {message !== '' && !supportsMessageSigning && (
        <p className='text-sm text-muted-foreground'>
          This wallet predates 0.5.0 and has no on-chain message registry.
        </p>
      )}
      {supportsMessageSigning && messageHash != null && (
        <div className='flex flex-col gap-2'>
          <span className='break-all font-mono text-xs text-muted-foreground'>Hash: {messageHash}</span>
          <span className={`text-sm font-semibold ${isSigned ? 'text-primary' : 'text-foreground'}`}>
            {isSigned ? 'This message is signed by the wallet.' : 'This message is not signed.'}
          </span>
          {encodedAction != null && (
            <SignRequest
              multiSigAddress={multiSigAddress}
              description={
                isSigned
                  ? `Revoke the wallet's EIP-1271 signature of: ${message.slice(0, 80)}`
                  : `Sign message via EIP-1271: ${message.slice(0, 80)}`
              }
              args={{
                to: multiSigAddress,
                value: '0',
                data: encodedAction,
                txnGas: DEFAULT_MESSAGE_GAS,
                signatures: ''
              }}
            />
          )}
          <p className='text-xs text-muted-foreground'>
            {isSigned
              ? 'Revoking creates a multisig request calling unsignMessage.'
              : 'Signing creates a multisig request calling signMessage; the message counts as signed once that request executes.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default MessageSigningPanel
