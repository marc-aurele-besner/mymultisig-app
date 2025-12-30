// Glass-morphism card styles
export const cardColors = {
  bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid',
  borderColor: 'whiteAlpha.100',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: {
    borderColor: 'whiteAlpha.200',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
  }
}

// Elevated card with glow effect
export const glowCardColors = {
  ...cardColors,
  position: 'relative' as const,
  _before: {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(135deg, rgba(56, 178, 172, 0.3), rgba(0, 132, 255, 0.3), rgba(138, 75, 255, 0.3))',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    pointerEvents: 'none'
  }
}

// Link styles
export const linkColors = {
  color: 'whiteAlpha.900',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  _hover: {
    color: 'brand.300',
    textDecoration: 'none'
  }
}

// Primary button - teal gradient
export const buttonColors = {
  bg: 'linear-gradient(135deg, #38b2ac 0%, #319795 50%, #2c7a7b 100%)',
  color: 'white',
  fontWeight: '600',
  borderRadius: 'xl',
  boxShadow: '0 4px 20px rgba(56, 178, 172, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(56, 178, 172, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    bg: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 50%, #319795 100%)'
  },
  _active: {
    transform: 'translateY(0)',
    boxShadow: '0 2px 10px rgba(56, 178, 172, 0.3)'
  },
  _disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  }
}

// Secondary button - blue accent
export const secondaryButtonColors = {
  bg: 'linear-gradient(135deg, #0084ff 0%, #006acc 100%)',
  color: 'white',
  fontWeight: '600',
  borderRadius: 'xl',
  boxShadow: '0 4px 20px rgba(0, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 132, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
  },
  _active: {
    transform: 'translateY(0)',
    boxShadow: '0 2px 10px rgba(0, 132, 255, 0.3)'
  }
}

// Glass button - transparent with blur
export const glassButtonColors = {
  bg: 'whiteAlpha.100',
  backdropFilter: 'blur(10px)',
  color: 'white',
  fontWeight: '600',
  borderRadius: 'xl',
  border: '1px solid',
  borderColor: 'whiteAlpha.200',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: {
    bg: 'whiteAlpha.200',
    borderColor: 'whiteAlpha.300',
    transform: 'translateY(-1px)'
  },
  _active: {
    bg: 'whiteAlpha.150',
    transform: 'translateY(0)'
  }
}

// Outline button
export const outlineButtonColors = {
  bg: 'transparent',
  color: 'brand.300',
  fontWeight: '600',
  borderRadius: 'xl',
  border: '2px solid',
  borderColor: 'brand.400',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  _hover: {
    bg: 'brand.400',
    color: 'white',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 20px rgba(56, 178, 172, 0.4)'
  },
  _active: {
    transform: 'translateY(0)'
  }
}

// Menu list styles
export const menuListColors = {
  bg: 'linear-gradient(135deg, rgba(13, 26, 63, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid',
  borderColor: 'whiteAlpha.100',
  borderRadius: 'xl',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  py: 2,
  zIndex: 1600 as unknown as number
}

// Menu item styles
export const menuItemColors = {
  bg: 'transparent',
  color: 'whiteAlpha.900',
  fontWeight: '500',
  px: 4,
  py: 3,
  transition: 'all 0.2s ease',
  _hover: {
    bg: 'whiteAlpha.100',
    color: 'brand.300'
  },
  _focus: {
    bg: 'whiteAlpha.100'
  }
}

// Text colors for different emphasis levels
export const textColors = {
  color: 'whiteAlpha.900'
}

export const mutedTextColors = {
  color: 'whiteAlpha.700'
}

export const subtleTextColors = {
  color: 'whiteAlpha.500'
}

// Input styles
export const inputColors = {
  bg: 'whiteAlpha.50',
  border: '1px solid',
  borderColor: 'whiteAlpha.200',
  borderRadius: 'xl',
  color: 'white',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  _placeholder: {
    color: 'whiteAlpha.400'
  },
  _hover: {
    borderColor: 'whiteAlpha.300'
  },
  _focus: {
    borderColor: 'brand.400',
    boxShadow: '0 0 0 1px rgba(56, 178, 172, 0.5), 0 0 20px rgba(56, 178, 172, 0.15)',
    outline: 'none'
  }
}

// Gradient text utility
export const gradientText = {
  bgGradient: 'linear(to-r, brand.300, accent.400, brand.400)',
  bgClip: 'text',
  fill: 'transparent'
}

// Success colors
export const successColors = {
  bg: 'linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(56, 161, 105, 0.2) 100%)',
  border: '1px solid',
  borderColor: 'green.400',
  color: 'green.300'
}

// Error colors
export const errorColors = {
  bg: 'linear-gradient(135deg, rgba(245, 101, 101, 0.2) 0%, rgba(229, 62, 62, 0.2) 100%)',
  border: '1px solid',
  borderColor: 'red.400',
  color: 'red.300'
}

// Warning colors
export const warningColors = {
  bg: 'linear-gradient(135deg, rgba(237, 137, 54, 0.2) 0%, rgba(221, 107, 32, 0.2) 100%)',
  border: '1px solid',
  borderColor: 'orange.400',
  color: 'orange.300'
}
