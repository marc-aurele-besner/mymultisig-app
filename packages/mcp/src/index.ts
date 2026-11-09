import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { MyMultiSigClient } from 'mymultisig-sdk'

import { loadConfig } from './config'
import { createServer } from './server'

declare const __PACKAGE_VERSION__: string

const main = async () => {
  const config = loadConfig()
  const client = new MyMultiSigClient(config.client)
  const server = createServer(client, { readOnly: config.readOnly, version: __PACKAGE_VERSION__ })
  await server.connect(new StdioServerTransport())
  // stdout is the MCP channel; diagnostics go to stderr.
  console.error(
    `mymultisig-mcp ${__PACKAGE_VERSION__} ready (${config.client.apiUrl}; signer: ${client.address ?? 'none'}; api key: ${
      config.client.apiKey ? 'yes' : 'no'
    }${config.readOnly ? '; read-only' : ''})`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
