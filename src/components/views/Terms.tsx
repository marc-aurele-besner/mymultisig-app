import React from 'react'
import Link from 'next/link'
import BigCard from '../cards/BigCard'

const LAST_UPDATED = 'July 14, 2026'

const sections = [
  {
    title: '1. Acceptance of these terms',
    paragraphs: [
      'By accessing or using MyMultiSig.app (the "App"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the App.'
    ]
  },
  {
    title: '2. The service',
    paragraphs: [
      'MyMultiSig.app is an open-source interface for deploying and interacting with multisignature smart contracts on public blockchains. The App is non-custodial: it never holds your funds, private keys, or seed phrases. All transactions are signed by your own wallet and executed on-chain by the networks you choose.',
      'This is an early-stage project. The smart contracts are open-source and available for review but have not been professionally audited. Features may be incomplete or may not function as intended.'
    ]
  },
  {
    title: '3. Your responsibilities',
    paragraphs: [
      'You are solely responsible for safeguarding your wallet, private keys, and recovery phrases. You are responsible for reviewing and verifying every transaction, signer address, and threshold configuration before signing or executing it. Transactions on public blockchains are irreversible.',
      'You are responsible for complying with the laws and regulations that apply to you in your jurisdiction, including any restrictions on the use of blockchain-based services.'
    ]
  },
  {
    title: '4. No warranty',
    paragraphs: [
      'The App and the associated smart contracts are provided "as is" and "as available", without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the App will be uninterrupted, error-free, or secure.'
    ]
  },
  {
    title: '5. Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by law, the authors and contributors of MyMultiSig.app shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages — including loss of funds, tokens, data, or profits — arising from your use of, or inability to use, the App or the smart contracts it interacts with.'
    ]
  },
  {
    title: '6. Fees',
    paragraphs: [
      'The App does not charge fees. Interacting with smart contracts requires network (gas) fees, which are paid to the relevant blockchain network and are outside of our control.'
    ]
  },
  {
    title: '7. Changes to these terms',
    paragraphs: [
      'We may update these Terms & Conditions from time to time. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the App after changes take effect constitutes acceptance of the revised terms.'
    ]
  }
]

const Terms: React.FC = () => {
  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[900px]">
        <div className="flex w-full flex-col gap-8 py-4 md:py-8">
          <div>
            <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Terms &amp; Conditions
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
            <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Questions about these terms? Reach out through the{' '}
              <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
                contact page
              </Link>{' '}
              or open an issue on{' '}
              <a
                href="https://github.com/marc-aurele-besner/mymultisig-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </BigCard>
    </div>
  )
}

export default Terms
