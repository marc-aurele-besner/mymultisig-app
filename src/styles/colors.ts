export const cardColors = {
  boxShadow: 'lg',
  bgGradient: 'linear(to-br, cardBack.800, cardBack.900, cardBack.800)',
  border: '1px solid',
  borderColor: 'whiteAlpha.200',
  backdropFilter: 'blur(6px)'
}

export const linkColors = {
  color: 'brandText.800',
  _hover: {
    color: 'blue.300'
  }
}

export const buttonColors = {
  color: 'white',
  bgGradient: 'linear(to-r, blue.500, blue.600)',
  boxShadow: 'lg',
  transition: 'all 180ms ease-out',
  _hover: {
    transform: 'translateY(-1px) scale(1.01)',
    bgGradient: 'linear(to-r, blue.600, blue.700)'
  },
  _active: {
    transform: 'translateY(0) scale(0.99)',
    boxShadow: 'md'
  }
}

export const menuListColors = {
  background: 'rgba(13, 17, 23, 0.6)',
  backdropFilter: 'blur(8px)',
  borderColor: 'whiteAlpha.200',
  boxShadow: 'xl',
  zIndex: 1600 as unknown as number,
}

export const menuItemColors = {
  background: 'transparent',
  color: 'brandText.800',
  _hover: {
    color: 'blue.300',
    bg: 'whiteAlpha.200'
  }
}

export const textColors = {
  color: 'brandText.800'
}
