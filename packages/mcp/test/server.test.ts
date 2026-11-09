import { describe, expect, it } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { MyMultiSigClient } from 'mymultisig-sdk'

import { loadConfig } from '../src/config'
import { createServer } from '../src/server'

const connect = async (readOnly: boolean, sdk = new MyMultiSigClient({ apiUrl: 'https://example.test' })) => {
  const server = createServer(sdk, { readOnly, version: 'test' })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await server.connect(serverTransport)
  const client = new Client({ name: 'test', version: '0' })
  await client.connect(clientTransport)
  return client
}

const READ_TOOLS = [
  'whoami',
  'list_networks',
  'get_multisig',
  'list_my_multisigs',
  'list_requests',
  'get_request',
  'get_balances',
  'predict_multisig_address',
  'encode_function_call'
]
const WRITE_TOOLS = [
  'create_multisig',
  'propose_transaction',
  'approve_request',
  'execute_request',
  'cancel_request',
  'reset_request'
]

const text = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as { type: string; text: string }[])[0].text

describe('mymultisig-mcp', () => {
  it('registers read and write tools', async () => {
    const client = await connect(false)
    const { tools } = await client.listTools()
    expect(tools.map((t) => t.name).sort()).toEqual([...READ_TOOLS, ...WRITE_TOOLS].sort())
    const execute = tools.find((t) => t.name === 'execute_request')
    expect(execute?.annotations?.destructiveHint).toBe(true)
    expect(tools.find((t) => t.name === 'get_request')?.annotations?.readOnlyHint).toBe(true)
  })

  it('hides write tools in read-only mode', async () => {
    const client = await connect(true)
    const { tools } = await client.listTools()
    expect(tools.map((t) => t.name).sort()).toEqual([...READ_TOOLS].sort())
  })

  it('encodes calls from human-readable ABIs', async () => {
    const client = await connect(true)
    const result = await client.callTool({
      name: 'encode_function_call',
      arguments: {
        abi: 'function transfer(address to, uint256 amount)',
        functionName: 'transfer',
        args: ['0x2222222222222222222222222222222222222222', '1000'],
        to: '0x3333333333333333333333333333333333333333'
      }
    })
    const body = JSON.parse(text(result))
    expect(body.data.startsWith('0xa9059cbb')).toBe(true)
    expect(body.summary.kind).toBe('erc20')
  })

  it('lists networks with official factories', async () => {
    const client = await connect(true)
    const networks = JSON.parse(text(await client.callTool({ name: 'list_networks', arguments: {} })))
    const sepolia = networks.find((n: { chainId: number }) => n.chainId === 11155111)
    expect(sepolia.factories[0].version).toBe('0.5.0')
  })

  it('reports missing credentials as tool errors instead of crashing', async () => {
    const client = await connect(false)
    const result = await client.callTool({
      name: 'approve_request',
      arguments: { chainId: 11155111, requestId: '00000000-0000-4000-8000-000000000000' }
    })
    expect(result.isError).toBe(true)
  })

  it('refuses chains outside the allowlist', async () => {
    const sdk = new MyMultiSigClient({ apiUrl: 'https://example.test', allowedChainIds: [11155111] })
    const client = await connect(true, sdk)
    const result = await client.callTool({
      name: 'get_multisig',
      arguments: { chainId: 1, address: '0x1111111111111111111111111111111111111111' }
    })
    expect(result.isError).toBe(true)
    expect(text(result)).toMatch(/allowed chain list/)
  })
})

describe('loadConfig', () => {
  it('reads keys, RPC URLs and the chain allowlist from the environment', () => {
    const config = loadConfig({
      MYMULTISIG_API_KEY: ' mms_x ',
      MYMULTISIG_RPC_URL_11155111: 'https://rpc.example',
      MYMULTISIG_CHAINS: '11155111, 1',
      MYMULTISIG_READ_ONLY: 'true'
    })
    expect(config.client.apiKey).toBe('mms_x')
    expect(config.client.apiUrl).toBe('https://mymultisig.app')
    expect(config.client.rpcUrls).toEqual({ 11155111: 'https://rpc.example' })
    expect(config.client.allowedChainIds).toEqual([11155111, 1])
    expect(config.readOnly).toBe(true)
  })

  it('rejects malformed private keys', () => {
    expect(() => loadConfig({ MYMULTISIG_PRIVATE_KEY: '0x1234' })).toThrow(/32-byte/)
  })
})
