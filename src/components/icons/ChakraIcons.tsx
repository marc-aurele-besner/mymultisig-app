/**
 * Drop-in replacement for @chakra-ui/icons using react-icons + Chakra Box.
 * Uses Box with polymorphic "as" to avoid Chakra v3 Icon not forwarding "as"
 * correctly (which can cause "Functions are not valid as a React child").
 */
import React from 'react'
import { Box, type BoxProps } from '@chakra-ui/react'
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

export type IconProps = BoxProps

const createIcon = (IconComponent: React.ComponentType<IconProps>, displayName: string) => {
  const WrappedIcon = (props: IconProps) => <Box as={IconComponent} display='inline-block' lineHeight='1em' {...props} />
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
