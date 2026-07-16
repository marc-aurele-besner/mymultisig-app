/**
 * Icon exports for shadcn/Tailwind. Use className for size and color (e.g. "h-5 w-5 text-primary").
 * Re-exports from lucide-react with the same names as before for drop-in replacement.
 */
import {
  Plus as PlusIcon,
  CheckCircle as CheckCircleIconLucide,
  ExternalLink as ExternalLinkIconLucide,
  Lock as LockIconLucide,
  Eye as EyeIconLucide,
  Star as StarIconLucide,
  Settings as SettingsIconLucide,
  Check as CheckIconLucide,
  Copy as CopyIconLucide,
  ChevronDown as ChevronDownIconLucide,
  Download as DownloadIconLucide,
  Trash2 as Trash2IconLucide,
  TriangleAlert as TriangleAlertIconLucide,
  AlertCircle as AlertCircleIconLucide,
  Menu as MenuIconLucide,
  Moon as MoonIconLucide,
  Sun as SunIconLucide,
  Link as LinkIconLucide,
  Info as InfoIconLucide,
  ArrowLeft as ArrowLeftIconLucide,
  ArrowRight as ArrowRightIconLucide,
  Coins as CoinsIconLucide,
  Image as ImageIconLucide,
  RefreshCw as RefreshIconLucide,
  Import as ImportIconLucide,
  Wallet as WalletIconLucide,
  BookUser as BookUserIconLucide
} from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
  boxSize?: number
  className?: string
}

const withIcon = (Icon: React.ComponentType<IconProps>, displayName: string) => {
  const Wrapped = ({ className, size, boxSize, ...props }: IconProps) => {
    const dim = size ?? boxSize ?? 24
    return <Icon className={cn('inline-block shrink-0', className)} size={dim} width={dim} height={dim} {...props} />
  }
  Wrapped.displayName = displayName
  return Wrapped
}

export const AddIcon = withIcon(PlusIcon, 'AddIcon')
export const CheckCircleIcon = withIcon(CheckCircleIconLucide, 'CheckCircleIcon')
export const ExternalLinkIcon = withIcon(ExternalLinkIconLucide, 'ExternalLinkIcon')
export const LockIcon = withIcon(LockIconLucide, 'LockIcon')
export const ViewIcon = withIcon(EyeIconLucide, 'ViewIcon')
export const StarIcon = withIcon(StarIconLucide, 'StarIcon')
export const SettingsIcon = withIcon(SettingsIconLucide, 'SettingsIcon')
export const CheckIcon = withIcon(CheckIconLucide, 'CheckIcon')
export const CopyIcon = withIcon(CopyIconLucide, 'CopyIcon')
export const ChevronDownIcon = withIcon(ChevronDownIconLucide, 'ChevronDownIcon')
export const DownloadIcon = withIcon(DownloadIconLucide, 'DownloadIcon')
export const DeleteIcon = withIcon(Trash2IconLucide, 'DeleteIcon')
export const WarningIcon = withIcon(TriangleAlertIconLucide, 'WarningIcon')
export const WarningTwoIcon = withIcon(AlertCircleIconLucide, 'WarningTwoIcon')
export const HamburgerIcon = withIcon(MenuIconLucide, 'HamburgerIcon')
export const MoonIcon = withIcon(MoonIconLucide, 'MoonIcon')
export const SunIcon = withIcon(SunIconLucide, 'SunIcon')
export const LinkIcon = withIcon(LinkIconLucide, 'LinkIcon')
export const InfoIcon = withIcon(InfoIconLucide, 'InfoIcon')
export const InfoOutlineIcon = withIcon(InfoIconLucide, 'InfoOutlineIcon')
export const ArrowBackIcon = withIcon(ArrowLeftIconLucide, 'ArrowBackIcon')
export const ArrowForwardIcon = withIcon(ArrowRightIconLucide, 'ArrowForwardIcon')
export const CoinsIcon = withIcon(CoinsIconLucide, 'CoinsIcon')
export const ImageIcon = withIcon(ImageIconLucide, 'ImageIcon')
export const RefreshIcon = withIcon(RefreshIconLucide, 'RefreshIcon')
export const ImportIcon = withIcon(ImportIconLucide, 'ImportIcon')
export const WalletIcon = withIcon(WalletIconLucide, 'WalletIcon')
export const AddressBookIcon = withIcon(BookUserIconLucide, 'AddressBookIcon')
