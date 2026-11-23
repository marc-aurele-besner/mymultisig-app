import React, { useEffect, useMemo, useState } from 'react'
import { encodeFunctionData, type Abi } from 'viem'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import MyMultiSig from 'mymultisig-contract/abi/MyMultiSig.json'

import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/code-block'
import TextInput from '../inputs/TextInput'
import Textarea from '../inputs/Textarea'
import SignRequest from '../buttons/SignRequest'
import useMessageSigning from '../../hooks/useMessageSigning'
import { eip1271DigestFor } from '../../utils/eip1271'
import { combineSignatures } from '../../utils/signatureBlob'
import { WALLET_BOUND_EIP1271_FROM_VERSION } from '../../utils/contractVersions'

interface MessageSigningPanelProps {
  multiSigAddress: `0x${string}`
  // From the wallet's name()/version()/threshold()/getOwners(). The off-chain
  // vote section needs them; without them only the on-chain registry shows.
  walletName?: string
  walletVersion?: string
  threshold?: number
  owners?: string[]
}

type Vote = { owner: `0x${string}`; sig: `0x${string}` }

const DEFAULT_MESSAGE_GAS = '75000'

const ADDRESS = /^0x[0-9a-fA-F]{40}$/
const SIGNATURE = /^0x[0-9a-fA-F]+$/

// One "owner signature" pair per line, separated by a space, comma or colon.
const parseVotes = (text: string): Vote[] =>
  text
    .split('\n')
    .map((line) => line.trim().split(/[\s,:]+/))
    .filter(([owner, sig]) => ADDRESS.test(owner ?? '') && SIGNATURE.test(sig ?? ''))
    .map(([owner, sig]) => ({ owner: owner as `0x${string}`, sig: sig as `0x${string}` }))

// EIP-1271 message signing: the wallet can act as a signer for SIWE
// verifiers, marketplaces or other multisigs. A verifier asks
// isValidSignature(digest, signature), and the wallet answers yes when
// - the owners registered the digest on-chain (a signMessage self-call, i.e.
//   a normal multisig request; verifiers then pass an empty signature), or
// - on 0.5.2+ wallets, the signature carries threshold owner votes, each
//   signed over the digest bound to this wallet (MyMultiSigMessage typed data).
const MessageSigningPanel: React.FC<MessageSigningPanelProps> = ({
  multiSigAddress,
  walletName,
  walletVersion,
  threshold,
  owners
}) => {
  const { address } = useAccount()
  const [input, setInput] = useState('')
  const [ownVote, setOwnVote] = useState<Vote | null>(null)
  const [otherVotes, setOtherVotes] = useState('')
  const [isSigning, setIsSigning] = useState(false)

  const dataHash = input === '' ? null : eip1271DigestFor(input)
  const wallet = walletName != null && walletVersion != null ? { name: walletName, version: walletVersion } : undefined
  const { supportsMessageSigning, supportsVotes, message, messageHash, isSigned, signVote } = useMessageSigning(
    multiSigAddress,
    dataHash,
    wallet
  )

  // A vote only counts for the digest it was signed for.
  useEffect(() => setOwnVote(null), [dataHash])

  const isOwner = address != null && (owners ?? []).some((o) => o.toLowerCase() === address.toLowerCase())

  const votes = useMemo(() => {
    const byOwner = new Map<string, Vote>()
    for (const vote of [...(ownVote ? [ownVote] : []), ...parseVotes(otherVotes)])
      if (!byOwner.has(vote.owner.toLowerCase())) byOwner.set(vote.owner.toLowerCase(), vote)
    return [...byOwner.values()]
  }, [ownVote, otherVotes])
  const blob =
    votes.length > 0
      ? combineSignatures(
          walletVersion,
          votes.map((v) => v.owner),
          votes.map((v) => v.sig)
        )
      : null

  const encodedAction =
    message != null && isSigned != null
      ? encodeFunctionData({
          abi: MyMultiSig as Abi,
          functionName: isSigned ? 'unsignMessage' : 'signMessage',
          args: [message]
        })
      : null

  const handleSignVote = async () => {
    if (address == null) return
    setIsSigning(true)
    try {
      const sig = await signVote()
      if (sig != null) setOwnVote({ owner: address, sig })
    } catch (error) {
      console.error('EIP-1271 vote signing error', error)
      toast.error('The signature was not created.')
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <div className='flex w-full flex-col gap-3 rounded-lg border border-border p-4'>
      <div>
        <h3 className='text-xl font-bold text-foreground'>Message signing (EIP-1271)</h3>
        <p className='text-sm text-muted-foreground'>
          This wallet can sign messages for other applications (Sign-In with Ethereum, marketplaces, other multisigs).
          They check the signature by calling isValidSignature on this wallet.
        </p>
      </div>
      {walletVersion != null && !supportsVotes && (
        <div
          role='note'
          className='rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-foreground'
        >
          <p className='font-semibold'>Owner signatures are not tied to this wallet (version {walletVersion})</p>
          <p className='mt-1 text-muted-foreground'>
            Before {WALLET_BOUND_EIP1271_FROM_VERSION}, isValidSignature checks owner signatures against the raw digest.
            The same signatures work on every wallet with the same owners, and a signature an owner makes for their own
            address (a token permit, for example) also counts for this wallet.
            {threshold === 1 &&
              ' With a threshold of 1, one owner signing anything for their own address is enough to sign for this wallet.'}{' '}
            Use the on-chain approval below. A deployed wallet cannot be upgraded: to close this, move funds to a wallet
            on version {WALLET_BOUND_EIP1271_FROM_VERSION} or later once one can be created.
          </p>
        </div>
      )}
      <div className='flex flex-col gap-1.5'>
        <span className='text-sm font-semibold text-foreground'>Message or digest</span>
        <TextInput
          className='md:w-full'
          placeholder='Plain text, 0x-prefixed bytes, or a 32-byte digest'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <span className='text-xs text-muted-foreground'>
          A 32-byte hex value is used as the digest (a permit or order hash). Anything else is hashed the way Sign-In
          with Ethereum verifiers hash a message (EIP-191).
        </span>
      </div>
      {input !== '' && !supportsMessageSigning && (
        <p className='text-sm text-muted-foreground'>
          This wallet predates 0.5.0 and has no on-chain message registry.
        </p>
      )}
      {supportsMessageSigning && dataHash != null && messageHash != null && (
        <div className='flex flex-col gap-2'>
          <span className='break-all font-mono text-xs text-muted-foreground'>Digest: {dataHash}</span>
          <span className='break-all font-mono text-xs text-muted-foreground'>Wallet hash: {messageHash}</span>

          <h4 className='mt-2 text-sm font-semibold text-foreground'>On-chain approval</h4>
          <span className={`text-sm font-semibold ${isSigned ? 'text-primary' : 'text-foreground'}`}>
            {isSigned ? 'This message is signed by the wallet.' : 'This message is not signed.'}
          </span>
          {encodedAction != null && (
            <SignRequest
              multiSigAddress={multiSigAddress}
              description={
                isSigned
                  ? `Revoke the wallet's EIP-1271 signature of: ${input.slice(0, 80)}`
                  : `Sign message via EIP-1271: ${input.slice(0, 80)}`
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
              : 'Signing creates a multisig request calling signMessage. Once it executes, verifiers accept the message with an empty signature.'}
          </p>

          <h4 className='mt-2 text-sm font-semibold text-foreground'>Off-chain owner signatures</h4>
          {supportsVotes ? (
            <>
              <p className='text-xs text-muted-foreground'>
                Each owner signs the digest bound to this wallet, so the signatures are useless on any other wallet.
                Collect {threshold ?? 'threshold'} and hand the combined signature to the verifier.
              </p>
              {isOwner && ownVote == null && (
                <Button variant='outline' className='self-start' onClick={handleSignVote} disabled={isSigning}>
                  {isSigning ? 'Waiting for your wallet…' : 'Sign as owner'}
                </Button>
              )}
              {ownVote != null && (
                <CodeBlock
                  title='Your signature (share it with the other owners)'
                  code={`${ownVote.owner} ${ownVote.sig}`}
                  language='text'
                />
              )}
              <Textarea
                className='md:w-full'
                placeholder='Other owners’ signatures, one per line: 0xowner 0xsignature'
                value={otherVotes}
                onChange={(e) => setOtherVotes(e.target.value)}
              />
              {blob != null && (
                <>
                  <span className='text-sm text-foreground'>
                    {votes.length} of {threshold ?? '?'} signatures collected.
                  </span>
                  <CodeBlock title='Combined signature for isValidSignature' code={blob} language='text' />
                </>
              )}
            </>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Not offered on this wallet. Use the on-chain approval above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MessageSigningPanel
