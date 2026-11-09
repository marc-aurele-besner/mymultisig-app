import { CommanderError } from 'commander'

import { buildProgram, ttyConfirm } from './program'

declare const __PACKAGE_VERSION__: string

const program = buildProgram({
  out: (text) => process.stdout.write(text),
  err: (text) => process.stderr.write(text),
  env: process.env,
  isTTY: Boolean(process.stdin.isTTY),
  confirm: ttyConfirm
}).version(__PACKAGE_VERSION__)

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof CommanderError) process.exit(error.exitCode)
  const message = error instanceof Error ? error.message : String(error)
  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify({ error: message }) + '\n')
  else process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
})
