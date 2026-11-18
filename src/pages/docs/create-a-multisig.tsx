import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import GuideLayout, {
  GuideSection,
  GuideText,
  GuideList,
  GuideNote,
  GuideSteps
} from '../../components/docs/GuideLayout'
import { GUIDE_DATES, guidePageProps, guideStructuredData } from '../../components/docs/guideMeta'

const steps = [
  { name: 'Connect your wallet', text: 'Connect MetaMask, Coinbase Wallet, WalletConnect, or any injected wallet.' },
  {
    name: 'Pick a network',
    text: 'Choose the EVM network the multisig will live on. Testnets are available for a dry run.'
  },
  { name: 'Name the multisig', text: 'Give the wallet a human-readable name so co-owners can recognize it.' },
  { name: 'Add the owners', text: 'Enter the wallet address of every owner. Each owner signs with their own wallet.' },
  { name: 'Set the threshold', text: 'Choose how many owner approvals a transaction needs, e.g. 2 of 3.' },
  { name: 'Deploy', text: 'Confirm the deployment transaction. The factory contract deploys your multisig onchain.' }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to create a multisig wallet',
  description: 'Deploy a shared multisig wallet on Ethereum or any supported EVM network with MyMultiSig.',
  ...guideStructuredData('create-a-multisig'),
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text
  }))
}

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      <GuideLayout
        updated={GUIDE_DATES['create-a-multisig'].dateModified}
        kicker='HOW-TO'
        title='Create a multisig'
        lead='Deploying a multisig with MyMultiSig takes one transaction. You choose the owners and the approval threshold; the factory contract does the rest.'
        cta={{
          title: 'Create yours now',
          text: 'Pick the owners and the threshold. Deploying takes one transaction.',
          primary: { label: 'Create a multisig', href: '/create-multisig' },
          secondary: { label: 'See supported networks', href: '/networks' }
        }}
        related={[
          { title: 'Propose, sign, and execute transactions', href: '/docs/propose-sign-execute' },
          { title: 'What is a multisig?', href: '/docs/what-is-a-multisig' }
        ]}
      >
        <GuideSection title='Before you start'>
          <GuideList>
            <li>
              A wallet (MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet) with enough native currency
              to pay for one deployment transaction.
            </li>
            <li>
              The <strong>address of every owner</strong> you want on the wallet. Double-check them — owners can only be
              changed later through a multisig transaction that meets the threshold.
            </li>
            <li>
              A decision on the <strong>threshold</strong>. Unsure?{' '}
              <Link href='/docs/what-is-a-multisig'>The multisig guide</Link> covers the common setups; 2 of 3 is a
              solid default for small teams.
            </li>
          </GuideList>
        </GuideSection>

        <GuideSection title='Step by step'>
          <GuideSteps>
            <li>
              <strong>Connect your wallet.</strong> Open <Link href='/create-multisig'>Create a multisig</Link> and
              connect with the wallet that will pay the deployment gas.
            </li>
            <li>
              <strong>Pick a network.</strong> The multisig lives on one chain — see the{' '}
              <Link href='/networks'>supported networks</Link>. To practice first, pick a testnet like Sepolia; the flow
              is identical and the funds are free.
            </li>
            <li>
              <strong>Name the multisig.</strong> The name is a label to help you and your co-owners recognize the
              wallet; it does not affect the contract.
            </li>
            <li>
              <strong>Add the owners.</strong> Enter each owner&rsquo;s address. Every owner will approve transactions
              by signing with their own wallet — no shared secrets.
            </li>
            <li>
              <strong>Set the threshold.</strong> The number of approvals required to execute a transaction. It must be
              at least 1 and at most the number of owners.
            </li>
            <li>
              <strong>Deploy.</strong> Review the summary and confirm the transaction. The factory deploys the contract,
              and once it confirms, the new multisig appears in <Link href='/open-multisig'>your multisigs</Link>.
            </li>
          </GuideSteps>
        </GuideSection>

        <GuideSection title='After deployment'>
          <GuideText>
            Share the multisig address with your co-owners — they can{' '}
            <Link href='/docs/import-a-multisig'>import it by address</Link> to see it on their own devices. Fund the
            wallet by sending assets to its address on the network you deployed it to (see below), then{' '}
            <Link href='/docs/propose-sign-execute'>propose your first transaction</Link>.
          </GuideText>
          <GuideNote>
            <strong>Gas note:</strong> deploying costs a one-time fee on the network you chose. Approving later
            transactions is free for owners — signatures are collected offchain, and only the final execution pays gas.
          </GuideNote>
        </GuideSection>

        <GuideSection title='Fund it from an exchange'>
          <GuideText>
            If your coins sit on an exchange, withdraw them straight to the multisig address. The wallet only exists on
            the network you deployed it to, so the network you pick on the exchange&rsquo;s withdraw screen matters as
            much as the address.
          </GuideText>
          <GuideSteps>
            <li>
              <strong>Pick the coin.</strong> Withdraw the network&rsquo;s own coin, the one that pays gas: ETH on
              Ethereum, Arbitrum One and Optimism, POL on Polygon, BNB on BNB Smart Chain, AVAX on Avalanche, xDAI on
              Gnosis.
            </li>
            <li>
              <strong>Pick the same network.</strong> For a multisig on Arbitrum, choose <strong>Arbitrum One</strong>,
              not &ldquo;Ethereum (ERC20)&rdquo;. Exchanges sometimes use other labels: BNB Smart Chain is often
              &ldquo;BEP20&rdquo;, and Avalanche needs the <strong>C-Chain</strong>, not the X-Chain. The wallet&rsquo;s
              Fund dialog names the network to pick.
            </li>
            <li>
              <strong>Paste the multisig address</strong> as the destination. Copy it from the wallet page rather than
              typing it.
            </li>
            <li>
              <strong>Send a small test amount first.</strong> Once it shows up on the wallet&rsquo;s Assets tab, send
              the rest.
            </li>
          </GuideSteps>
          <GuideNote>
            <strong>Wrong network warning:</strong> coins sent on another network land at the same address on a chain
            where your multisig does not exist, and may be lost. Testnet wallets (like Sepolia) cannot be funded from an
            exchange at all; use a free faucet instead.
          </GuideNote>
        </GuideSection>
      </GuideLayout>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'How to create a multisig wallet, step by step · MyMultiSig',
      description:
        'Step-by-step guide to deploying a multisig wallet on Ethereum or any supported EVM network: pick a network, add owners, set the approval threshold, and deploy.',
      path: '/docs/create-a-multisig',
      ...guidePageProps('create-a-multisig')
    }
  }
}

export default Page
