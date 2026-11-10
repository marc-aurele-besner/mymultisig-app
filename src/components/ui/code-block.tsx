import * as React from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type CodeLanguage = 'bash' | 'json' | 'text'

// Token kinds map to the --code-* colours in globals.css, which are defined
// for both themes. The block therefore follows light / dark / system with no
// JavaScript: it changes when the theme class does.
type TokenKind =
  | 'plain'
  | 'command'
  | 'flag'
  | 'string'
  | 'number'
  | 'keyword'
  | 'property'
  | 'variable'
  | 'operator'
  | 'comment'

interface Token {
  kind: TokenKind
  text: string
}

const COLOR: Record<TokenKind, string> = {
  plain: 'text-[var(--code-fg)]',
  command: 'text-[var(--code-command)] font-semibold',
  flag: 'text-[var(--code-flag)]',
  string: 'text-[var(--code-string)]',
  number: 'text-[var(--code-number)]',
  keyword: 'text-[var(--code-keyword)]',
  property: 'text-[var(--code-property)]',
  variable: 'text-[var(--code-variable)]',
  operator: 'text-[var(--code-punctuation)]',
  comment: 'text-[var(--code-comment)] italic'
}

// Splits `text` on `pattern`, classifying each match with `classify` and
// keeping everything between matches as plain text.
const scan = (text: string, pattern: RegExp, classify: (match: RegExpExecArray) => Token[]): Token[] => {
  const tokens: Token[] = []
  let last = 0
  for (let match = pattern.exec(text); match != null; match = pattern.exec(text)) {
    if (match.index > last) tokens.push({ kind: 'plain', text: text.slice(last, match.index) })
    tokens.push(...classify(match))
    last = match.index + match[0].length
    if (match[0].length === 0) pattern.lastIndex++
  }
  if (last < text.length) tokens.push({ kind: 'plain', text: text.slice(last) })
  return tokens
}

const tokenizeJson = (code: string): Token[] =>
  scan(code, /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|[{}[\],:]/g, (m) => {
    if (m[1] != null)
      return m[2] != null
        ? [
            { kind: 'property', text: m[1] },
            { kind: 'operator', text: m[2] }
          ]
        : [{ kind: 'string', text: m[1] }]
    if (m[3] != null) return [{ kind: 'keyword', text: m[0] }]
    if (/^[{}[\],:]$/.test(m[0])) return [{ kind: 'operator', text: m[0] }]
    return [{ kind: 'number', text: m[0] }]
  })

// Shell commands, including slash commands (/plugin install, /bind). The
// first word of each logical line is the command; a line that continues the
// previous one (after a trailing backslash) has none.
const tokenizeBash = (code: string): Token[] => {
  const tokens: Token[] = []
  let continued = false
  code.split('\n').forEach((line, index) => {
    if (index > 0) tokens.push({ kind: 'plain', text: '\n' })
    if (/^\s*#/.test(line)) {
      tokens.push({ kind: 'comment', text: line })
      continued = false
      return
    }
    let expectCommand = !continued
    tokens.push(
      ...scan(
        line,
        /("(?:[^"\\]|\\.)*"|'[^']*')|([A-Z_][A-Z0-9_]*)(=)(\S*)|(\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)|(<[^>\s]+>)|(--?[A-Za-z][\w-]*)|(--(?=\s|$)|\\$|[|&;])|(\b\d+(?:\.\d+)?\b)|([^\s]+)/g,
        (m) => {
          if (m[1] != null) return [{ kind: 'string', text: m[1] }]
          if (m[2] != null)
            return [
              { kind: 'variable', text: m[2] },
              { kind: 'operator', text: m[3] },
              { kind: 'string', text: m[4] }
            ]
          if (m[5] != null) return [{ kind: 'variable', text: m[5] }]
          if (m[6] != null) return [{ kind: 'string', text: m[6] }]
          if (m[7] != null) return [{ kind: 'flag', text: m[7] }]
          if (m[8] != null) {
            // After a pipe or `--`, the next word is a command again.
            if (m[8] !== '\\') expectCommand = true
            return [{ kind: 'operator', text: m[8] }]
          }
          if (m[9] != null) return [{ kind: 'number', text: m[9] }]
          if (expectCommand) {
            expectCommand = false
            return [{ kind: 'command', text: m[0] }]
          }
          return [{ kind: 'plain', text: m[0] }]
        }
      )
    )
    continued = /\\\s*$/.test(line)
  })
  return tokens
}

const detectLanguage = (code: string): CodeLanguage => {
  const trimmed = code.trim()
  if (/^[{[]/.test(trimmed)) return 'json'
  return 'bash'
}

export const tokenize = (code: string, language: CodeLanguage): Token[] =>
  language === 'json' ? tokenizeJson(code) : language === 'bash' ? tokenizeBash(code) : [{ kind: 'plain', text: code }]

export interface CodeBlockProps {
  code: string
  // Defaults to JSON when the snippet starts with { or [, otherwise shell.
  language?: CodeLanguage
  // Label in the header bar (e.g. the file or client the snippet is for).
  title?: string
  // Show a copy button. On by default.
  copy?: boolean
  // One line, wrapping instead of scrolling: for short commands in tight rows.
  inline?: boolean
  className?: string
}

// Code snippet with syntax colouring and a copy button. Colours come from
// theme tokens, so the block matches the app in light and dark.
const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, title, copy = true, inline = false, className }) => {
  const [copied, setCopied] = React.useState(false)
  const lang = language ?? detectLanguage(code)
  const tokens = React.useMemo(() => tokenize(code, lang), [code, lang])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; the snippet stays selectable.
    }
  }

  const copyButton = copy && (
    <button
      type='button'
      onClick={onCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      className='inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[var(--code-border)] px-2 font-sans text-xs text-[var(--code-comment)] transition-colors hover:text-[var(--code-fg)]'
    >
      {copied ? <CheckIcon className='h-3.5 w-3.5 text-[var(--code-string)]' /> : <CopyIcon className='h-3.5 w-3.5' />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )

  const highlighted = tokens.map((token, index) => (
    <span key={index} className={COLOR[token.kind]}>
      {token.text}
    </span>
  ))

  if (inline)
    return (
      <div
        className={cn(
          'flex min-w-0 items-center gap-2 rounded-md border border-[var(--code-border)] bg-[var(--code-bg)] py-1 pl-3 pr-1',
          className
        )}
      >
        <code className='min-w-0 flex-1 select-all py-1 font-mono text-xs [overflow-wrap:anywhere]'>{highlighted}</code>
        {copyButton}
      </div>
    )

  return (
    <div
      className={cn('overflow-hidden rounded-lg border border-[var(--code-border)] bg-[var(--code-bg)]', className)}
    >
      <div className='flex items-center justify-between gap-3 border-b border-[var(--code-border)] px-3 py-1.5'>
        <span className='truncate font-mono text-[11px] text-[var(--code-comment)]'>{title ?? lang}</span>
        {copyButton}
      </div>
      <pre className='overflow-x-auto p-3 font-mono text-xs leading-relaxed'>
        <code>{highlighted}</code>
      </pre>
    </div>
  )
}

export { CodeBlock }
