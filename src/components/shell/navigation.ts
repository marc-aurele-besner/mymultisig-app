import {
  ActivityIcon,
  BookOpenIcon,
  CoinsIcon,
  DownloadIcon,
  GlobeIcon,
  HelpCircleIcon,
  HomeIcon,
  InfoIcon,
  ListIcon,
  PlugIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  WalletIcon,
  type LucideIcon
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

// Sections of one wallet. `slug` is the path segment after
// /multisig/[address]; `label` is the full tab label and `short` the
// sidebar label. Shared by the sidebar, the in-page tabs (small screens)
// and the command palette so the three never drift apart.
export const WALLET_SECTIONS = [
  { slug: '', label: 'Overview', short: 'Overview', icon: HomeIcon },
  { slug: 'requests', label: 'Requests', short: 'Queue', icon: ListIcon },
  { slug: 'buildRequest', label: 'Build a request', short: 'New request', icon: PlusIcon },
  { slug: 'assets', label: 'Assets', short: 'Assets', icon: CoinsIcon },
  { slug: 'activity', label: 'Activity', short: 'Activity', icon: ActivityIcon },
  { slug: 'addressBook', label: 'Address book', short: 'Address book', icon: BookOpenIcon },
  { slug: 'settings', label: 'Owners & settings', short: 'Owners & settings', icon: SlidersHorizontalIcon }
] as const

export type WalletSectionSlug = (typeof WALLET_SECTIONS)[number]['slug']

export const walletHref = (address: string, slug: string = '') =>
  `/multisig/${address}${slug === '' ? '' : `/${slug}`}`

// Workspace-level destinations, in sidebar order.
export const WORKSPACE_NAV: NavItem[] = [
  { label: 'My multisigs', href: '/open-multisig', icon: WalletIcon },
  { label: 'Create', href: '/create-multisig', icon: PlusIcon },
  { label: 'Import', href: '/import-multisig', icon: DownloadIcon }
]

export const EXPLORE_NAV: NavItem[] = [
  { label: 'Integration', href: '/integration', icon: PlugIcon },
  { label: 'Agents & API', href: '/agents', icon: SparklesIcon },
  { label: 'Settings', href: '/settings/rpc', icon: SlidersHorizontalIcon },
  { label: 'Guides', href: '/docs', icon: HelpCircleIcon },
  { label: 'Networks', href: '/networks', icon: GlobeIcon },
  { label: 'About', href: '/about', icon: InfoIcon }
]

// Active when the current path is the item or nested under it. Settings is
// one hub with several pages, so any /settings/* path lights it up.
export const isNavActive = (pathname: string, href: string): boolean => {
  if (href === '/') return pathname === '/'
  if (href.startsWith('/settings')) return pathname.startsWith('/settings')
  return pathname === href || pathname.startsWith(`${href}/`)
}
