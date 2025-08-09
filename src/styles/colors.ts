export const cardColors = {
  boxShadow: 'xl',
  bgGradient: 'linear(to-br, cardBack.800, cardBack.900, cardBack.800)',
  border: '1px solid',
  borderColor: 'whiteAlpha.300',
  backdropFilter: 'blur(6px)'
}

export const linkColors = {
  color: 'brandText.800',
  _hover: {
    color: 'pink.300'
  }
}

export const buttonColors = {
  color: 'white',
  bgGradient: 'linear(to-r, teal.400, purple.500)',
  boxShadow: 'xl',
  transition: 'all 200ms ease-out',
  _hover: {
    transform: 'translateY(-2px) scale(1.02)',
    bgGradient: 'linear(to-r, pink.400, purple.500)'
  },
  _active: {
    transform: 'translateY(0) scale(0.99)',
    boxShadow: 'md'
  }
}

export const menuListColors = {
  background: 'rgba(0,0,0,0.4)',
  backdropFilter: 'blur(6px)',
  borderColor: 'whiteAlpha.300',
  boxShadow: 'xl'
}

export const menuItemColors = {
  background: 'transparent',
  color: 'brandText.800',
  _hover: {
    color: 'pink.300',
    bg: 'whiteAlpha.200'
  }
}

export const textColors = {
  color: 'brandText.800'
}
