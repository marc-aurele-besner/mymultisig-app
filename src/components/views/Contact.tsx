import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import BigCard from '../cards/BigCard'
import { CheckCircleIcon, ExternalLinkIcon, WarningIcon } from '../icons/ChakraIcons'

const channels = [
  {
    keyword: 'bug-report',
    title: 'Report a bug',
    description: 'Something broken in the app? Open an issue with the steps to reproduce.',
    href: 'https://github.com/marc-aurele-besner/mymultisig-app/issues'
  },
  {
    keyword: 'contracts',
    title: 'Ask about the contracts',
    description: 'Questions or findings about the smart contracts belong in the contract repository.',
    href: 'https://github.com/marc-aurele-besner/mymultisig-contract/issues'
  },
  {
    keyword: 'maintainer',
    title: 'Follow the project',
    description: 'MyMultiSig is built in the open by Marc-Aurele Besner.',
    href: 'https://github.com/marc-aurele-besner'
  }
]

type FormStatus = 'idle' | 'sending' | 'sent'

const Contact: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState<FormStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company })
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(body?.error ?? 'Your message could not be sent. Try again in a moment.')
        setStatus('idle')
        return
      }
      setStatus('sent')
    } catch {
      setError('Your message could not be sent. Check your connection and try again.')
      setStatus('idle')
    }
  }

  const reset = () => {
    setName('')
    setEmail('')
    setMessage('')
    setStatus('idle')
    setError(null)
  }

  return (
    <div className="flex justify-center">
      <BigCard className="max-w-[1000px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex w-full flex-col gap-8"
        >
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-primary">CONTACT</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Get in touch
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Send a message and it lands in the maintainer&apos;s inbox. For bugs and contract
              questions, GitHub issues get the fastest answer.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
            {status === 'sent' ? (
              <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-muted/30 p-6 md:p-8">
                <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <CheckCircleIcon className="h-5 w-5 text-primary" />
                  Message sent
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Thanks for writing. The reply goes to{' '}
                  <span className="font-mono text-foreground">{email}</span>.
                </p>
                <Button variant="outline" onClick={reset}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                      maxLength={100}
                      autoComplete="name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What can we help with?"
                  />
                </div>
                {/* Honeypot: hidden from people, filled by bots */}
                <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                  <label htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}
                <div>
                  <Button type="submit" size="lg" disabled={status === 'sending'} className="px-7">
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </Button>
                </div>
              </form>
            )}

            <aside className="flex flex-col gap-4 lg:border-l lg:border-border lg:pl-8">
              {channels.map((channel) => (
                <a
                  key={channel.keyword}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <span className="font-mono text-xs text-primary">{channel.keyword}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    {channel.title}
                    <ExternalLinkIcon className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {channel.description}
                  </p>
                </a>
              ))}
            </aside>
          </div>
        </motion.div>
      </BigCard>
    </div>
  )
}

export default Contact
