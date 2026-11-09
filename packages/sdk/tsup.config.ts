import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', 'protocol/index': 'src/protocol/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node20',
  // The contract ABIs ship as JSON in mymultisig-contract; inline them so
  // consumers don't need that package (or its raw .ts constants) at runtime.
  noExternal: ['mymultisig-contract']
})
