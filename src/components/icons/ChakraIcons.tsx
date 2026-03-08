/**
 * Drop-in replacement for @chakra-ui/icons using react-icons + Chakra Icon.
 * Fixes forwardRef compatibility with Chakra UI v3.
 */
import React from 'react'
import { Icon } from '@chakra-ui/react'
import {
  FiPlus,
  FiCheckCircle,
  FiExternalLink,
  FiLock,
  FiEye,
  FiStar,
  FiSettings,
  FiCheck,
  FiCopy,
  FiChevronDown,
  FiDownload,
  FiTrash2,
  FiAlertTriangle,
  FiAlertCircle,
  FiMenu,
  FiMoon,
  FiSun,
  FiLink,
  FiInfo
} from 'react-icons/fi'

export type IconProps = React.ComponentProps<typeof Icon>

const createIcon = (IconComponent: React.ComponentType, displayName: string) => {
  const WrappedIcon = (props: IconProps) => <Icon as={IconComponent} {...props} />
  WrappedIcon.displayName = displayName
  return WrappedIcon
}

export const AddIcon = createIcon(FiPlus, 'AddIcon')
export const CheckCircleIcon = createIcon(FiCheckCircle, 'CheckCircleIcon')
export const ExternalLinkIcon = createIcon(FiExternalLink, 'ExternalLinkIcon')
export const LockIcon = createIcon(FiLock, 'LockIcon')
export const ViewIcon = createIcon(FiEye, 'ViewIcon')
export const StarIcon = createIcon(FiStar, 'StarIcon')
export const SettingsIcon = createIcon(FiSettings, 'SettingsIcon')
export const CheckIcon = createIcon(FiCheck, 'CheckIcon')
export const CopyIcon = createIcon(FiCopy, 'CopyIcon')
export const ChevronDownIcon = createIcon(FiChevronDown, 'ChevronDownIcon')
export const DownloadIcon = createIcon(FiDownload, 'DownloadIcon')
export const DeleteIcon = createIcon(FiTrash2, 'DeleteIcon')
export const WarningIcon = createIcon(FiAlertTriangle, 'WarningIcon')
export const WarningTwoIcon = createIcon(FiAlertCircle, 'WarningTwoIcon')
export const HamburgerIcon = createIcon(FiMenu, 'HamburgerIcon')
export const MoonIcon = createIcon(FiMoon, 'MoonIcon')
export const SunIcon = createIcon(FiSun, 'SunIcon')
export const LinkIcon = createIcon(FiLink, 'LinkIcon')
export const InfoIcon = createIcon(FiInfo, 'InfoIcon')
export const InfoOutlineIcon = createIcon(FiInfo, 'InfoOutlineIcon')
