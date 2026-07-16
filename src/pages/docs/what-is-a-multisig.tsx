import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import GuideLayout, { GuideSection, GuideText, GuideList, GuideNote } from '../../components/docs/GuideLayout'

const siteUrl = 'https://mymultisig.app'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What is a multisig wallet?',
  description:
    'A plain-language explanation of multi-signature wallets: how approval thresholds work, when to use one, and what MyMultiSig enforces onchain.',
  url: `${siteUrl}/docs/what-is-a-multisig`,
  author: { '@type': 'Person', name: 'Marc-Aurele Besner' },
  publisher: { '@id': `${siteUrl}/#organization` }
}

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      <GuideLayout
        kicker='CONCEPTS'
        title='What is a multisig?'
        lead='A multisig (multi-signature) wallet is a shared wallet that requires multiple people to approve a transaction before it can be executed. No single person can move funds alone.'
        related={[
          { title: 'Create a multisig', href: '/docs/create-a-multisig' },
          { title: 'Propose, sign, and execute transactions', href: '/docs/propose-sign-execute' }
        ]}
      >
        <GuideSection title='The problem with a single key'>
          <GuideText>
            A regular wallet is controlled by one private key. Whoever holds that key has complete control: they can
            send funds anywhere, at any time, with no oversight. That is fine for personal spending money, but it
            becomes a liability the moment the wallet holds funds that belong to more than one person — a team
            treasury, a community fund, protocol reserves. One compromised laptop, one lost seed phrase, or one bad
            actor is all it takes.
          </GuideText>
        </GuideSection>

        <GuideSection title='How a multisig fixes it'>
          <GuideText>
            A multisig is a <strong>smart contract</strong> that holds the funds instead of any individual. The
            contract keeps a list of <strong>owners</strong> and a <strong>threshold</strong> — the number of owner
            approvals a transaction needs before it can run. A &ldquo;2 of 3&rdquo; multisig has three owners and
            executes only when at least two of them approve.
          </GuideText>
          <GuideList>
            <li>
              <strong>No single point of failure.</strong> One leaked key cannot drain the wallet — an attacker would
              need to compromise enough keys to meet the threshold.
            </li>
            <li>
              <strong>Built-in accountability.</strong> Every transaction is proposed, reviewed, and approved by
              multiple people before it moves funds.
            </li>
            <li>
              <strong>Enforced onchain.</strong> The rules live in the contract, not in a company policy. Nobody —
              including the app you use to manage it — can bypass the threshold.
            </li>
          </GuideList>
        </GuideSection>

        <GuideSection title='Choosing a threshold'>
          <GuideText>
            The threshold is a trade-off between security and convenience. Higher thresholds are harder to abuse but
            also harder to operate — if too many owners lose access, funds can be stuck. Common setups:
          </GuideText>
          <GuideList>
            <li>
              <strong>2 of 3</strong> — a solid default for small teams: one lost key does not lock the wallet, one
              stolen key does not empty it.
            </li>
            <li>
              <strong>3 of 5</strong> — common for DAOs and larger treasuries; tolerates two unavailable owners.
            </li>
            <li>
              <strong>2 of 2</strong> — maximum mutual control, but a single lost key freezes the funds. Use with
              care.
            </li>
          </GuideList>
        </GuideSection>

        <GuideSection title='How MyMultiSig implements it'>
          <GuideText>
            MyMultiSig deploys a lightweight, open-source multisig contract on{' '}
            <Link href='/networks'>15 EVM networks</Link>. Owners approve transactions by producing{' '}
            <strong>EIP-712 signatures</strong> — structured, human-readable messages signed with their own wallets.
            Signatures are collected offchain (no gas to approve), and once the threshold is met, any owner submits a
            single execution transaction. The contract verifies every signature onchain before anything moves.
          </GuideText>
          <GuideNote>
            <strong>Early-stage project:</strong> the contracts are open-source and available for review, but they have
            not been professionally audited. Use at your own risk, and try it on a testnet first.
          </GuideNote>
        </GuideSection>

        <GuideSection title='Next steps'>
          <GuideText>
            Ready to try it? <Link href='/docs/create-a-multisig'>Create a multisig</Link> in a few minutes, or{' '}
            <Link href='/docs/import-a-multisig'>import one you already deployed</Link>.
          </GuideText>
        </GuideSection>
      </GuideLayout>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'What is a multisig? - MyMultiSig Guides',
      description:
        'A plain-language guide to multi-signature wallets: how approval thresholds work, when shared control beats a single key, and how MyMultiSig enforces it onchain.',
      path: '/docs/what-is-a-multisig'
    }
  }
}

export default Page
