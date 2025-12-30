import { extendTheme, defineStyleConfig, type ThemeConfig } from '@chakra-ui/react'
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}

// Modern, distinctive color palette
const colors = {
  // Primary brand colors - electric teal/cyan with deep navy
  brand: {
    50: '#e6fffa',
    100: '#b2f5ea',
    200: '#81e6d9',
    300: '#4fd1c5',
    400: '#38b2ac',
    500: '#319795',
    600: '#2c7a7b',
    700: '#285e61',
    800: '#234e52',
    900: '#1d4044'
  },
  // Accent colors - vibrant electric blue
  accent: {
    50: '#e3f2ff',
    100: '#b8dcff',
    200: '#8cc6ff',
    300: '#5fb0ff',
    400: '#339aff',
    500: '#0084ff',
    600: '#006acc',
    700: '#004f99',
    800: '#003566',
    900: '#001a33'
  },
  // Deep space navy for backgrounds
  navy: {
    50: '#e8ecf4',
    100: '#c5cfe0',
    200: '#9fb0ca',
    300: '#7991b4',
    400: '#5c79a4',
    500: '#3f6194',
    600: '#34548c',
    700: '#274380',
    800: '#1c3374',
    900: '#0d1a3f'
  },
  // Surface colors for cards and panels
  surface: {
    50: 'rgba(255, 255, 255, 0.05)',
    100: 'rgba(255, 255, 255, 0.08)',
    200: 'rgba(255, 255, 255, 0.12)',
    300: 'rgba(255, 255, 255, 0.16)',
    400: 'rgba(255, 255, 255, 0.24)',
    500: 'rgba(255, 255, 255, 0.36)',
    600: 'rgba(255, 255, 255, 0.48)',
    700: 'rgba(255, 255, 255, 0.64)',
    800: 'rgba(255, 255, 255, 0.80)',
    900: 'rgba(255, 255, 255, 0.92)'
  },
  // Glow colors for effects
  glow: {
    teal: 'rgba(56, 178, 172, 0.4)',
    blue: 'rgba(0, 132, 255, 0.4)',
    purple: 'rgba(138, 75, 255, 0.4)'
  }
}

const fonts = {
  heading: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif',
  body: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace'
}

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global: (props: Record<string, any> | StyleFunctionProps) => ({
      '@import': "url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap')",
      'html, body': {
        bg: mode(
          'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
          'linear-gradient(135deg, #0a0f1a 0%, #0d1a3f 25%, #1a1a2e 50%, #16213e 75%, #0a0f1a 100%)'
        )(props),
        color: mode('#1a202c', '#f7fafc')(props),
        fontSize: 'sm',
        lineHeight: 'tall',
        fontFamily: fonts.body,
        height: 'fit-content',
        minHeight: '100vh',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: mode(
            'radial-gradient(ellipse at 50% 0%, rgba(56, 178, 172, 0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse at 50% 0%, rgba(56, 178, 172, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0, 132, 255, 0.1) 0%, transparent 40%)'
          )(props),
          pointerEvents: 'none',
          zIndex: -1
        }
      },
      a: {
        color: mode('#2c7a7b', '#81e6d9')(props),
        transition: 'color 0.2s ease',
        _hover: {
          color: mode('#319795', '#4fd1c5')(props),
          textDecoration: 'none'
        }
      },
      '::selection': {
        bg: 'brand.400',
        color: 'white'
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px'
      },
      '::-webkit-scrollbar-track': {
        bg: 'transparent'
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'whiteAlpha.300',
        borderRadius: 'full',
        '&:hover': {
          bg: 'whiteAlpha.400'
        }
      }
    })
  },
  components: {
    Card: defineStyleConfig({
      baseStyle: {
        container: {
          borderRadius: '2xl',
          fontSize: 'sm',
          bg: 'surface.100',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }
      },
      sizes: {
        sm: {
          container: {
            fontSize: 'sm',
            p: 4
          }
        },
        md: {
          container: {
            fontSize: 'md',
            p: 6
          }
        },
        lg: {
          container: {
            fontSize: 'lg',
            p: 8
          }
        }
      },
      defaultProps: {
        size: 'md'
      }
    }),
    Button: defineStyleConfig({
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'xl',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      variants: {
        brand: {
          bg: 'linear-gradient(135deg, #38b2ac 0%, #319795 50%, #2c7a7b 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(56, 178, 172, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(56, 178, 172, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            _disabled: {
              transform: 'none',
              boxShadow: 'none'
            }
          },
          _active: {
            transform: 'translateY(0)',
            boxShadow: '0 2px 10px rgba(56, 178, 172, 0.3)'
          }
        },
        accent: {
          bg: 'linear-gradient(135deg, #0084ff 0%, #006acc 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 132, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0, 132, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          },
          _active: {
            transform: 'translateY(0)',
            boxShadow: '0 2px 10px rgba(0, 132, 255, 0.3)'
          }
        },
        glass: {
          bg: 'whiteAlpha.100',
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
          _hover: {
            bg: 'whiteAlpha.200',
            borderColor: 'whiteAlpha.300',
            transform: 'translateY(-1px)'
          },
          _active: {
            bg: 'whiteAlpha.150',
            transform: 'translateY(0)'
          }
        },
        ghost: {
          color: 'brand.300',
          _hover: {
            bg: 'whiteAlpha.100',
            color: 'brand.200'
          }
        }
      },
      defaultProps: {
        variant: 'brand'
      }
    }),
    Input: defineStyleConfig({
      variants: {
        glass: {
          field: {
            bg: 'whiteAlpha.50',
            border: '1px solid',
            borderColor: 'whiteAlpha.200',
            borderRadius: 'xl',
            color: 'white',
            backdropFilter: 'blur(10px)',
            _placeholder: {
              color: 'whiteAlpha.500'
            },
            _hover: {
              borderColor: 'whiteAlpha.300'
            },
            _focus: {
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-400), 0 0 20px rgba(56, 178, 172, 0.2)'
            }
          }
        }
      },
      defaultProps: {
        variant: 'glass'
      }
    }),
    Modal: defineStyleConfig({
      baseStyle: {
        dialog: {
          bg: 'linear-gradient(135deg, rgba(13, 26, 63, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          borderRadius: '2xl',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        },
        header: {
          color: 'white',
          fontWeight: '700',
          fontSize: 'xl'
        },
        body: {
          color: 'whiteAlpha.900'
        },
        closeButton: {
          color: 'whiteAlpha.700',
          _hover: {
            bg: 'whiteAlpha.100',
            color: 'white'
          }
        }
      }
    }),
    Menu: defineStyleConfig({
      baseStyle: {
        list: {
          bg: 'linear-gradient(135deg, rgba(13, 26, 63, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          borderRadius: 'xl',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          py: 2
        },
        item: {
          bg: 'transparent',
          color: 'whiteAlpha.900',
          fontWeight: '500',
          _hover: {
            bg: 'whiteAlpha.100',
            color: 'brand.300'
          },
          _focus: {
            bg: 'whiteAlpha.100'
          }
        }
      }
    }),
    Heading: defineStyleConfig({
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.02em'
      }
    }),
    Text: defineStyleConfig({
      baseStyle: {
        letterSpacing: '-0.01em'
      }
    })
  }
})

export default theme
