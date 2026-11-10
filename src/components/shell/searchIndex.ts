import {
  BookOpenIcon,
  BotIcon,
  DownloadIcon,
  FileTextIcon,
  GlobeIcon,
  HelpCircleIcon,
  HomeIcon,
  InfoIcon,
  KeyRoundIcon,
  MailIcon,
  MessageSquareIcon,
  PlugIcon,
  PlusIcon,
  RocketIcon,
  SendIcon,
  SparklesIcon,
  WalletIcon,
  type LucideIcon
} from 'lucide-react'

export interface SearchEntry {
  label: string
  href: string
  group: 'Pages' | 'Settings' | 'Guides'
  icon: LucideIcon
  // One line under the label: what the page is for.
  hint: string
  // Words people type that are not in the label (synonyms, features on the
  // page, common misspellings). The palette matches on label + hint + these.
  keywords: string[]
}

// Every static destination in the app, with the vocabulary people search
// by. Dynamic results (saved multisigs, open requests, the active wallet's
// sections, networks, actions) are added by the command palette itself.
// Add a page here when you add a route, or search will not find it.
export const SEARCH_INDEX: SearchEntry[] = [
  {
    label: 'Home',
    href: '/',
    group: 'Pages',
    icon: HomeIcon,
    hint: 'Inbox of requests waiting on you',
    keywords: ['inbox', 'dashboard', 'start', 'overview', 'pending', 'sign']
  },
  {
    label: 'My multisigs',
    href: '/open-multisig',
    group: 'Pages',
    icon: WalletIcon,
    hint: 'Open a multisig saved in this browser',
    keywords: ['wallets', 'open', 'list', 'safe', 'accounts', 'treasury']
  },
  {
    label: 'Create a multisig',
    href: '/create-multisig',
    group: 'Pages',
    icon: PlusIcon,
    hint: 'Deploy a new shared wallet',
    keywords: ['new', 'deploy', 'wallet', 'owners', 'threshold', 'extended', 'simple', 'advanced', 'factory']
  },
  {
    label: 'Import a multisig',
    href: '/import-multisig',
    group: 'Pages',
    icon: DownloadIcon,
    hint: 'Add an existing wallet by address',
    keywords: ['add', 'existing', 'address', 'restore', 'recover', 'join']
  },
  {
    label: 'Get started',
    href: '/get-started',
    group: 'Pages',
    icon: RocketIcon,
    hint: 'Guided setup, step by step',
    keywords: ['onboarding', 'checklist', 'setup', 'tutorial', 'first', 'begin', 'walkthrough']
  },
  {
    label: 'Integrations',
    href: '/integration',
    group: 'Pages',
    icon: PlugIcon,
    hint: 'Team chat and notifications',
    keywords: ['integration', 'notifications', 'notify', 'alerts', 'slack', 'discord', 'telegram', 'email', 'chat', 'bot']
  },
  {
    label: 'Agents & API',
    href: '/agents',
    group: 'Pages',
    icon: SparklesIcon,
    hint: 'MCP server, skills, REST API, CLI and SDK',
    keywords: ['ai', 'agent', 'mcp', 'claude', 'cursor', 'cli', 'sdk', 'rest', 'api', 'developer', 'automation', 'script', 'bot', 'openapi']
  },
  {
    label: 'Supported networks',
    href: '/networks',
    group: 'Pages',
    icon: GlobeIcon,
    hint: 'Mainnets and testnets the contract runs on',
    keywords: ['chains', 'chain', 'evm', 'mainnet', 'testnet', 'ethereum', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'bnb', 'gnosis', 'sepolia', 'request network']
  },
  {
    label: 'About',
    href: '/about',
    group: 'Pages',
    icon: InfoIcon,
    hint: 'The project, its code and its status',
    keywords: ['project', 'open source', 'audit', 'license', 'github', 'who', 'team', 'maintainer']
  },
  {
    label: 'Contact',
    href: '/contact',
    group: 'Pages',
    icon: MailIcon,
    hint: 'Send a message to the maintainer',
    keywords: ['support', 'help', 'message', 'bug', 'report', 'feedback', 'question']
  },
  {
    label: 'Terms & Conditions',
    href: '/terms',
    group: 'Pages',
    icon: FileTextIcon,
    hint: 'Terms of use',
    keywords: ['legal', 'tos', 'terms of service', 'liability', 'warranty']
  },
  {
    label: 'Privacy Policy',
    href: '/privacy',
    group: 'Pages',
    icon: FileTextIcon,
    hint: 'What the app stores',
    keywords: ['legal', 'data', 'cookies', 'analytics', 'gdpr']
  },

  {
    label: 'Slack',
    href: '/settings/slack',
    group: 'Settings',
    icon: MessageSquareIcon,
    hint: 'Add the app and bind a channel',
    keywords: ['integration', 'notifications', 'workspace', 'channel', 'bind', 'install', 'chat', 'bot']
  },
  {
    label: 'Discord',
    href: '/settings/discord',
    group: 'Settings',
    icon: MessageSquareIcon,
    hint: 'Add the bot to a server',
    keywords: ['integration', 'notifications', 'server', 'guild', 'channel', 'bind', 'slash commands', 'chat', 'bot', 'dao']
  },
  {
    label: 'Telegram',
    href: '/settings/telegram',
    group: 'Settings',
    icon: SendIcon,
    hint: 'Register a bot and bind a chat',
    keywords: ['integration', 'notifications', 'botfather', 'token', 'chat', 'group', 'bind', 'bot']
  },
  {
    label: 'Email notifications',
    href: '/settings/email',
    group: 'Settings',
    icon: MailIcon,
    hint: 'Signature needed and ready to execute emails',
    keywords: ['integration', 'mail', 'inbox', 'notify', 'alerts', 'subscribe', 'unsubscribe', 'confirm']
  },
  {
    label: 'RPC endpoints',
    href: '/settings/rpc',
    group: 'Settings',
    icon: GlobeIcon,
    hint: 'Use your own RPC URL',
    keywords: ['rpc', 'node', 'provider', 'alchemy', 'infura', 'quicknode', 'endpoint', 'rate limit', 'url']
  },
  {
    label: 'API keys',
    href: '/settings/api-keys',
    group: 'Settings',
    icon: KeyRoundIcon,
    hint: 'Create and revoke scoped keys',
    keywords: ['key', 'token', 'bearer', 'scope', 'revoke', 'mms', 'rest', 'api', 'secret', 'credentials']
  },
  {
    label: 'AI agents',
    href: '/settings/agents',
    group: 'Settings',
    icon: BotIcon,
    hint: 'Connect Claude, Cursor or another MCP client',
    keywords: ['ai', 'agent', 'mcp', 'claude', 'cursor', 'plugin', 'skills', 'cli', 'config', 'setup']
  },

  {
    label: 'Guides',
    href: '/docs',
    group: 'Guides',
    icon: HelpCircleIcon,
    hint: 'All guides',
    keywords: ['docs', 'documentation', 'help', 'learn', 'how to', 'tutorial', 'faq']
  },
  {
    label: 'What is a multisig?',
    href: '/docs/what-is-a-multisig',
    group: 'Guides',
    icon: BookOpenIcon,
    hint: 'The idea, in plain words',
    keywords: ['docs', 'concepts', 'explain', 'threshold', 'owners', 'quorum', 'why', 'basics', 'intro']
  },
  {
    label: 'Create a multisig (guide)',
    href: '/docs/create-a-multisig',
    group: 'Guides',
    icon: BookOpenIcon,
    hint: 'How to deploy one, step by step',
    keywords: ['docs', 'how to', 'deploy', 'new wallet', 'owners', 'threshold', 'gas']
  },
  {
    label: 'Propose, sign, and execute transactions',
    href: '/docs/propose-sign-execute',
    group: 'Guides',
    icon: BookOpenIcon,
    hint: 'The life of a request',
    keywords: ['docs', 'how to', 'request', 'signature', 'approve', 'send', 'transfer', 'nonce', 'eip-712', 'lifecycle']
  },
  {
    label: 'Import an existing multisig (guide)',
    href: '/docs/import-a-multisig',
    group: 'Guides',
    icon: BookOpenIcon,
    hint: 'Add a wallet by address',
    keywords: ['docs', 'how to', 'add', 'existing', 'address', 'another device']
  },
  {
    label: 'Manage a multisig with AI agents',
    href: '/docs/ai-agents',
    group: 'Guides',
    icon: BookOpenIcon,
    hint: 'API keys, MCP server, CLI and SDK',
    keywords: ['docs', 'how to', 'ai', 'agent', 'mcp', 'claude', 'cursor', 'cli', 'sdk', 'api key', 'automation']
  }
]
