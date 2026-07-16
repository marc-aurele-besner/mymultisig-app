import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import GuideLayout, { GuideSection, GuideText, GuideList, GuideNote, GuideSteps } from '../../components/docs/GuideLayout'

const siteUrl = 'https://mymultisig.app'

const steps = [
  { name: 'Connect your wallet', text: 'Connect MetaMask, Coinbase Wallet, WalletConnect, or any injected wallet.' },
  { name: 'Pick a network', text: 'Choose the EVM network the multisig will live on. Testnets are available for a dry run.' },
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
  url: `${siteUrl}/docs/create-a-multisig`,
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
        kicker='HOW-TO'
        title='Create a multisig'
        lead='Deploying a multisig with MyMultiSig takes one transaction. You choose the owners and the approval threshold; the factory contract does the rest.'
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
              The <strong>address of every owner</strong> you want on the wallet. Double-check them — owners can only
              be changed later through a multisig transaction that meets the threshold.
            </li>
            <li>
              A decision on the <strong>threshold</strong>. Unsure? <Link href='/docs/what-is-a-multisig'>The
              multisig guide</Link> covers the common setups; 2 of 3 is a solid default for small teams.
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
              <Link href='/networks'>supported networks</Link>. To practice first, pick a testnet like Sepolia; the
              flow is identical and the funds are free.
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
              <strong>Set the threshold.</strong> The number of approvals required to execute a transaction. It must
              be at least 1 and at most the number of owners.
            </li>
            <li>
              <strong>Deploy.</strong> Review the summary and confirm the transaction. The factory deploys the
              contract, and once it confirms, the new multisig appears in{' '}
              <Link href='/open-multisig'>your multisigs</Link>.
            </li>
          </GuideSteps>
        </GuideSection>

        <GuideSection title='After deployment'>
          <GuideText>
            Share the multisig address with your co-owners — they can{' '}
            <Link href='/docs/import-a-multisig'>import it by address</Link> to see it on their own devices. Fund the
            wallet by sending assets to its address like any other account, then{' '}
            <Link href='/docs/propose-sign-execute'>propose your first transaction</Link>.
          </GuideText>
          <GuideNote>
            <strong>Gas note:</strong> deploying costs a one-time fee on the network you chose. Approving later
            transactions is free for owners — signatures are collected offchain, and only the final execution pays
            gas.
          </GuideNote>
        </GuideSection>
      </GuideLayout>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Create a multisig - MyMultiSig Guides',
      description:
        'Step-by-step guide to deploying a multisig wallet on Ethereum or any supported EVM network: pick a network, add owners, set the approval threshold, and deploy.',
      path: '/docs/create-a-multisig'
    }
  }
}

export default Page
