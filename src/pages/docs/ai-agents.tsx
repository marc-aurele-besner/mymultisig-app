import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import { CodeBlock } from '@/components/ui/code-block'
import GuideLayout, {
  GuideList,
  GuideNote,
  GuideSection,
  GuideSteps,
  GuideText
} from '../../components/docs/GuideLayout'

const siteUrl = 'https://mymultisig.app'

const steps = [
  { name: 'Create an API key', text: 'Mint a scoped key at /settings/api-keys while signed in with your wallet.' },
  {
    name: 'Optionally give the agent an owner key',
    text: 'Generate a fresh key for the agent and add its address as an owner of the multisig so it can sign.'
  },
  { name: 'Connect the MCP server', text: 'Add mymultisig-mcp to Claude Code, Claude Desktop, Cursor or any MCP client.' },
  { name: 'Ask the agent', text: 'Check status, propose, review, sign and execute through natural language.' }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to manage a multisig with AI agents',
  description: 'Connect Claude or any MCP client to MyMultiSig to create, propose, sign and execute multisig transactions.',
  url: `${siteUrl}/docs/ai-agents`,
  step: steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.name, text: step.text }))
}

const Code: React.FC<{ children: string }> = ({ children }) => <CodeBlock code={children} className='my-2' />

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>
      <GuideLayout
        kicker='HOW-TO'
        title='Manage a multisig with AI agents'
        lead='Connect Claude, Cursor or any MCP-capable agent to MyMultiSig. The agent can check balances and the request queue, decode and review requests, propose transactions, sign them with its own owner key, and execute once the threshold is met. You keep the final say on every step.'
        cta={{
          title: 'Connect your first agent',
          text: 'Create a scoped API key, then add the MCP server to your client.',
          primary: { label: 'Create an API key', href: '/settings/api-keys' },
          secondary: { label: 'Explore Agents & API', href: '/agents' }
        }}
        related={[
          { title: 'Propose, sign, and execute transactions', href: '/docs/propose-sign-execute' },
          { title: 'Create a multisig', href: '/docs/create-a-multisig' }
        ]}
      >
        <GuideSection title='How the agent gets its powers'>
          <GuideList>
            <li>
              <strong>API key (optional):</strong> created at <Link href='/settings/api-keys'>Settings → API keys</Link>.
              It acts as your wallet on mymultisig.app, limited to the scopes you pick:
              <ul className='ml-5 mt-1 list-disc'>
                <li><code>read</code>: see your wallets.</li>
                <li><code>propose</code>: queue requests.</li>
                <li><code>sign</code>: store signatures and record executions.</li>
                <li><code>manage</code>: cancel, reset, register wallets.</li>
              </ul>
              You can restrict a key to specific wallets and give it an expiry. A key can never sign a transaction or
              create other keys.
            </li>
            <li>
              <strong>Owner key (optional):</strong> to approve or execute, the agent needs its own owner key, passed as{' '}
              <code>MYMULTISIG_PRIVATE_KEY</code>. Signing happens on the agent&apos;s machine, and the key is never sent
              to mymultisig.app. Generate a fresh key for the agent, then add its address as an owner by proposing an{' '}
              <code>addOwner</code> request.
            </li>
          </GuideList>
          <GuideNote>
            The safest setup is a threshold the agent can never meet alone. For example, in a 2-of-3 with two humans
            plus the agent, the agent can prepare and co-sign, but nothing moves without a human signature. The MCP
            server enforces this. It won&apos;t execute a request that only the agent has signed, and it won&apos;t
            deploy a wallet the agent could run alone (threshold 1 with the agent as an owner).
          </GuideNote>
        </GuideSection>

        <GuideSection title='Connect the MCP server'>
          <GuideSteps>
            <li>
              <strong>Claude Code:</strong> install the plugin, which bundles the MCP server and workflow skills:
              <Code>{`/plugin marketplace add marc-aurele-besner/mymultisig-app
/plugin install mymultisig@mymultisig`}</Code>
              Or add only the server:
              <Code>{`claude mcp add mymultisig \\
  -e MYMULTISIG_API_KEY=mms_… \\
  -e MYMULTISIG_PRIVATE_KEY=0x… \\
  -- npx -y mymultisig-mcp`}</Code>
            </li>
            <li>
              <strong>Claude Desktop, Cursor and other MCP clients:</strong> add this to the client&apos;s MCP config:
              <Code>{`{
  "mcpServers": {
    "mymultisig": {
      "command": "npx",
      "args": ["-y", "mymultisig-mcp"],
      "env": {
        "MYMULTISIG_API_KEY": "mms_…",
        "MYMULTISIG_PRIVATE_KEY": "0x…",
        "MYMULTISIG_CHAINS": "11155111"
      }
    }
  }
}`}</Code>
            </li>
          </GuideSteps>
          <GuideText>
            More settings:
          </GuideText>
          <GuideList>
            <li>
              <code>MYMULTISIG_RPC_URL_&lt;chainId&gt;</code> sets a custom RPC per chain.
            </li>
            <li>
              <code>MYMULTISIG_READ_ONLY=1</code> exposes read tools only.
            </li>
            <li>
              <code>MYMULTISIG_ALLOW_SOLO_EXECUTION=1</code> turns off the human-in-the-loop guard, so the agent can
              execute without another owner&apos;s approval. Leave it unset unless you mean it.
            </li>
            <li>
              <code>MYMULTISIG_CHAINS</code> limits the agent to the listed chains.
            </li>
          </GuideList>
        </GuideSection>

        <GuideSection title='What the agent can do'>
          <GuideList>
            <li>
              <strong>Read:</strong>
              <ul className='ml-5 mt-1 list-disc'>
                <li><code>get_multisig</code>: owners, threshold, version and nonce, read live from the chain.</li>
                <li><code>list_requests</code>: the request queue.</li>
                <li>
                  <code>get_request</code>: the decoded call with risk warnings, plus every signature verified locally.
                </li>
                <li><code>get_balances</code>: native and token balances.</li>
              </ul>
            </li>
            <li>
              <strong>Write:</strong>
              <ul className='ml-5 mt-1 list-disc'>
                <li><code>create_multisig</code>: deploy a wallet, at a deterministic address if you want.</li>
                <li><code>propose_transaction</code>: queue a raw call or an ABI-encoded one.</li>
                <li><code>approve_request</code>, <code>execute_request</code> (simulated first),</li>
                <li><code>cancel_request</code>, <code>reset_request</code>.</li>
              </ul>
            </li>
          </GuideList>
          <GuideText>
            Try asking: <em>“What&apos;s waiting for signatures on my Sepolia treasury?”</em>,{' '}
            <em>“Propose sending 50 USDC to 0x… for the design invoice”</em> or <em>“Review request 3f2c… and sign
            it if it&apos;s what Alice described”</em>.
          </GuideText>
        </GuideSection>

        <GuideSection title='CLI and SDK'>
          <GuideText>
            The <code>mymultisig</code> CLI uses the same engine as the MCP server. It prints human-readable output, or
            JSON for scripts with <code>--json</code>:
          </GuideText>
          <Code>{`npx mymultisig-cli request list 11155111 0xYourMultisig
npx mymultisig-cli --json request propose --chain 11155111 --wallet 0x… \\
  --to 0x… --value-ether 0.01 --description "Test payment"`}</Code>
          <GuideText>
            The <code>mymultisig-sdk</code> package exposes the same client for TypeScript, so your own agents and bots
            can use it directly. It also includes the protocol helpers this app uses: EIP-712 typed data, signature
            blobs and <code>execTransaction</code> overloads. The REST API is described in{' '}
            <a href='/openapi.json'>openapi.json</a>, and a short overview for LLMs is at <a href='/llms.txt'>llms.txt</a>.
          </GuideText>
        </GuideSection>

        <GuideSection title='Safety checklist'>
          <GuideList>
            <li>Start on a testnet and set <code>MYMULTISIG_CHAINS</code> so the agent can&apos;t act on other chains.</li>
            <li>Give API keys the fewest scopes they need, restrict them to specific wallets, and set an expiry.</li>
            <li>Keep the agent&apos;s owner key separate from yours, and never set a threshold the agent can meet alone.</li>
            <li>
              Before signing, read the agent&apos;s <code>get_request</code> summary and warnings: delegatecall, owner or
              threshold changes, unlimited approvals.
            </li>
            <li>Revoke a key at <Link href='/settings/api-keys'>Settings → API keys</Link> the moment you stop using it.</li>
          </GuideList>
        </GuideSection>
      </GuideLayout>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      title: 'Manage a multisig with AI agents - MyMultiSig Guides',
      description:
        'Connect Claude, Cursor or any MCP client to MyMultiSig with scoped API keys, the MCP server, a Claude Code plugin, CLI and SDK.',
      path: '/docs/ai-agents'
    }
  }
}

export default Page
