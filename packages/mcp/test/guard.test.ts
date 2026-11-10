import { describe, expect, it, vi } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { MyMultiSigClient } from 'mymultisig-sdk'

import { assertCosignedByAnotherOwner, assertWalletNeedsAnotherOwner, otherOwnerApprovals } from '../src/guard'
import { createServer } from '../src/server'

const AGENT_KEY = `0x${'22'.repeat(32)}` as const
const sdk = () => new MyMultiSigClient({ apiUrl: 'https://example.test', privateKey: AGENT_KEY })
const agent = sdk().address!
const human = '0x1111111111111111111111111111111111111111'

const connect = async (client: MyMultiSigClient, allowSoloExecution?: boolean) => {
  const server = createServer(client, { readOnly: false, version: 'test', allowSoloExecution })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await server.connect(serverTransport)
  const mcp = new Client({ name: 'test', version: '0' })
  await mcp.connect(clientTransport)
  return mcp
}

const text = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as { type: string; text: string }[])[0].text

describe('guard helpers', () => {
  it('counts only valid approvals from other owners', () => {
    const checks = [
      { signer: agent, status: 'valid', recovered: agent },
      { signer: human, status: 'mismatch' },
      { signer: human, status: 'valid', recovered: human.toUpperCase().replace('0X', '0x') }
    ]
    expect(otherOwnerApprovals(checks, agent)).toBe(1)
    expect(otherOwnerApprovals(checks.slice(0, 2), agent)).toBe(0)
  })

  it('refuses execution signed only by the agent', () => {
    expect(() => assertCosignedByAnotherOwner([{ signer: agent, status: 'valid', recovered: agent }], agent)).toThrow(
      /no owner other than this agent/
    )
    expect(() =>
      assertCosignedByAnotherOwner([{ signer: human, status: 'valid', recovered: human }], agent)
    ).not.toThrow()
  })

  it('refuses wallets the agent could operate alone', () => {
    expect(() => assertWalletNeedsAnotherOwner([agent], 1, agent)).toThrow(/threshold 1/)
    expect(() => assertWalletNeedsAnotherOwner([agent, human], 1, agent)).toThrow(/threshold 1/)
    expect(() => assertWalletNeedsAnotherOwner([agent, human], 2, agent)).not.toThrow()
    expect(() => assertWalletNeedsAnotherOwner([human], 1, agent)).not.toThrow()
  })
})

describe('MCP tools enforce the guard', () => {
  it('execute_request refuses before sending anything when only the agent signed', async () => {
    const client = sdk()
    vi.spyOn(client, 'getRequestStatus').mockResolvedValue({
      signatures: [{ signer: agent, status: 'valid', recovered: agent }]
    } as unknown as Awaited<ReturnType<MyMultiSigClient['getRequestStatus']>>)
    const execute = vi.spyOn(client, 'executeRequest')
    const mcp = await connect(client)
    const result = await mcp.callTool({
      name: 'execute_request',
      arguments: { chainId: 11155111, requestId: '00000000-0000-4000-8000-000000000000' }
    })
    expect(result.isError).toBe(true)
    expect(text(result)).toMatch(/MYMULTISIG_ALLOW_SOLO_EXECUTION/)
    expect(execute).not.toHaveBeenCalled()
  })

  it('execute_request proceeds when the operator opted in', async () => {
    const client = sdk()
    const status = vi.spyOn(client, 'getRequestStatus')
    const execute = vi.spyOn(client, 'executeRequest').mockResolvedValue({ ok: true } as never)
    const mcp = await connect(client, true)
    const result = await mcp.callTool({
      name: 'execute_request',
      arguments: { chainId: 11155111, requestId: '00000000-0000-4000-8000-000000000000' }
    })
    expect(result.isError).toBeFalsy()
    expect(status).not.toHaveBeenCalled()
    expect(execute).toHaveBeenCalledOnce()
  })

  it('create_multisig refuses a 1-of-n wallet that includes the agent', async () => {
    const client = sdk()
    const create = vi.spyOn(client, 'createWallet')
    const mcp = await connect(client)
    const result = await mcp.callTool({
      name: 'create_multisig',
      arguments: { chainId: 11155111, name: 'Solo', owners: [agent, human], threshold: 1 }
    })
    expect(result.isError).toBe(true)
    expect(text(result)).toMatch(/Refusing to deploy/)
    expect(create).not.toHaveBeenCalled()
  })
})
