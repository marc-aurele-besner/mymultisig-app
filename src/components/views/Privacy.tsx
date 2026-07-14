import React from 'react'
import Link from 'next/link'
import BigCard from '../cards/BigCard'

const LAST_UPDATED = 'July 14, 2026'

const sections = [
  {
    title: '1. Overview',
    paragraphs: [
      'MyMultiSig.app is a non-custodial, open-source interface for multisignature smart contracts. We collect as little personal information as possible: no account registration is required, and we never have access to your private keys or funds.'
    ]
  },
  {
    title: '2. Information we store',
    paragraphs: [
      'Wallet addresses and multisig configuration. When you create or import a multisig, its address, name, chain, signer addresses, and threshold are stored in our database so the App can display your wallets across devices.',
      'Transaction requests. Proposed transactions and their collected signatures are stored in our database until they are executed or discarded.',
      'Sign-In with Ethereum sessions. When you sign in, a session cookie tied to your wallet address is set so the App can authorize writes to our database. The cookie contains no personal information beyond your public wallet address.',
      'Contact form submissions. If you use the contact form, the name, email address, and message you provide are emailed to us so we can respond.'
    ]
  },
  {
    title: '3. Data stored on your device',
    paragraphs: [
      'The App keeps state in your browser’s local storage: your added contracts and multisigs, your selected multisig, your theme preference, and whether you have accepted the disclaimer. This data never leaves your device unless you take an action that sends it to our database, and you can clear it at any time through your browser settings.'
    ]
  },
  {
    title: '4. Analytics',
    paragraphs: [
      'We use Google Analytics to understand aggregate usage of the App (pages visited, approximate location, device type). Google Analytics sets cookies and processes data under its own privacy policy. You can block it with standard browser tools or extensions without affecting the App’s functionality.'
    ]
  },
  {
    title: '5. Third-party services',
    paragraphs: [
      'The App relies on third-party infrastructure that may process your IP address and request metadata under their own privacy policies: Netlify (hosting), Neon (database), WalletConnect (wallet connections), RPC providers such as Alchemy, Infura, or public endpoints (blockchain reads and writes), Resend (contact form email delivery), and Google Analytics (usage analytics).'
    ]
  },
  {
    title: '6. On-chain data',
    paragraphs: [
      'Anything you write to a public blockchain — multisig deployments, signer sets, executed transactions — is public, permanent, and outside of our control. This policy cannot apply to on-chain data.'
    ]
  },
  {
    title: '7. Data retention and removal',
    paragraphs: [
      'Multisig and transaction data remains in our database so that all signers can access it. If you want data associated with your wallet removed, contact us and we will delete what we reasonably can, keeping in mind that other signers may depend on shared multisig records and that on-chain data cannot be deleted.'
    ]
  },
  {
    title: '8. Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision.'
    ]
  }
]

const Privacy: React.FC = () => {
  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[900px]">
        <div className="flex w-full flex-col gap-8 py-4 md:py-8">
          <div>
            <h1 className="font-display mb-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Questions about this policy or a data removal request? Reach out through the{' '}
              <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </BigCard>
    </div>
  )
}

export default Privacy
