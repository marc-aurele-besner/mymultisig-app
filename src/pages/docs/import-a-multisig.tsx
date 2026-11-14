import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import GuideLayout, { GuideSection, GuideText, GuideList, GuideSteps } from '../../components/docs/GuideLayout'
import { GUIDE_DATES, guidePageProps, guideStructuredData } from '../../components/docs/guideMeta'

const steps = [
  { name: 'Copy the multisig address', text: 'Get the contract address of the deployed multisig you want to add.' },
  { name: 'Pick the network', text: 'Select the chain the multisig was deployed on.' },
  { name: 'Import by address', text: 'Paste the address; the app reads the owners, threshold, and name from the contract.' },
  { name: 'Confirm', text: 'Review the details and add the multisig to your list.' }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to import an existing multisig',
  description: 'Add an already-deployed MyMultiSig wallet by address to track and manage it.',
  ...guideStructuredData('import-a-multisig'),
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
        updated={GUIDE_DATES['import-a-multisig'].dateModified}
        kicker='HOW-TO'
        title='Import an existing multisig'
        lead='A multisig lives onchain, not in the app. If a wallet was already deployed — by a co-owner, or by you on another device — import it by address to see and manage it here.'
        cta={{
          title: 'Have the address ready?',
          text: 'Paste it in and this browser will find the wallet on the network you pick.',
          primary: { label: 'Import a multisig', href: '/import-multisig' },
          secondary: { label: 'Open my multisigs', href: '/open-multisig' }
        }}
        related={[
          { title: 'Propose, sign, and execute transactions', href: '/docs/propose-sign-execute' },
          { title: 'Create a multisig', href: '/docs/create-a-multisig' }
        ]}
      >
        <GuideSection title='When to import'>
          <GuideList>
            <li>A co-owner created the multisig and shared its address with you.</li>
            <li>You deployed it from another browser or device and want it on this one.</li>
            <li>You cleared local data and the wallet no longer shows in your list.</li>
          </GuideList>
          <GuideText>
            Importing never changes the contract — it only registers the address locally so the app can display it.
            Your rights come from being an owner onchain, not from the import.
          </GuideText>
        </GuideSection>

        <GuideSection title='Step by step'>
          <GuideSteps>
            <li>
              <strong>Copy the multisig address.</strong> Any co-owner can share it; it is also visible on the block
              explorer of the network it lives on.
            </li>
            <li>
              <strong>Pick the network.</strong> On <Link href='/import-multisig'>Import a multisig</Link>, make sure
              your wallet is connected to the chain the contract was deployed on — an address only exists on its own
              network.
            </li>
            <li>
              <strong>Paste the address.</strong> The app reads the contract onchain and shows its name, owners, and
              threshold so you can verify it is the wallet you expect.
            </li>
            <li>
              <strong>Confirm.</strong> The multisig is added to <Link href='/open-multisig'>your multisigs</Link>. If
              your connected wallet is one of the owners, you can immediately{' '}
              <Link href='/docs/propose-sign-execute'>propose and sign transactions</Link>.
            </li>
          </GuideSteps>
        </GuideSection>
      </GuideLayout>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'How to import an existing multisig wallet · MyMultiSig',
      description:
        'How to add an already-deployed multisig wallet by contract address: pick the network, paste the address, verify the owners and threshold, and start signing.',
      path: '/docs/import-a-multisig',
      ...guidePageProps('import-a-multisig')
    }
  }
}

export default Page
