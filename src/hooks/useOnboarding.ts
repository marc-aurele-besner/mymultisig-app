import { useEffect, useMemo, useState } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'

import { faucetsFor } from '../constants/faucets'

import useActiveWallet from './useActiveWallet'
import useInbox from './useInbox'
import useOnboardingState from '../states/onboarding'
import { fetchSiweSession } from '../utils/siwe'
import { walletHref } from '../components/shell/navigation'
import { exchangeFunding } from '../utils/exchangeNetwork'

export interface OnboardingStep {
  key: 'connect' | 'signin' | 'wallet' | 'fund' | 'request' | 'execute' | 'notify'
  title: string
  description: string
  done: boolean
  // Where the step is completed. Absent when it happens in the wallet
  // extension (connect, sign in) or needs an earlier step first.
  href?: string
  cta?: string
  // External help shown under the description, e.g. testnet faucets.
  links?: { label: string; href: string }[]
}

export interface Onboarding {
  steps: OnboardingStep[]
  doneCount: number
  total: number
  percent: number
  next: OnboardingStep | null
  isComplete: boolean
}

// Progress through the first-run path, derived from real state: the wallet
// connection, the SIWE session, the multisigs saved in this browser, the
// active wallet's balance, and its request queue.
const useOnboarding = (): Onboarding => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { wallet, wallets } = useActiveWallet()
  const { hasAnyRequest, hasExecutedRequest } = useInbox()
  const { notificationsVisited } = useOnboardingState()
  const [sessionAddress, setSessionAddress] = useState<string | null>(null)
  const { data: balance } = useBalance({
    address: wallet?.address,
    chainId: wallet?.chainId,
    query: { enabled: wallet != null }
  })

  useEffect(() => {
    if (address == null) {
      setSessionAddress(null)
      return
    }
    let cancelled = false
    const check = () =>
      void fetchSiweSession().then((session) => {
        if (!cancelled) setSessionAddress(session)
      })
    check()
    // The sign-in prompt resolves in the wallet extension; re-check when the
    // user comes back to the tab.
    window.addEventListener('focus', check)
    return () => {
      cancelled = true
      window.removeEventListener('focus', check)
    }
  }, [address, wallets.length])

  return useMemo(() => {
    const signedIn = address != null && sessionAddress?.toLowerCase() === address.toLowerCase()
    const hasWallet = wallets.length > 0
    const funded = balance != null && balance.value > BigInt(0)
    const executed = hasExecutedRequest || wallets.some((w) => Number(w.nonce) > 0)
    const funding = wallet != null ? exchangeFunding(wallet.chainId) : null
    const fundFaucets = faucetsFor(wallet?.chainId ?? chainId).map((f) => ({ label: f.name, href: f.url }))
    const steps: OnboardingStep[] = [
      {
        key: 'connect',
        title: 'Connect a wallet',
        description: 'Your wallet is your identity. Nothing is created yet.',
        done: isConnected
      },
      {
        key: 'signin',
        title: 'Sign in (free, no transaction)',
        description: 'One signature proves you own the wallet and syncs your multisigs across devices.',
        done: signedIn
      },
      {
        key: 'wallet',
        title: 'Create or import a multisig',
        description: 'Pick the owners and how many must approve. One transaction deploys it.',
        done: hasWallet,
        href: '/create-multisig',
        cta: 'Create'
      },
      {
        key: 'fund',
        title: 'Fund it',
        description:
          funding == null
            ? 'Send it a little of the network’s main coin (ETH on Ethereum, POL on Polygon) so it has something to manage.'
            : funding.isTestnet
              ? `Get free test ${funding.symbol} from a ${funding.network} faucet and send it to the multisig address.`
              : `Send a little ${funding.symbol} on ${funding.network} to the multisig address. Withdrawing from an exchange? Pick ${funding.network} as the network.`,
        done: hasWallet && (funded || executed),
        links: fundFaucets,
        href: wallet != null ? walletHref(wallet.address) : undefined,
        cta: 'Fund'
      },
      {
        key: 'request',
        title: 'Propose your first request',
        description: 'Describe a transfer or call. Your signature is the first approval.',
        done: hasAnyRequest || executed,
        href: wallet != null ? walletHref(wallet.address, 'buildRequest') : undefined,
        cta: 'Propose'
      },
      {
        key: 'execute',
        title: 'Collect approvals and send it',
        description: 'Share the request link. Once enough owners approve, any owner sends it and pays the small network fee.',
        done: executed,
        href: wallet != null ? walletHref(wallet.address, 'requests') : undefined,
        cta: 'Open queue'
      },
      {
        key: 'notify',
        title: 'Turn on notifications',
        description: 'Email, Slack, Discord or Telegram tell signers when it is their turn.',
        done: notificationsVisited,
        href: '/integration',
        cta: 'Choose'
      }
    ]
    const doneCount = steps.filter((s) => s.done).length
    return {
      steps,
      doneCount,
      total: steps.length,
      percent: Math.round((doneCount / steps.length) * 100),
      next: steps.find((s) => !s.done) ?? null,
      isComplete: doneCount === steps.length
    }
  }, [
    address,
    isConnected,
    chainId,
    sessionAddress,
    wallets,
    wallet,
    balance,
    hasAnyRequest,
    hasExecutedRequest,
    notificationsVisited
  ])
}

export default useOnboarding
