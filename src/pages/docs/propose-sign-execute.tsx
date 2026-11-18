import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import GuideLayout, { GuideSection, GuideText, GuideList, GuideNote, GuideSteps } from '../../components/docs/GuideLayout'
import { GUIDE_DATES, guidePageProps, guideStructuredData } from '../../components/docs/guideMeta'
import Term from '../../components/common/Term'

const steps = [
  { name: 'Open your multisig', text: 'Select the multisig you want to transact from.' },
  { name: 'Propose a transaction', text: 'Enter the recipient, amount, and optional contract call data.' },
  { name: 'Collect signatures', text: 'Each owner reviews the request and signs it with their wallet — offchain and gas-free.' },
  { name: 'Execute onchain', text: 'Once the threshold is met, any owner submits the execution transaction and the contract verifies every signature.' }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to propose, sign, and execute a multisig transaction',
  description: 'The lifecycle of a MyMultiSig transaction: proposal, free offchain signatures, and onchain execution.',
  ...guideStructuredData('propose-sign-execute'),
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
        updated={GUIDE_DATES['propose-sign-execute'].dateModified}
        kicker='HOW-TO'
        title='Propose, sign, and execute transactions'
        lead='A multisig transaction has three stages: one owner proposes it, enough owners sign it, and anyone with a signature set that meets the threshold executes it onchain.'
        cta={{
          title: 'Put it into practice',
          text: 'Open one of your multisigs and propose a request. Your signature is the first approval.',
          primary: { label: 'Open my multisigs', href: '/open-multisig' },
          secondary: { label: 'Set up notifications', href: '/integration' }
        }}
        related={[
          { title: 'Create a multisig', href: '/docs/create-a-multisig' },
          { title: 'What is a multisig?', href: '/docs/what-is-a-multisig' }
        ]}
      >
        <GuideSection title='How approval works'>
          <GuideText>
            Approving a request is a <Term id='signature' />. Your wallet shows the exact transaction details —
            recipient, amount, data, and request number — and you confirm them. Signing is{' '}
            <strong>free and sends nothing to the network</strong>: no <Term id='gas' /> is spent until the final
            transaction. The contract checks every approval before the transaction runs, so the app never holds your
            funds and can never fake an approval.
          </GuideText>
        </GuideSection>

        <GuideSection title='Step by step'>
          <GuideSteps>
            <li>
              <strong>Open your multisig.</strong> Go to <Link href='/open-multisig'>your multisigs</Link> and select
              the wallet you want to transact from.
            </li>
            <li>
              <strong>Propose a transaction.</strong> Enter the recipient and amount — or, for a contract interaction,
              the call data. The proposal is stored as a pending request that every owner can see.
            </li>
            <li>
              <strong>Collect signatures.</strong> Each owner opens the request, reviews the details, and signs with
              their own wallet. Progress toward the threshold is visible on the request, and you can share a direct
              link to the request with your co-owners.
            </li>
            <li>
              <strong>Send it (<Term id='execute'>execute</Term>).</strong> Once enough owners have signed, any owner
              can send the transaction to the network. The contract
              checks the signatures against the owner list and threshold, then performs the transaction in a single
              onchain call.
            </li>
          </GuideSteps>
        </GuideSection>

        <GuideSection title='Good to know'>
          <GuideList>
            <li>
              <strong>Only the owner who sends it pays gas.</strong> Proposing and signing are free; the final
              transaction carries the whole network fee, paid in the network&rsquo;s <Term id='nativeCoin' />.
            </li>
            <li>
              <strong>Requests go through in order.</strong> Each request has a number (its nonce). Sending one uses
              up its number, so a signed request can never be replayed later.
            </li>
            <li>
              <strong>Signatures are per-request.</strong> An owner&rsquo;s signature covers one exact transaction —
              changing any detail (recipient, amount, data) invalidates it.
            </li>
          </GuideList>
          <GuideNote>
            <strong>Review before you sign.</strong> Your wallet displays the full typed message. Check the recipient
            and value against what you expect — a signature is an approval the contract will honor.
          </GuideNote>
        </GuideSection>
      </GuideLayout>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'How to propose, sign and execute multisig transactions',
      description:
        'How multisig transactions work in MyMultiSig: propose a request, collect gas-free signatures from owners, and execute onchain once the threshold is met.',
      path: '/docs/propose-sign-execute',
      ...guidePageProps('propose-sign-execute')
    }
  }
}

export default Page
